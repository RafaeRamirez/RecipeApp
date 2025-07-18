import { ApiService } from "../services/apiService.js"
import { SpoonacularService } from "../services/spoonacularService.js"
import { AuthService } from "../services/authService.js"
import { UIService } from "../services/uiService.js"

export class RecipesView {
  constructor() {
    this.apiService = new ApiService()
    this.spoonacularService = new SpoonacularService()
    this.authService = new AuthService()
    this.uiService = new UIService()
    this.recipes = []
    this.currentQuery = ""
    this.currentFilters = {}
    this.isLoading = false
    this.hasMore = true
    this.offset = 0
    this.searchTimeout = null
  }

  async render(container) {
    // Check if there's a search query from 404 page
    const searchQuery = sessionStorage.getItem("searchQuery")
    if (searchQuery) {
      sessionStorage.removeItem("searchQuery")
      // Set the search query and perform search after rendering
      setTimeout(() => {
        const searchInput = document.getElementById("search-input")
        if (searchInput) {
          searchInput.value = searchQuery
          this.handleSearch()
        }
      }, 100)
    }

    // Rest of the existing render method remains the same...
    container.innerHTML = `
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            <i class="fas fa-book text-primary-500 mr-2"></i>
            Explorar Recetas
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Descubre miles de recetas deliciosas de todo el mundo
          </p>
          ${
            !this.spoonacularService.isConfigured()
              ? `
            <div class="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded-lg">
              <p class="text-yellow-800 dark:text-yellow-200 text-sm">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Para usar recetas reales, configura tu API key de Spoonacular en las variables de entorno (VITE_SPOONACULAR_API_KEY)
              </p>
            </div>
          `
              : ""
          }
        </div>

        <!-- Search and Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <!-- Search -->
            <div class="lg:col-span-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="fas fa-search mr-1"></i>
                Buscar recetas
              </label>
              <div class="relative">
                <input type="text" id="search-input" 
                       placeholder="Ej: pasta, pollo, vegetariano..."
                       class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                <div id="search-suggestions" class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 hidden max-h-48 overflow-y-auto"></div>
              </div>
            </div>

            <!-- Diet Type Filter -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="fas fa-leaf mr-1"></i>
                Dieta
              </label>
              <select id="diet-filter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                <option value="">Todas</option>
                <option value="vegetarian">Vegetariana</option>
                <option value="vegan">Vegana</option>
                <option value="ketogenic">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="gluten free">Sin Gluten</option>
                <option value="dairy free">Sin Lácteos</option>
              </select>
            </div>

            <!-- Cuisine Filter -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="fas fa-globe mr-1"></i>
                Cocina
              </label>
              <select id="cuisine-filter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                <option value="">Todas</option>
                <option value="italian">Italiana</option>
                <option value="mexican">Mexicana</option>
                <option value="chinese">China</option>
                <option value="indian">India</option>
                <option value="mediterranean">Mediterránea</option>
                <option value="american">Americana</option>
                <option value="french">Francesa</option>
                <option value="thai">Tailandesa</option>
              </select>
            </div>

            <!-- Max Time Filter -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="fas fa-clock mr-1"></i>
                Tiempo máx.
              </label>
              <select id="time-filter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                <option value="">Sin límite</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
                <option value="120">2 horas</option>
              </select>
            </div>

            <!-- Search Button -->
            <div class="lg:col-span-2 flex items-end">
              <button id="search-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                <i class="fas fa-search mr-2"></i>
                Buscar
              </button>
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">Filtros rápidos:</span>
            <button class="quick-filter px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors" data-filter="healthy">
              <i class="fas fa-heart mr-1"></i>Saludable
            </button>
            <button class="quick-filter px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors" data-filter="quick">
              <i class="fas fa-bolt mr-1"></i>Rápido
            </button>
            <button class="quick-filter px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors" data-filter="cheap">
              <i class="fas fa-dollar-sign mr-1"></i>Económico
            </button>
            <button class="quick-filter px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors" data-filter="popular">
              <i class="fas fa-star mr-1"></i>Popular
            </button>
          </div>
        </div>

        <!-- Results Info -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <p class="text-gray-600 dark:text-gray-400">
              <span id="results-count">0</span> recetas encontradas
              <span id="search-info" class="hidden"> para "<span id="search-term"></span>"</span>
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button id="random-recipes" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
              <i class="fas fa-random mr-2"></i>
              Sorpréndeme
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="hidden">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${Array(6)
              .fill()
              .map(
                () => `
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div class="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
                <div class="p-6">
                  <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div class="flex justify-between">
                    <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- Recipes Grid -->
        <div id="recipes-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Recipes will be loaded here -->
        </div>

        <!-- Load More Button -->
        <div id="load-more-container" class="text-center mt-8 hidden">
          <button id="load-more-btn" class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            <i class="fas fa-plus mr-2"></i>
            Cargar más recetas
          </button>
        </div>

        <!-- No Results -->
        <div id="no-results" class="hidden text-center py-12">
          <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron recetas
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Intenta ajustar tus filtros de búsqueda o términos
          </p>
          <button id="clear-filters" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <i class="fas fa-eraser mr-2"></i>
            Limpiar filtros
          </button>
        </div>

        <!-- Error State -->
        <div id="error-state" class="hidden text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar recetas
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Hubo un problema al conectar con el servicio de recetas
          </p>
          <button id="retry-search" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <i class="fas fa-redo mr-2"></i>
            Intentar de nuevo
          </button>
        </div>
      </div>

      <!-- Recipe Modal -->
      <div id="recipe-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div id="modal-content">
            <!-- Modal content will be inserted here -->
          </div>
        </div>
      </div>
    `

    await this.loadInitialRecipes()
    this.setupEventListeners()
  }

  async loadInitialRecipes() {
    try {
      this.showLoading()

      if (this.spoonacularService.isConfigured()) {
        // Cargar recetas aleatorias de Spoonacular
        const data = await this.spoonacularService.getRandomRecipes({ number: 12 })
        this.recipes = data.results
        this.updateRecipesDisplay()
      } else {
        // Fallback a datos locales
        const localRecipes = await this.apiService.get("/recipes")
        this.recipes = localRecipes
        this.updateRecipesDisplay()
      }
    } catch (error) {
      console.error("Error loading initial recipes:", error)
      this.showError()
    }
  }

  setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById("search-input")
    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch()
      }, 500)
    })

    // Search suggestions
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.length >= 2) {
        this.showSearchSuggestions(searchInput.value)
      }
    })

    // Filter changes
    document.getElementById("diet-filter").addEventListener("change", this.handleSearch.bind(this))
    document.getElementById("cuisine-filter").addEventListener("change", this.handleSearch.bind(this))
    document.getElementById("time-filter").addEventListener("change", this.handleSearch.bind(this))

    // Search button
    document.getElementById("search-btn").addEventListener("click", this.handleSearch.bind(this))

    // Quick filters
    document.querySelectorAll(".quick-filter").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.closest(".quick-filter").dataset.filter
        this.applyQuickFilter(filter)
      })
    })

    // Random recipes
    document.getElementById("random-recipes").addEventListener("click", this.loadRandomRecipes.bind(this))

    // Load more
    document.getElementById("load-more-btn").addEventListener("click", this.loadMoreRecipes.bind(this))

    // Clear filters
    document.getElementById("clear-filters").addEventListener("click", this.clearFilters.bind(this))

    // Retry search
    document.getElementById("retry-search").addEventListener("click", this.handleSearch.bind(this))

    // Recipe cards
    document.addEventListener("click", (e) => {
      const recipeCard = e.target.closest(".recipe-card")
      if (recipeCard) {
        const recipeId = recipeCard.dataset.recipeId
        this.showRecipeModal(recipeId)
      }
    })

    // Close modal
    document.getElementById("recipe-modal").addEventListener("click", (e) => {
      if (e.target.id === "recipe-modal") {
        this.closeRecipeModal()
      }
    })

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#search-input") && !e.target.closest("#search-suggestions")) {
        document.getElementById("search-suggestions").classList.add("hidden")
      }
    })
  }

  async handleSearch() {
    if (this.isLoading) return

    this.offset = 0
    this.hasMore = true

    const query = document.getElementById("search-input").value.trim()
    const diet = document.getElementById("diet-filter").value
    const cuisine = document.getElementById("cuisine-filter").value
    const maxTime = document.getElementById("time-filter").value

    this.currentQuery = query
    this.currentFilters = { diet, cuisine, maxTime }

    try {
      this.showLoading()

      if (this.spoonacularService.isConfigured()) {
        const options = {
          number: 12,
          offset: this.offset,
          diet: diet || undefined,
          cuisine: cuisine || undefined,
          maxReadyTime: maxTime || undefined,
        }

        const data = await this.spoonacularService.searchRecipes(query, options)
        this.recipes = data.results
        this.hasMore = data.totalResults > data.results.length
      } else {
        // Fallback search in local data
        const localRecipes = await this.apiService.get("/recipes")
        this.recipes = this.filterLocalRecipes(localRecipes, { query, diet, cuisine, maxTime })
        this.hasMore = false
      }

      this.updateRecipesDisplay()
      this.updateSearchInfo(query)
    } catch (error) {
      console.error("Error searching recipes:", error)
      this.showError()
    }
  }

  async loadMoreRecipes() {
    if (this.isLoading || !this.hasMore) return

    this.offset += 12

    try {
      this.isLoading = true
      document.getElementById("load-more-btn").innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cargando...'

      const options = {
        number: 12,
        offset: this.offset,
        ...this.currentFilters,
      }

      const data = await this.spoonacularService.searchRecipes(this.currentQuery, options)
      this.recipes = [...this.recipes, ...data.results]
      this.hasMore = this.offset + data.results.length < data.totalResults

      this.updateRecipesDisplay()
    } catch (error) {
      console.error("Error loading more recipes:", error)
      this.uiService.showNotification("Error al cargar más recetas", "error")
    } finally {
      this.isLoading = false
      document.getElementById("load-more-btn").innerHTML = '<i class="fas fa-plus mr-2"></i>Cargar más recetas'
    }
  }

  async loadRandomRecipes() {
    try {
      this.showLoading()

      if (this.spoonacularService.isConfigured()) {
        const data = await this.spoonacularService.getRandomRecipes({ number: 12 })
        this.recipes = data.results
      } else {
        const localRecipes = await this.apiService.get("/recipes")
        this.recipes = this.shuffleArray([...localRecipes])
      }

      this.updateRecipesDisplay()
      this.updateSearchInfo("")
      this.uiService.showNotification("¡Nuevas recetas cargadas!", "success")
    } catch (error) {
      console.error("Error loading random recipes:", error)
      this.showError()
    }
  }

  async showSearchSuggestions(query) {
    if (!this.spoonacularService.isConfigured() || query.length < 2) return

    try {
      const suggestions = await this.spoonacularService.getAutocompleteSuggestions(query, 5)
      const suggestionsContainer = document.getElementById("search-suggestions")

      if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions
          .map(
            (suggestion) => `
          <div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer suggestion-item" data-title="${suggestion.title}">
            <i class="fas fa-search mr-2 text-gray-400"></i>
            ${suggestion.title}
          </div>
        `,
          )
          .join("")

        // Add click handlers for suggestions
        suggestionsContainer.querySelectorAll(".suggestion-item").forEach((item) => {
          item.addEventListener("click", (e) => {
            const title = e.target.dataset.title
            document.getElementById("search-input").value = title
            suggestionsContainer.classList.add("hidden")
            this.handleSearch()
          })
        })

        suggestionsContainer.classList.remove("hidden")
      } else {
        suggestionsContainer.classList.add("hidden")
      }
    } catch (error) {
      console.error("Error getting suggestions:", error)
    }
  }

  applyQuickFilter(filter) {
    const searchInput = document.getElementById("search-input")

    switch (filter) {
      case "healthy":
        searchInput.value = "healthy"
        break
      case "quick":
        document.getElementById("time-filter").value = "30"
        break
      case "cheap":
        searchInput.value = "cheap"
        break
      case "popular":
        searchInput.value = "popular"
        break
    }

    this.handleSearch()
  }

  clearFilters() {
    document.getElementById("search-input").value = ""
    document.getElementById("diet-filter").value = ""
    document.getElementById("cuisine-filter").value = ""
    document.getElementById("time-filter").value = ""

    this.loadInitialRecipes()
  }

  filterLocalRecipes(recipes, filters) {
    return recipes.filter((recipe) => {
      // Query filter
      if (filters.query) {
        const query = filters.query.toLowerCase()
        const matchesTitle = recipe.title.toLowerCase().includes(query)
        const matchesIngredients = recipe.ingredients.some((ing) => ing.toLowerCase().includes(query))
        if (!matchesTitle && !matchesIngredients) return false
      }

      // Diet filter
      if (filters.diet && !recipe.dietType.includes(filters.diet)) {
        return false
      }

      // Time filter
      if (filters.maxTime && recipe.prepTime > Number.parseInt(filters.maxTime)) {
        return false
      }

      return true
    })
  }

  updateRecipesDisplay() {
    const recipesGrid = document.getElementById("recipes-grid")
    const noResults = document.getElementById("no-results")
    const loadMoreContainer = document.getElementById("load-more-container")
    const resultsCount = document.getElementById("results-count")

    this.hideLoading()
    this.hideError()

    resultsCount.textContent = this.recipes.length

    if (this.recipes.length === 0) {
      recipesGrid.classList.add("hidden")
      noResults.classList.remove("hidden")
      loadMoreContainer.classList.add("hidden")
    } else {
      recipesGrid.classList.remove("hidden")
      noResults.classList.add("hidden")
      recipesGrid.innerHTML = this.renderRecipeCards()

      // Show/hide load more button
      if (this.hasMore && this.spoonacularService.isConfigured()) {
        loadMoreContainer.classList.remove("hidden")
      } else {
        loadMoreContainer.classList.add("hidden")
      }
    }
  }

  renderRecipeCards() {
    return this.recipes
      .map(
        (recipe) => `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer recipe-card" data-recipe-id="${recipe.id}">
        <div class="relative">
          <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover">
          ${
            recipe.healthScore
              ? `
            <div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              <i class="fas fa-heart mr-1"></i>${recipe.healthScore}
            </div>
          `
              : ""
          }
          ${
            recipe.likes
              ? `
            <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              <i class="fas fa-thumbs-up mr-1"></i>${recipe.likes}
            </div>
          `
              : ""
          }
        </div>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            ${recipe.title}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            ${recipe.description}
          </p>
          
          <!-- Recipe Info -->
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <i class="fas fa-clock mr-1"></i>
              ${recipe.prepTime} min
            </div>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <i class="fas fa-users mr-1"></i>
              ${recipe.servings || 1} porción${recipe.servings > 1 ? "es" : ""}
            </div>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <i class="fas fa-signal mr-1"></i>
              <span class="capitalize">${recipe.difficulty}</span>
            </div>
          </div>

          <!-- Diet Tags -->
          <div class="flex flex-wrap gap-1 mb-4">
            ${recipe.dietType
              .slice(0, 3)
              .map(
                (diet) => `
              <span class="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                ${diet}
              </span>
            `,
              )
              .join("")}
            ${
              recipe.dietType.length > 3
                ? `
              <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +${recipe.dietType.length - 3}
              </span>
            `
                : ""
            }
          </div>

          <!-- Nutrition Info -->
          <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Calorías: ${recipe.nutrition.calories}</div>
            <div>Proteína: ${recipe.nutrition.protein}g</div>
            <div>Carbos: ${recipe.nutrition.carbs}g</div>
            <div>Grasas: ${recipe.nutrition.fat}g</div>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  async showRecipeModal(recipeId) {
    const modal = document.getElementById("recipe-modal")
    const modalContent = document.getElementById("modal-content")

    try {
      // Show loading in modal
      modalContent.innerHTML = `
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Cargando receta...</p>
        </div>
      `
      modal.classList.remove("hidden")

      let recipe
      if (this.spoonacularService.isConfigured()) {
        recipe = await this.spoonacularService.getRecipeInformation(recipeId)
      } else {
        recipe = this.recipes.find((r) => r.id == recipeId)
      }

      if (!recipe) {
        throw new Error("Receta no encontrada")
      }

      modalContent.innerHTML = this.renderRecipeModal(recipe)
    } catch (error) {
      console.error("Error loading recipe details:", error)
      modalContent.innerHTML = `
        <div class="p-8 text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
          <p class="text-gray-600 dark:text-gray-400">No se pudo cargar la receta</p>
          <button onclick="document.getElementById('recipe-modal').classList.add('hidden')" 
                  class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            Cerrar
          </button>
        </div>
      `
    }
  }

  renderRecipeModal(recipe) {
    return `
      <div class="relative">
        <button class="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onclick="document.getElementById('recipe-modal').classList.add('hidden')">
          <i class="fas fa-times text-gray-600 dark:text-gray-400"></i>
        </button>
        
        <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-64 object-cover rounded-t-lg">
        
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              ${recipe.title}
            </h2>
            ${
              recipe.sourceUrl
                ? `
              <a href="${recipe.sourceUrl}" target="_blank" 
                 class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                <i class="fas fa-external-link-alt mr-1"></i>
                Ver original
              </a>
            `
                : ""
            }
          </div>
          
          ${
            recipe.summary
              ? `
            <div class="mb-6 text-gray-600 dark:text-gray-400">
              ${recipe.summary.substring(0, 300)}...
            </div>
          `
              : `
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              ${recipe.description}
            </p>
          `
          }

          <!-- Recipe Info Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-center">
              <i class="fas fa-clock text-primary-500 text-xl mb-2"></i>
              <div class="text-sm text-gray-600 dark:text-gray-400">Tiempo</div>
              <div class="font-semibold text-gray-900 dark:text-white">${recipe.prepTime} min</div>
            </div>
            <div class="text-center">
              <i class="fas fa-users text-primary-500 text-xl mb-2"></i>
              <div class="text-sm text-gray-600 dark:text-gray-400">Porciones</div>
              <div class="font-semibold text-gray-900 dark:text-white">${recipe.servings || 1}</div>
            </div>
            <div class="text-center">
              <i class="fas fa-signal text-primary-500 text-xl mb-2"></i>
              <div class="text-sm text-gray-600 dark:text-gray-400">Dificultad</div>
              <div class="font-semibold text-gray-900 dark:text-white capitalize">${recipe.difficulty}</div>
            </div>
            <div class="text-center">
              <i class="fas fa-fire text-primary-500 text-xl mb-2"></i>
              <div class="text-sm text-gray-600 dark:text-gray-400">Calorías</div>
              <div class="font-semibold text-gray-900 dark:text-white">${recipe.nutrition.calories}</div>
            </div>
          </div>

          <!-- Diet Tags -->
          <div class="flex flex-wrap gap-2 mb-6">
            ${recipe.dietType
              .map(
                (diet) => `
              <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full">
                ${diet}
              </span>
            `,
              )
              .join("")}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Ingredients -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i class="fas fa-list-ul text-primary-500 mr-2"></i>
                Ingredientes
              </h3>
              <ul class="space-y-2">
                ${recipe.ingredients
                  .map(
                    (ingredient) => `
                  <li class="flex items-start text-gray-700 dark:text-gray-300">
                    <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                    <span>${ingredient}</span>
                  </li>
                `,
                  )
                  .join("")}
              </ul>
            </div>

            <!-- Instructions -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i class="fas fa-clipboard-list text-primary-500 mr-2"></i>
                Instrucciones
              </h3>
              <ol class="space-y-3">
                ${recipe.instructions
                  .map(
                    (instruction, index) => `
                  <li class="flex text-gray-700 dark:text-gray-300">
                    <span class="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      ${index + 1}
                    </span>
                    <span>${instruction}</span>
                  </li>
                `,
                  )
                  .join("")}
              </ol>
            </div>
          </div>

          <!-- Nutrition -->
          <div class="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i class="fas fa-chart-pie text-primary-500 mr-2"></i>
              Información Nutricional (por porción)
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.calories}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Calorías</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.protein}g</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Proteína</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.carbs}g</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Carbohidratos</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.fat}g</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Grasas</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.fiber || 0}g</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Fibra</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${recipe.nutrition.sugar || 0}g</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Azúcar</div>
              </div>
            </div>
          </div>

          ${
            recipe.cuisines && recipe.cuisines.length > 0
              ? `
            <div class="mt-6">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Cocinas:</h4>
              <div class="flex flex-wrap gap-2">
                ${recipe.cuisines
                  .map(
                    (cuisine) => `
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                    ${cuisine}
                  </span>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }

          ${
            recipe.dishTypes && recipe.dishTypes.length > 0
              ? `
            <div class="mt-4">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Tipos de plato:</h4>
              <div class="flex flex-wrap gap-2">
                ${recipe.dishTypes
                  .map(
                    (type) => `
                  <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded">
                    ${type}
                  </span>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
  }

  updateSearchInfo(query) {
    const searchInfo = document.getElementById("search-info")
    const searchTerm = document.getElementById("search-term")

    if (query) {
      searchTerm.textContent = query
      searchInfo.classList.remove("hidden")
    } else {
      searchInfo.classList.add("hidden")
    }
  }

  showLoading() {
    document.getElementById("loading-state").classList.remove("hidden")
    document.getElementById("recipes-grid").classList.add("hidden")
    document.getElementById("no-results").classList.add("hidden")
    document.getElementById("error-state").classList.add("hidden")
    this.isLoading = true
  }

  hideLoading() {
    document.getElementById("loading-state").classList.add("hidden")
    this.isLoading = false
  }

  showError() {
    document.getElementById("error-state").classList.remove("hidden")
    document.getElementById("recipes-grid").classList.add("hidden")
    document.getElementById("no-results").classList.add("hidden")
    document.getElementById("loading-state").classList.add("hidden")
  }

  hideError() {
    document.getElementById("error-state").classList.add("hidden")
  }

  closeRecipeModal() {
    document.getElementById("recipe-modal").classList.add("hidden")
  }

  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
