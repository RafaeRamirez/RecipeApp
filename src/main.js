import { Router } from "./js/router.js"
import { AuthService } from "./js/services/authService.js"
import { ThemeService } from "./js/services/themeService.js"
import { UIService } from "./js/services/uiService.js"
import { WelcomeView } from "./js/views/welcomeView.js"
import { ChatbotWidget } from "./js/components/chatbotWidget.js"
import { TutorialOverlay } from "./js/components/tutorialOverlay.js"
import { TooltipManager } from "./js/components/tooltipManager.js"
import { DebugHelper } from "./utils/debugHelper.js"

// Add debug helper to window for console access
window.DebugHelper = DebugHelper

class App {
  constructor() {
    this.router = new Router()
    this.authService = new AuthService()
    this.themeService = new ThemeService()
    this.uiService = new UIService()
    this.welcomeView = new WelcomeView()
    this.chatbotWidget = new ChatbotWidget()
    this.tutorialOverlay = new TutorialOverlay()
    this.tooltipManager = new TooltipManager()

    this.init()
  }

  async init() {
    // Initialize theme
    this.themeService.init()

    // Initialize UI components
    this.tooltipManager.init()
    this.tutorialOverlay.init()

    // Check if user is logged in
    const currentUser = this.authService.getCurrentUser()

    if (currentUser) {
      this.showApp()
      this.router.init()

      // Initialize chatbot after app is shown
      this.chatbotWidget.init()

      // Show tutorial for new users
      this.checkAndShowTutorial()
    } else {
      this.showLogin()
    }

    this.setupEventListeners()
    this.addProfessionalEnhancements()
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      this.themeService.toggle()
    })
    document.getElementById("theme-toggle-mobile")?.addEventListener("click", () => {
      this.themeService.toggle()
    })

    // Mobile menu
    document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
      this.uiService.toggleMobileMenu()
    })

    // Navigation links
    document.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-route")) {
        e.preventDefault()
        const route = e.target.getAttribute("data-route")
        this.router.navigate(route)
        this.uiService.closeMobileMenu()
      }
    })

    // Help button
    document.addEventListener("click", (e) => {
      if (e.target.closest("#help-btn")) {
        this.showHelp()
      }
    })

    // Logout buttons - Set up after app is shown
    this.setupLogoutListeners()
  }

  setupLogoutListeners() {
    // Remove existing listeners to prevent duplicates
    const logoutBtn = document.getElementById("logout-btn")
    const logoutBtnMobile = document.getElementById("logout-btn-mobile")

    if (logoutBtn) {
      logoutBtn.replaceWith(logoutBtn.cloneNode(true))
      document.getElementById("logout-btn").addEventListener("click", this.handleLogout.bind(this))
    }

    if (logoutBtnMobile) {
      logoutBtnMobile.replaceWith(logoutBtnMobile.cloneNode(true))
      document.getElementById("logout-btn-mobile").addEventListener("click", this.handleLogout.bind(this))
    }
  }

  setupLoginListeners() {
    // Login form
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
      // Remove existing listener to prevent duplicates
      const newLoginForm = loginForm.cloneNode(true)
      loginForm.parentNode.replaceChild(newLoginForm, loginForm)

      document.getElementById("login-form").addEventListener("submit", this.handleLogin.bind(this))
    }

    // Register form
    const registerForm = document.getElementById("register-form")
    if (registerForm) {
      // Remove existing listener to prevent duplicates
      const newRegisterForm = registerForm.cloneNode(true)
      registerForm.parentNode.replaceChild(newRegisterForm, registerForm)

      document.getElementById("register-form").addEventListener("submit", this.handleRegister.bind(this))
    }
  }

  async handleLogin(e) {
    e.preventDefault()
    DebugHelper.log("Login form submitted")

    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")

    DebugHelper.log("Login attempt", { email, passwordLength: password?.length })

    if (!email || !password) {
      this.uiService.showNotification("Por favor, completa todos los campos", "error")
      return
    }

    try {
      // Show loading
      this.uiService.showLoadingOverlay("Iniciando sesión...")

      const user = await this.authService.login(email, password)
      DebugHelper.log("Login result", { success: !!user, user: user?.name })

      if (user) {
        this.uiService.hideLoadingOverlay()
        this.showApp()
        this.router.init()

        // Initialize chatbot
        this.chatbotWidget.init()

        this.uiService.showNotification(`¡Bienvenido ${user.name}!`, "success")

        // Show tutorial for new users
        this.checkAndShowTutorial()
      } else {
        this.uiService.hideLoadingOverlay()
        this.uiService.showNotification("Credenciales incorrectas", "error")
      }
    } catch (error) {
      DebugHelper.error("Login error", error)
      this.uiService.hideLoadingOverlay()
      this.uiService.showNotification(error.message || "Error al iniciar sesión", "error")
    }
  }

  async handleRegister(e) {
    e.preventDefault()
    const formData = new FormData(e.target)

    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      dietType: formData.get("dietType"),
      acceptTerms: formData.get("acceptTerms"),
    }

    // Validation
    if (userData.password !== userData.confirmPassword) {
      this.uiService.showNotification("Las contraseñas no coinciden", "error")
      return
    }

    if (userData.password.length < 6) {
      this.uiService.showNotification("La contraseña debe tener al menos 6 caracteres", "error")
      return
    }

    if (!userData.acceptTerms) {
      this.uiService.showNotification("Debes aceptar los términos y condiciones", "error")
      return
    }

    try {
      // Show loading
      this.uiService.showLoadingOverlay("Creando cuenta...")

      const user = await this.authService.register(userData)
      if (user) {
        this.uiService.hideLoadingOverlay()
        this.showApp()
        this.router.init()

        // Initialize chatbot
        this.chatbotWidget.init()

        this.uiService.showNotification(`¡Bienvenido ${user.name}! Tu cuenta ha sido creada exitosamente.`, "success")

        // Always show tutorial for new registered users
        setTimeout(() => {
          this.startTutorial()
        }, 2000)
      }
    } catch (error) {
      this.uiService.hideLoadingOverlay()
      this.uiService.showNotification(error.message || "Error al crear la cuenta", "error")
    }
  }

  handleLogout() {
    this.authService.logout()
    this.showLogin()
    this.uiService.showNotification("Sesión cerrada", "info")
  }

  showLogin() {
    document.getElementById("login-screen").classList.remove("hidden")
    document.getElementById("app-content").classList.add("hidden")
    document.getElementById("navbar").classList.add("hidden")

    // Initialize welcome view
    this.welcomeView.render()

    // Set up login form listeners after welcome view is rendered
    setTimeout(() => {
      this.setupLoginListeners()
    }, 100)
  }

  showApp() {
    document.getElementById("login-screen").classList.add("hidden")
    document.getElementById("app-content").classList.remove("hidden")
    document.getElementById("navbar").classList.remove("hidden")

    // Show/hide admin navigation based on user role
    const currentUser = this.authService.getCurrentUser()
    const adminNav = document.getElementById("admin-nav")
    const adminNavMobile = document.getElementById("admin-nav-mobile")

    if (currentUser && currentUser.role === "admin") {
      adminNav?.classList.remove("hidden")
      adminNavMobile?.classList.remove("hidden")
    } else {
      adminNav?.classList.add("hidden")
      adminNavMobile?.classList.add("hidden")
    }

    // Add help button to navbar
    this.addHelpButton()

    // Setup logout listeners
    this.setupLogoutListeners()
  }

  addHelpButton() {
    const navbar = document.querySelector("#navbar .hidden.md\\:flex")
    if (navbar && !document.getElementById("help-btn")) {
      const helpBtn = document.createElement("button")
      helpBtn.id = "help-btn"
      helpBtn.className =
        "p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>'
      helpBtn.setAttribute("data-tooltip", "Ayuda y tutorial")

      navbar.insertBefore(helpBtn, document.getElementById("theme-toggle"))
    }
  }

  checkAndShowTutorial() {
    const tutorialCompleted = localStorage.getItem("tutorial_completed")
    if (!tutorialCompleted) {
      setTimeout(() => {
        this.startTutorial()
      }, 3000)
    }
  }

  startTutorial() {
    const currentRoute = window.location.hash.replace("#", "") || "home"
    let steps

    switch (currentRoute) {
      case "recipes":
        steps = this.tutorialOverlay.getRecipesTutorial()
        break
      default:
        steps = this.tutorialOverlay.getHomeTutorial()
    }

    this.tutorialOverlay.start(steps)
  }

  showHelp() {
    const modal = this.uiService.createModal(
      "Centro de Ayuda",
      `
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button id="start-tutorial" class="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg text-left hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
              <i class="fas fa-play-circle text-primary-600 dark:text-primary-400 text-xl mb-2"></i>
              <h3 class="font-semibold text-gray-900 dark:text-white">Tutorial Interactivo</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Aprende a usar todas las funciones</p>
            </button>
            
            <button id="open-chat" class="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-left hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
              <i class="fas fa-robot/js/components text-green-600 dark:text-green-400 text-xl mb-2"></i>
              <h3 class="font-semibold text-gray-900 dark:text-white">ChefBot</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pregunta sobre recetas y cocina</p>
            </button>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Atajos de Teclado</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Ir al inicio</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">H</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Ver recetas</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">R</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Cambiar tema</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl + D</kbd>
              </div>
            </div>
          </div>
        </div>
      `,
      [
        {
          text: "Cerrar",
          class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
          onclick: 'this.closest(".fixed").remove()',
        },
      ],
    )

    // Add event listeners for help actions
    modal.querySelector("#start-tutorial").addEventListener("click", () => {
      modal.remove()
      this.startTutorial()
    })

    modal.querySelector("#open-chat").addEventListener("click", () => {
      modal.remove()
      if (!this.chatbotWidget.isOpen) {
        this.chatbotWidget.toggleChat()
      }
    })
  }

  addProfessionalEnhancements() {
    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "d":
            e.preventDefault()
            this.themeService.toggle()
            break
          case "k":
            e.preventDefault()
            if (!this.chatbotWidget.isOpen) {
              this.chatbotWidget.toggleChat()
            }
            break
        }
      }
    })

    // Add loading states to buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches('button[type="submit"]')) {
        const button = e.target
        const originalText = button.innerHTML
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...'
        button.disabled = true

        setTimeout(() => {
          button.innerHTML = originalText
          button.disabled = false
        }, 2000)
      }
    })

    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth"

    // Add focus management
    this.setupFocusManagement()
  }

  setupFocusManagement() {
    // Trap focus in modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const modal = document.querySelector(".fixed.inset-0:not(.hidden)")
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
      }
    })
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App()
})
c