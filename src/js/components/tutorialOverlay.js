export class TutorialOverlay {
  constructor() {
    this.currentStep = 0
    this.steps = []
    this.isActive = false
  }

  init() {
    this.createOverlay()
  }

  createOverlay() {
    const overlay = document.createElement("div")
    overlay.id = "tutorial-overlay"
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 z-[100] hidden"
    overlay.innerHTML = `
      <div id="tutorial-spotlight" class="absolute bg-white rounded-lg shadow-2xl transition-all duration-500"></div>
      <div id="tutorial-tooltip" class="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm transition-all duration-500">
        <div class="flex items-start justify-between mb-4">
          <h3 id="tutorial-title" class="text-lg font-semibold text-gray-900 dark:text-white"></h3>
          <button id="tutorial-close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p id="tutorial-description" class="text-gray-600 dark:text-gray-400 mb-6"></p>
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <button id="tutorial-prev" class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>Anterior
            </button>
            <button id="tutorial-next" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Siguiente<i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
          <span id="tutorial-progress" class="text-sm text-gray-500 dark:text-gray-400"></span>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    this.setupEventListeners()
  }

  setupEventListeners() {
    document.getElementById("tutorial-close").addEventListener("click", () => {
      this.end()
    })

    document.getElementById("tutorial-prev").addEventListener("click", () => {
      this.previousStep()
    })

    document.getElementById("tutorial-next").addEventListener("click", () => {
      this.nextStep()
    })

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isActive) {
        this.end()
      }
    })
  }

  start(steps) {
    this.steps = steps
    this.currentStep = 0
    this.isActive = true

    document.getElementById("tutorial-overlay").classList.remove("hidden")
    this.showStep(0)
  }

  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return

    const step = this.steps[stepIndex]
    const element = document.querySelector(step.target)

    if (!element) {
      console.warn(`Tutorial target not found: ${step.target}`)
      return
    }

    // Update spotlight
    this.updateSpotlight(element)

    // Update tooltip
    this.updateTooltip(step, stepIndex)

    // Update navigation buttons
    this.updateNavigation(stepIndex)
  }

  updateSpotlight(element) {
    const rect = element.getBoundingClientRect()
    const spotlight = document.getElementById("tutorial-spotlight")

    spotlight.style.left = `${rect.left - 10}px`
    spotlight.style.top = `${rect.top - 10}px`
    spotlight.style.width = `${rect.width + 20}px`
    spotlight.style.height = `${rect.height + 20}px`
  }

  updateTooltip(step, stepIndex) {
    const tooltip = document.getElementById("tutorial-tooltip")
    const element = document.querySelector(step.target)
    const rect = element.getBoundingClientRect()

    // Position tooltip
    let left = rect.right + 20
    let top = rect.top

    // Adjust if tooltip would go off screen
    if (left + 300 > window.innerWidth) {
      left = rect.left - 320
    }

    if (top + 200 > window.innerHeight) {
      top = window.innerHeight - 220
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`

    // Update content
    document.getElementById("tutorial-title").textContent = step.title
    document.getElementById("tutorial-description").textContent = step.description
    document.getElementById("tutorial-progress").textContent = `${stepIndex + 1} de ${this.steps.length}`
  }

  updateNavigation(stepIndex) {
    const prevBtn = document.getElementById("tutorial-prev")
    const nextBtn = document.getElementById("tutorial-next")

    prevBtn.style.display = stepIndex === 0 ? "none" : "block"
    nextBtn.textContent = stepIndex === this.steps.length - 1 ? "Finalizar" : "Siguiente"
    nextBtn.innerHTML =
      stepIndex === this.steps.length - 1
        ? 'Finalizar<i class="fas fa-check ml-2"></i>'
        : 'Siguiente<i class="fas fa-arrow-right ml-2"></i>'
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
      this.showStep(this.currentStep)
    } else {
      this.end()
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.showStep(this.currentStep)
    }
  }

  end() {
    this.isActive = false
    document.getElementById("tutorial-overlay").classList.add("hidden")

    // Mark tutorial as completed
    localStorage.setItem("tutorial_completed", "true")
  }

  // Predefined tutorials
  getHomeTutorial() {
    return [
      {
        target: '[data-route="home"]',
        title: "¡Bienvenido a RecipeApp!",
        description: "Esta es tu página de inicio donde encontrarás consejos personalizados y recetas populares.",
      },
      {
        target: '[data-route="recipes"]',
        title: "Explorar Recetas",
        description: "Aquí puedes buscar entre miles de recetas, filtrar por dieta, cocina y tiempo de preparación.",
      },
      {
        target: "#theme-toggle",
        title: "Modo Oscuro",
        description: "Cambia entre modo claro y oscuro para una mejor experiencia visual.",
      },
      {
        target: "#chat-toggle",
        title: "ChefBot - Tu Asistente",
        description: "Haz clic aquí para chatear conmigo. Puedo ayudarte con recetas, consejos de cocina y más.",
      },
    ]
  }

  getRecipesTutorial() {
    return [
      {
        target: "#search-input",
        title: "Búsqueda Inteligente",
        description: "Busca recetas por nombre, ingredientes o tipo de cocina. Incluye autocompletado.",
      },
      {
        target: "#diet-filter",
        title: "Filtros de Dieta",
        description: "Filtra recetas según tu dieta: vegetariana, vegana, keto, sin gluten, etc.",
      },
      {
        target: ".quick-filter",
        title: "Filtros Rápidos",
        description: "Usa estos botones para búsquedas rápidas: saludable, rápido, económico, popular.",
      },
      {
        target: "#random-recipes",
        title: "Sorpréndeme",
        description: "Descubre recetas aleatorias cuando no sepas qué cocinar.",
      },
    ]
  }
}
