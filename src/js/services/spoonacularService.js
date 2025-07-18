export class SpoonacularService {
  constructor() {
    // Obtener API key desde variable de entorno o usar una de prueba
    this.apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY || "b4f3eef36d2d49b99f2fada7dae1e209"
    this.baseURL = "https://api.spoonacular.com"
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  // Método genérico para hacer peticiones a la API
  async makeRequest(endpoint, params = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`

    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const url = new URL(`${this.baseURL}${endpoint}`)
      url.searchParams.append("apiKey", this.apiKey)

      // Agregar parámetros adicionales
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value)
        }
      })

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Límite de API alcanzado. Por favor, verifica tu plan de Spoonacular.")
        }
        throw new Error(`Error de API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Guardar en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      return data
    } catch (error) {
      console.error("Error en Spoonacular API:", error)
      throw error
    }
  }

  // Buscar recetas con filtros
  async searchRecipes(query = "", options = {}) {
    const params = {
      query,
      number: options.number || 12,
      offset: options.offset || 0,
      diet: options.diet,
      intolerances: options.intolerances,
      type: options.type,
      cuisine: options.cuisine,
      maxReadyTime: options.maxReadyTime,
      minCalories: options.minCalories,
      maxCalories: options.maxCalories,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      fillIngredients: true,
    }

    const data = await this.makeRequest("/recipes/complexSearch", params)
    return this.transformRecipeResults(data)
  }

  // Obtener recetas aleatorias
  async getRandomRecipes(options = {}) {
    const params = {
      number: options.number || 6,
      tags: options.tags,
      include_nutrition: true,
      include_ingredients: true,
    }

    const data = await this.makeRequest("/recipes/random", params)
    return this.transformRandomRecipes(data)
  }

  // Obtener información detallada de una receta
  async getRecipeInformation(id) {
    const params = {
      includeNutrition: true,
    }

    const data = await this.makeRequest(`/recipes/${id}/information`, params)
    return this.transformRecipeDetail(data)
  }

  // Buscar recetas por ingredientes
  async searchByIngredients(ingredients, options = {}) {
    const params = {
      ingredients: Array.isArray(ingredients) ? ingredients.join(",") : ingredients,
      number: options.number || 12,
      ranking: options.ranking || 1,
      ignorePantry: options.ignorePantry || true,
    }

    const data = await this.makeRequest("/recipes/findByIngredients", params)
    return this.transformIngredientResults(data)
  }

  // Obtener recetas similares
  async getSimilarRecipes(id, number = 3) {
    const data = await this.makeRequest(`/recipes/${id}/similar`, { number })
    return data
  }

  // Obtener información nutricional de una receta
  async getRecipeNutrition(id) {
    const data = await this.makeRequest(`/recipes/${id}/nutritionWidget.json`)
    return data
  }

  // Transformar resultados de búsqueda compleja
  transformRecipeResults(data) {
    return {
      results: data.results?.map((recipe) => this.transformRecipe(recipe)) || [],
      totalResults: data.totalResults || 0,
      offset: data.offset || 0,
      number: data.number || 0,
    }
  }

  // Transformar recetas aleatorias
  transformRandomRecipes(data) {
    return {
      results: data.recipes?.map((recipe) => this.transformRecipe(recipe)) || [],
      totalResults: data.recipes?.length || 0,
    }
  }

  // Transformar resultados de búsqueda por ingredientes
  transformIngredientResults(data) {
    return {
      results: data.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
        missedIngredients: recipe.missedIngredients,
        usedIngredients: recipe.usedIngredients,
        likes: recipe.likes || 0,
      })),
      totalResults: data.length,
    }
  }

  // Transformar una receta individual
  transformRecipe(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.summary ? this.stripHtml(recipe.summary).substring(0, 150) + "..." : "",
      image: recipe.image || "/placeholder.svg?height=300&width=400",
      prepTime: recipe.readyInMinutes || 0,
      servings: recipe.servings || 1,
      difficulty: this.calculateDifficulty(recipe),
      dietType: this.extractDietTypes(recipe),
      category: this.extractCategory(recipe),
      ingredients: this.extractIngredients(recipe),
      instructions: this.extractInstructions(recipe),
      nutrition: this.extractNutrition(recipe),
      sourceUrl: recipe.sourceUrl,
      spoonacularSourceUrl: recipe.spoonacularSourceUrl,
      likes: recipe.aggregateLikes || 0,
      healthScore: recipe.healthScore || 0,
      pricePerServing: recipe.pricePerServing || 0,
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
      diets: recipe.diets || [],
      occasions: recipe.occasions || [],
    }
  }

  // Transformar detalle completo de receta
  transformRecipeDetail(recipe) {
    const transformed = this.transformRecipe(recipe)

    return {
      ...transformed,
      extendedIngredients:
        recipe.extendedIngredients?.map((ing) => ({
          id: ing.id,
          name: ing.name,
          original: ing.original,
          amount: ing.amount,
          unit: ing.unit,
          image: ing.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}` : null,
        })) || [],
      winePairing: recipe.winePairing,
      taste: recipe.taste,
      summary: recipe.summary ? this.stripHtml(recipe.summary) : "",
    }
  }

  // Calcular dificultad basada en tiempo y pasos
  calculateDifficulty(recipe) {
    const time = recipe.readyInMinutes || 0
    const steps = recipe.analyzedInstructions?.[0]?.steps?.length || 0

    if (time <= 20 && steps <= 5) return "easy"
    if (time <= 45 && steps <= 10) return "medium"
    return "hard"
  }

  // Extraer tipos de dieta
  extractDietTypes(recipe) {
    const dietTypes = []

    if (recipe.vegetarian) dietTypes.push("vegetarian")
    if (recipe.vegan) dietTypes.push("vegan")
    if (recipe.glutenFree) dietTypes.push("gluten-free")
    if (recipe.dairyFree) dietTypes.push("dairy-free")
    if (recipe.veryHealthy) dietTypes.push("healthy")
    if (recipe.cheap) dietTypes.push("budget-friendly")
    if (recipe.veryPopular) dietTypes.push("popular")

    // Agregar dietas específicas de Spoonacular
    if (recipe.diets) {
      recipe.diets.forEach((diet) => {
        const normalizedDiet = diet.toLowerCase().replace(/\s+/g, "-")
        if (!dietTypes.includes(normalizedDiet)) {
          dietTypes.push(normalizedDiet)
        }
      })
    }

    return dietTypes.length > 0 ? dietTypes : ["general"]
  }

  // Extraer categoría principal
  extractCategory(recipe) {
    if (recipe.dishTypes && recipe.dishTypes.length > 0) {
      return recipe.dishTypes[0].toLowerCase().replace(/\s+/g, "-")
    }
    if (recipe.cuisines && recipe.cuisines.length > 0) {
      return recipe.cuisines[0].toLowerCase().replace(/\s+/g, "-")
    }
    return "general"
  }

  // Extraer ingredientes
  extractIngredients(recipe) {
    if (recipe.extendedIngredients) {
      return recipe.extendedIngredients.map((ing) => ing.original || ing.name)
    }
    return []
  }

  // Extraer instrucciones
  extractInstructions(recipe) {
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      const steps = recipe.analyzedInstructions[0].steps || []
      return steps.map((step) => step.step)
    }
    if (recipe.instructions) {
      return [this.stripHtml(recipe.instructions)]
    }
    return []
  }

  // Extraer información nutricional
  extractNutrition(recipe) {
    const defaultNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    }

    if (!recipe.nutrition || !recipe.nutrition.nutrients) {
      return defaultNutrition
    }

    const nutrients = recipe.nutrition.nutrients
    const findNutrient = (name) => {
      const nutrient = nutrients.find((n) => n.name.toLowerCase().includes(name.toLowerCase()))
      return nutrient ? Math.round(nutrient.amount) : 0
    }

    return {
      calories: findNutrient("calories"),
      protein: findNutrient("protein"),
      carbs: findNutrient("carbohydrates"),
      fat: findNutrient("fat"),
      fiber: findNutrient("fiber"),
      sugar: findNutrient("sugar"),
    }
  }

  // Limpiar HTML de las descripciones
  stripHtml(html) {
    if (!html) return ""
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, " ")
      .trim()
  }

  // Obtener sugerencias de autocompletado
  async getAutocompleteSuggestions(query, number = 5) {
    if (!query || query.length < 2) return []

    try {
      const data = await this.makeRequest("/recipes/autocomplete", {
        query,
        number,
      })
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        imageType: item.imageType,
      }))
    } catch (error) {
      console.error("Error getting autocomplete suggestions:", error)
      return []
    }
  }

  // Obtener ingredientes populares
  async getPopularIngredients(number = 20) {
    try {
      const data = await this.makeRequest("/food/ingredients/search", {
        query: "",
        number,
        sort: "popularity",
        sortDirection: "desc",
      })
      return data.results || []
    } catch (error) {
      console.error("Error getting popular ingredients:", error)
      return []
    }
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear()
  }

  // Verificar si la API key está configurada
  isConfigured() {
    return this.apiKey && this.apiKey !== "YOUR_API_KEY_HERE"
  }
}
