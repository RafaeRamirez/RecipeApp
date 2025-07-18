import { HomeView } from "./views/homeView.js"
import { RecipesView } from "./views/recipesView.js"
import { ProfileView } from "./views/profileView.js"
import { AdminView } from "./views/adminView.js"
import { AuthService } from "./services/authService.js"
// Add NotFoundView import at the top
import { NotFoundView } from "./views/notFoundView.js"

export class Router {
  constructor() {
    this.routes = {
      home: HomeView,
      recipes: RecipesView,
      profile: ProfileView,
      admin: AdminView,
      NotFoundViem: NotFoundView,
    }
    this.currentView = null
    this.authService = new AuthService()
  }

  init() {
    // Set default route
    this.navigate("home")

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      const route = e.state?.route || "home"
      this.navigate(route, false)
    })
  }

  async navigate(route, pushState = true) {
    // Check if route exists
    if (!this.routes[route]) {
      route = "404"
    }

    // Check admin access
    if (route === "admin") {
      const currentUser = this.authService.getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        route = "404"
      }
    }

    // Update browser history
    if (pushState) {
      history.pushState({ route }, "", route === "404" ? "#404" : `#${route}`)
    }

    // Update active navigation (skip for 404)
    if (route !== "404") {
      this.updateActiveNav(route)
    }

    // Destroy current view
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy()
    }

    // Create and render new view
    const ViewClass = this.routes[route]
    this.currentView = new ViewClass()

    const content = document.getElementById("app-content")
    content.innerHTML = ""

    try {
      await this.currentView.render(content)
    } catch (error) {
      console.error("Error rendering view:", error)
      // If there's an error rendering any view, show 404
      if (route !== "404") {
        this.navigate("404", false)
      } else {
        content.innerHTML = `
        <div class="container mx-auto px-4 py-8">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-red-600 mb-4">Error Crítico</h2>
            <p class="text-gray-600 dark:text-gray-400">No se pudo cargar el contenido</p>
          </div>
        </div>
      `
      }
    }
  }

  updateActiveNav(activeRoute) {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link, .nav-link-mobile").forEach((link) => {
      link.classList.remove("text-primary-600", "dark:text-primary-400")
      link.classList.add("text-gray-700", "dark:text-gray-300")
    })

    // Add active class to current route
    document.querySelectorAll(`[data-route="${activeRoute}"]`).forEach((link) => {
      link.classList.remove("text-gray-700", "dark:text-gray-300")
      link.classList.add("text-primary-600", "dark:text-primary-400")
    })
  }
}
