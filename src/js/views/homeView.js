import { ApiService } from "../services/apiService.js"
import { AuthService } from "../services/authService.js"
import { SpoonacularService } from "../services/spoonacularService.js"

export class HomeView {
  constructor() {
    this.apiService = new ApiService()
    this.authService = new AuthService()
    this.spoonacularService = new SpoonacularService()
  }

  async render(container) {
    const currentUser = this.authService.getCurrentUser()

    // Get motivational quote
    const quotes = await this.apiService.get("/motivationalQuotes")
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

    // Get diet advice if user has preferences
    let dietAdvice = null
    if (currentUser.preferences?.dietType) {
      const adviceList = await this.apiService.get("/dietAdvice")
      dietAdvice = adviceList.find((advice) => advice.dietType === currentUser.preferences.dietType)
    }

    // Get recent recipes - usar Spoonacular si está disponible
    let recentRecipes = []
    let recipes = [] // Declare recipes variable here
    try {
      if (this.spoonacularService && this.spoonacularService.isConfigured()) {
        const spoonacularService = new (await import("../services/spoonacularService.js")).SpoonacularService()
        const data = await spoonacularService.getRandomRecipes({ number: 3 })
        recentRecipes = data.results
      } else {
        recipes = await this.apiService.get("/recipes")
        recentRecipes = recipes.slice(0, 3)
      }
    } catch (error) {
      console.error("Error loading recipes for home:", error)
      recipes = await this.apiService.get("/recipes")
      recentRecipes = recipes.slice(0, 3)
    }

    container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <!-- Welcome Section -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        ¡Hola, ${currentUser.name}!
                    </h1>
                    <p class="text-xl text-gray-600 dark:text-gray-400">
                        Bienvenido a tu cocina saludable
                    </p>
                </div>

                <!-- Motivational Quote -->
                <div class="bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg p-6 text-white mb-8">
                    <div class="text-center">
                        <i class="fas fa-quote-left text-2xl mb-4 opacity-75"></i>
                        <blockquote class="text-lg font-medium mb-4">
                            "${randomQuote.text}"
                        </blockquote>
                        <cite class="text-sm opacity-90">- ${randomQuote.author}</cite>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Diet Advice -->
                    ${
                      dietAdvice
                        ? `
                        <div class="lg:col-span-2">
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                    Consejo para tu dieta ${dietAdvice.dietType}
                                </h2>
                                <p class="text-gray-700 dark:text-gray-300 mb-4">
                                    ${dietAdvice.advice}
                                </p>
                                <div class="space-y-2">
                                    <h3 class="font-semibold text-gray-900 dark:text-white">Tips importantes:</h3>
                                    <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                        ${dietAdvice.tips.map((tip) => `<li>${tip}</li>`).join("")}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Quick Stats -->
                    <div class="${dietAdvice ? "" : "lg:col-span-3"}">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                <i class="fas fa-chart-bar text-primary-500 mr-2"></i>
                                Resumen rápido
                            </h2>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-700 dark:text-gray-300">Recetas disponibles</span>
                                    <span class="font-semibold text-primary-600 dark:text-primary-400">${recipes.length}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-700 dark:text-gray-300">Tu dieta</span>
                                    <span class="font-semibold text-primary-600 dark:text-primary-400 capitalize">
                                        ${currentUser.preferences?.dietType || "No especificada"}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-700 dark:text-gray-300">Último acceso</span>
                                    <span class="font-semibold text-primary-600 dark:text-primary-400">
                                        ${new Date(currentUser.lastLogin).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Recipes -->
                <div class="mt-12">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                            <i class="fas fa-fire text-orange-500 mr-2"></i>
                            Recetas populares
                        </h2>
                        <a href="#" data-route="recipes" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                            Ver todas <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${recentRecipes
                          .map(
                            (recipe) => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover">
                                <div class="p-6">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        ${recipe.title}
                                    </h3>
                                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        ${recipe.description}
                                    </p>
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <i class="fas fa-clock mr-1"></i>
                                            ${recipe.prepTime} min
                                        </div>
                                        <div class="flex space-x-1">
                                            ${recipe.dietType
                                              .map(
                                                (diet) => `
                                                <span class="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                                                    ${diet}
                                                </span>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `
  }

  destroy() {
    // Cleanup if needed
  }
}
