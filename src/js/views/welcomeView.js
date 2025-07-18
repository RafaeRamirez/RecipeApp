export class WelcomeView {
  constructor() {
    this.currentForm = "welcome" // welcome, login, register
  }

  render(container) {
    // The welcome interface is already in the HTML
    this.setupEventListeners()
    this.showWelcome()
  }

  setupEventListeners() {
    // Show login form
    document.getElementById("show-login")?.addEventListener("click", () => {
      this.showLogin()
    })

    // Show register form
    document.getElementById("show-register")?.addEventListener("click", () => {
      this.showRegister()
    })

    // Demo login
    document.getElementById("demo-login")?.addEventListener("click", () => {
      this.demoLogin()
    })

    // Switch between forms
    document.getElementById("switch-to-register")?.addEventListener("click", () => {
      this.showRegister()
    })

    document.getElementById("switch-to-login")?.addEventListener("click", () => {
      this.showLogin()
    })

    // Back to welcome
    document.getElementById("back-to-welcome")?.addEventListener("click", () => {
      this.showWelcome()
    })

    // Password visibility toggles
    this.setupPasswordToggles()

    // Password strength indicator
    this.setupPasswordStrength()

    // Forgot password
    document.getElementById("forgot-password")?.addEventListener("click", (e) => {
      e.preventDefault()
      this.showForgotPassword()
    })
  }

  showWelcome() {
    this.currentForm = "welcome"
    document.getElementById("welcome-section").classList.remove("hidden")
    document.getElementById("login-form").classList.add("hidden")
    document.getElementById("register-form").classList.add("hidden")
    document.getElementById("back-to-welcome").classList.add("hidden")
  }

  showLogin() {
    this.currentForm = "login"
    document.getElementById("welcome-section").classList.add("hidden")
    document.getElementById("login-form").classList.remove("hidden")
    document.getElementById("register-form").classList.add("hidden")
    document.getElementById("back-to-welcome").classList.remove("hidden")
  }

  showRegister() {
    this.currentForm = "register"
    document.getElementById("welcome-section").classList.add("hidden")
    document.getElementById("login-form").classList.add("hidden")
    document.getElementById("register-form").classList.remove("hidden")
    document.getElementById("back-to-welcome").classList.remove("hidden")
  }

  demoLogin() {
    // Fill login form with demo credentials
    this.showLogin()

    setTimeout(() => {
      document.getElementById("login-email").value = "user@test.com"
      document.getElementById("login-password").value = "user123"

      // Trigger the login process directly
      const loginEvent = new Event("submit", { bubbles: true, cancelable: true })
      document.getElementById("login-form").dispatchEvent(loginEvent)
    }, 500)
  }

  setupPasswordToggles() {
    const toggles = [
      { button: "toggle-login-password", input: "login-password" },
      { button: "toggle-register-password", input: "register-password" },
      { button: "toggle-confirm-password", input: "register-confirm-password" },
    ]

    toggles.forEach(({ button, input }) => {
      document.getElementById(button)?.addEventListener("click", () => {
        const inputField = document.getElementById(input)
        const icon = document.querySelector(`#${button} i`)

        if (inputField.type === "password") {
          inputField.type = "text"
          icon.classList.remove("fa-eye")
          icon.classList.add("fa-eye-slash")
        } else {
          inputField.type = "password"
          icon.classList.remove("fa-eye-slash")
          icon.classList.add("fa-eye")
        }
      })
    })
  }

  setupPasswordStrength() {
    const passwordInput = document.getElementById("register-password")
    const strengthIndicator = document.getElementById("password-strength")

    passwordInput?.addEventListener("input", (e) => {
      const password = e.target.value
      const validation = this.validatePassword(password)

      let strengthText = ""
      let strengthClass = ""

      if (password.length === 0) {
        strengthText = "La contraseña debe tener al menos 6 caracteres"
        strengthClass = "text-gray-500"
      } else if (validation.strength === "weak") {
        strengthText = "Contraseña débil"
        strengthClass = "text-red-500"
      } else if (validation.strength === "medium") {
        strengthText = "Contraseña media"
        strengthClass = "text-yellow-500"
      } else {
        strengthText = "Contraseña fuerte"
        strengthClass = "text-green-500"
      }

      strengthIndicator.textContent = strengthText
      strengthIndicator.className = `text-xs ${strengthClass}`
    })
  }

  validatePassword(password) {
    const minLength = 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (hasUpperCase) strength++
    if (hasLowerCase) strength++
    if (hasNumbers) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    return {
      isValid: password.length >= minLength,
      strength: strength <= 2 ? "weak" : strength <= 4 ? "medium" : "strong",
    }
  }

  showForgotPassword() {
    const email = prompt("Ingresa tu email para recuperar la contraseña:")
    if (email) {
      // In a real app, this would send a reset email
      alert(`Se ha enviado un enlace de recuperación a ${email}`)
    }
  }

  destroy() {
    // Cleanup if needed
  }
}
