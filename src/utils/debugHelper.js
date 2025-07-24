export class DebugHelper {
  static isDebugMode() {
    return localStorage.getItem("debug_mode") === "true" || window.location.search.includes("debug=true")
  }

  static log(message, data = null) {
    if (this.isDebugMode()) {
      console.log(`[DEBUG] ${message}`, data || "")
    }
  }

  static error(message, error = null) {
    if (this.isDebugMode()) {
      console.error(`[DEBUG ERROR] ${message}`, error || "")
    }
  }

  static enableDebug() {
    localStorage.setItem("debug_mode", "true")
    console.log("Debug mode enabled. Reload the page to see debug logs.")
  }

  static disableDebug() {
    localStorage.removeItem("debug_mode")
    console.log("Debug mode disabled.")
  }

  static checkLoginFlow() {
    console.group("🔍 Login Flow Diagnostics")

    // Check if forms exist
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")

    console.log("Login form exists:", !!loginForm)
    console.log("Register form exists:", !!registerForm)

    if (loginForm) {
      console.log("Login form visible:", !loginForm.classList.contains("hidden"))
      console.log("Login form has event listeners:", loginForm.onsubmit !== null)
    }

    // Check API connectivity
    fetch("http://localhost:3001/users")
      .then((response) => {
        console.log("JSON Server status:", response.ok ? "Connected" : "Error")
        return response.json()
      })
      .then((users) => {
        console.log(
          "Available users:",
          users.map((u) => ({ email: u.email, role: u.role })),
        )
      })
      .catch((error) => {
        console.log("JSON Server status: Disconnected (using fallback data)")
      })

    // Check current user state
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")
    console.log("Current user:", currentUser ? currentUser.email : "None")

    console.groupEnd()
  }
}

// Make it available globally for debugging
window.DebugHelper = DebugHelper
