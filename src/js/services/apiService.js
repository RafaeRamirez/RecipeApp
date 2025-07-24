export class ApiService {
  constructor() {
    this.baseURL = "http://localhost:3000"
  }

  async get(endpoint) {
    try {
      console.log(`API GET: ${this.baseURL}${endpoint}`)
      const response = await fetch(`${this.baseURL}${endpoint}`)

      if (!response.ok) {
        console.error(`API GET failed: ${response.status} ${response.statusText}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`API GET success: ${endpoint}`, data.length || "N/A", "items")
      return data
    } catch (error) {
      console.error("API GET error:", error)

      // If JSON server is not running, return mock data for users
      if (endpoint === "/users" && error.message.includes("fetch")) {
        console.warn("JSON server not available, using fallback data")
        return [
          {
            id: 1,
            email: "admin@test.com",
            password: "admin123",
            name: "Administrador",
            role: "admin",
            preferences: {
              dietType: "omnivore",
              allergies: [],
              favoriteCategories: ["mediterranean", "healthy"],
            },
            lastLogin: "2024-01-15T10:30:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            isActive: true,
          },
          {
            id: 2,
            email: "user@test.com",
            password: "user123",
            name: "Usuario Demo",
            role: "user",
            preferences: {
              dietType: "vegetarian",
              allergies: ["nuts"],
              favoriteCategories: ["vegetarian", "vegan"],
            },
            lastLogin: "2024-01-14T15:45:00Z",
            createdAt: "2024-01-02T00:00:00Z",
            isActive: true,
          },
        ]
      }

      throw error
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("API POST error:", error)
      throw error
    }
  }

  async patch(endpoint, data) {
    try {
      console.log(`API PATCH: ${this.baseURL}${endpoint}`, data)
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        console.error(`API PATCH failed: ${response.status} ${response.statusText}`)
        // Don't throw error for PATCH failures, just log them
        return null
      }

      const result = await response.json()
      console.log(`API PATCH success: ${endpoint}`)
      return result
    } catch (error) {
      console.error("API PATCH error:", error)
      // Return null instead of throwing to prevent login failures
      return null
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("API DELETE error:", error)
      throw error
    }
  }
}
