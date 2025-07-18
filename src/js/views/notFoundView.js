export class NotFoundView {
  constructor() {
    this.animations = ["animate-bounce", "animate-pulse", "animate-ping"]
  }

  render(container) {
    const randomAnimation = this.animations[Math.floor(Math.random() * this.animations.length)]

    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div class="max-w-2xl mx-auto text-center">
          <!-- 404 Icon -->
          <div class="mb-8">
            <div class="relative">
              <div class="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
                404
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <i class="fas fa-utensils text-6xl text-primary-500 ${randomAnimation}"></i>
              </div>
            </div>
          </div>

          <!-- Main Message -->
          <div class="mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Ups! Página no encontrada
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Parece que esta receta se ha quemado y ya no existe
            </p>
            <p class="text-gray-500 dark:text-gray-500">
              La página que buscas no se encuentra disponible o ha sido movida a otro lugar.
            </p>
          </div>

          <!-- Suggestions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
              ¿Qué puedes hacer?
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div class="flex items-start space-x-3">
                <i class="fas fa-home text-primary-500 mt-1"></i>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Ir al inicio</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Vuelve a la página principal</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-search text-green-500 mt-1"></i>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Buscar recetas</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Explora nuestro catálogo</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-random text-blue-500 mt-1"></i>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Receta aleatoria</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Déjate sorprender</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-arrow-left text-purple-500 mt-1"></i>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">Página anterior</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Regresa donde estabas</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button id="go-home" class="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <i class="fas fa-home mr-2"></i>
              Ir al Inicio
            </button>
            <button id="go-recipes" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <i class="fas fa-book mr-2"></i>
              Ver Recetas
            </button>
            <button id="go-back" class="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <i class="fas fa-arrow-left mr-2"></i>
              Volver Atrás
            </button>
          </div>

          <!-- Fun Facts -->
          <div class="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              <i class="fas fa-info-circle text-primary-500 mr-2"></i>
              ¿Sabías que...?
            </h3>
            <div id="fun-fact" class="text-gray-700 dark:text-gray-300">
              <!-- Fun fact will be loaded here -->
            </div>
            <button id="new-fact" class="mt-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
              <i class="fas fa-sync-alt mr-1"></i>
              Otro dato curioso
            </button>
          </div>

          <!-- Search Box -->
          <div class="mt-8">
            <div class="max-w-md mx-auto">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Buscabas algo específico?
              </label>
              <div class="flex">
                <input type="text" id="search-404" placeholder="Buscar recetas..." 
                       class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                <button id="search-404-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Error Code -->
          <div class="mt-8 text-xs text-gray-400 dark:text-gray-600">
            Error 404 - Página no encontrada | RecipeApp
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="fixed top-20 left-10 opacity-20 dark:opacity-10">
        <i class="fas fa-cookie-bite text-6xl text-yellow-400 animate-spin" style="animation-duration: 10s;"></i>
      </div>
      <div class="fixed bottom-20 right-10 opacity-20 dark:opacity-10">
        <i class="fas fa-pizza-slice text-6xl text-red-400 animate-bounce" style="animation-duration: 3s;"></i>
      </div>
      <div class="fixed top-1/2 left-5 opacity-20 dark:opacity-10">
        <i class="fas fa-ice-cream text-4xl text-pink-400 animate-pulse" style="animation-duration: 2s;"></i>
      </div>
      <div class="fixed bottom-1/3 left-1/4 opacity-20 dark:opacity-10">
        <i class="fas fa-hamburger text-5xl text-orange-400 animate-ping" style="animation-duration: 4s;"></i>
      </div>
    `

    this.setupEventListeners()
    this.loadFunFact()
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById("go-home")?.addEventListener("click", () => {
      this.navigateTo("home")
    })

    document.getElementById("go-recipes")?.addEventListener("click", () => {
      this.navigateTo("recipes")
    })

    document.getElementById("go-back")?.addEventListener("click", () => {
      window.history.back()
    })

    // Search functionality
    const searchInput = document.getElementById("search-404")
    const searchBtn = document.getElementById("search-404-btn")

    const performSearch = () => {
      const query = searchInput?.value.trim()
      if (query) {
        // Store search query and navigate to recipes
        sessionStorage.setItem("searchQuery", query)
        this.navigateTo("recipes")
      }
    }

    searchBtn?.addEventListener("click", performSearch)
    searchInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })

    // Fun fact button
    document.getElementById("new-fact")?.addEventListener("click", () => {
      this.loadFunFact()
    })

    // Add some keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "h" && !e.ctrlKey && !e.metaKey) {
        this.navigateTo("home")
      } else if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
        this.navigateTo("recipes")
      } else if (e.key === "Escape") {
        window.history.back()
      }
    })
  }

  navigateTo(route) {
    // Trigger navigation event
    const navLink = document.querySelector(`[data-route="${route}"]`)
    if (navLink) {
      navLink.click()
    }
  }

  loadFunFact() {
    const funFacts = [
      "El tomate fue considerado venenoso por los europeos durante 200 años porque los ricos morían después de comerlos. En realidad, el ácido del tomate filtraba el plomo de sus platos de peltre.",
      "La miel nunca se echa a perder. Los arqueólogos han encontrado miel comestible en tumbas egipcias de 3000 años de antigüedad.",
      "Los plátanos son bayas, pero las fresas no lo son. Botánicamente hablando, las fresas son frutas agregadas.",
      "El chocolate era tan valioso para los aztecas que lo usaban como moneda.",
      "Las zanahorias originalmente eran moradas, no naranjas. Las zanahorias naranjas fueron desarrolladas en Holanda en el siglo XVII.",
      "El wasabi real es tan raro que la mayoría de los restaurantes sirven rábano picante teñido de verde.",
      "Los cacahuetes no son frutos secos, son legumbres que crecen bajo tierra.",
      "El helado de vainilla contiene castóreo, una secreción de las glándulas anales del castor.",
      "Los pimientos rojos son simplemente pimientos verdes maduros.",
      "El brócoli, la coliflor, el repollo y las coles de Bruselas son todas variedades de la misma planta.",
      "Los arándanos rebotan cuando están frescos. De hecho, se les llama 'bounceberries' en inglés.",
      "El ketchup se vendía como medicina en la década de 1830.",
      "Las almendras son semillas, no frutos secos.",
      "El café es la segunda mercancía más comercializada en el mundo después del petróleo.",
      "Los humanos comparten el 60% de su ADN con los plátanos.",
      "El queso es el alimento más robado del mundo.",
      "Las papas fueron el primer vegetal cultivado en el espacio.",
      "El chile más picante del mundo es el Carolina Reaper, con más de 2.2 millones de unidades Scoville.",
    ]

    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    const factElement = document.getElementById("fun-fact")

    if (factElement) {
      // Add fade effect
      factElement.style.opacity = "0"
      setTimeout(() => {
        factElement.textContent = randomFact
        factElement.style.opacity = "1"
      }, 200)
    }
  }

  destroy() {
    // Remove keyboard event listener
    document.removeEventListener("keydown", this.handleKeydown)
  }
}
