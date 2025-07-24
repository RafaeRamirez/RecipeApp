import { ApiService } from "./apiService.js"

export class AuthService {
  constructor() {
    this.apiService = new ApiService()
    this.currentUser = null
    this.loadCurrentUser()
  }

  loadCurrentUser() {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  async login(email, password) {
    try {
      console.log("Attempting login for:", email)

      const users = await this.apiService.get("/users")
      console.log("Users loaded:", users.length)

      const user = users.find((u) => u.email === email && u.password === password)
      console.log("User found:", !!user)

      if (user) {
        // Update last login
        try {
          await this.apiService.patch(`/users/${user.id}`, {
            lastLogin: new Date().toISOString(),
          })
        } catch (updateError) {
          console.warn("Failed to update last login:", updateError)
          // Continue with login even if update fails
        }

        // Store user data (without password)
        const { password: _, ...userWithoutPassword } = user
        this.currentUser = userWithoutPassword
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser))

        console.log("Login successful for:", user.name)
        return this.currentUser
      }

      console.log("Login failed: Invalid credentials")
      return null
    } catch (error) {
      console.error("Login error:", error)
      throw new Error("Error de conexión. Por favor, intenta de nuevo.")
    }
  }

  async register(userData) {
    try {
      const users = await this.apiService.get("/users")

      // Check if email already exists
      const existingUser = users.find((u) => u.email === userData.email)
      if (existingUser) {
        throw new Error("El email ya está registrado")
      }

      // Create new user
      const newUser = {
        id: Date.now(), // Simple ID generation
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: "user",
        preferences: {
          dietType: userData.dietType || "omnivore",
          allergies: [],
          favoriteCategories: [],
        },
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      // Save to JSON Server
      const savedUser = await this.apiService.post("/users", newUser)

      // Store user data (without password)
      const { password: _, ...userWithoutPassword } = savedUser
      this.currentUser = userWithoutPassword
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))

      return this.currentUser
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  }

  async changePassword(currentPassword, newPassword) {
    if (!this.currentUser) {
      throw new Error("Usuario no autenticado")
    }

    try {
      // Get current user data to verify password
      const users = await this.apiService.get("/users")
      const user = users.find((u) => u.id === this.currentUser.id)

      if (!user || user.password !== currentPassword) {
        throw new Error("La contraseña actual es incorrecta")
      }

      // Update password
      await this.apiService.patch(`/users/${this.currentUser.id}`, {
        password: newPassword,
      })

      return true
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }

  async resetPassword(email) {
    try {
      const users = await this.apiService.get("/users")
      const user = users.find((u) => u.email === email)

      if (!user) {
        throw new Error("Email no encontrado")
      }

      // In a real app, you would send an email with reset link
      // For demo purposes, we'll generate a temporary password
      const tempPassword = this.generateTempPassword()

      await this.apiService.patch(`/users/${user.id}`, {
        password: tempPassword,
      })

      return tempPassword
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  generateTempPassword() {
    return Math.random().toString(36).slice(-8)
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  getCurrentUser() {
    return this.currentUser
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin"
  }

  async updateUserPreferences(preferences) {
    if (!this.currentUser) return false

    try {
      await this.apiService.patch(`/users/${this.currentUser.id}`, {
        preferences: preferences,
      })

      this.currentUser.preferences = preferences
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))

      return true
    } catch (error) {
      console.error("Error updating preferences:", error)
      return false
    }
  }

  validatePassword(password) {
    const minLength = 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    return {
      isValid: password.length >= minLength,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      strength: this.calculatePasswordStrength(password),
    }
  }

  calculatePasswordStrength(password) {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return "weak"
    if (strength <= 4) return "medium"
    return "strong"
  }
}
