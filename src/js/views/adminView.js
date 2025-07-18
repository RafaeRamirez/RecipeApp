import { ApiService } from "../services/apiService.js"
import { AuthService } from "../services/authService.js"
import { UIService } from "../services/uiService.js"

export class AdminView {
  constructor() {
    this.apiService = new ApiService()
    this.authService = new AuthService()
    this.uiService = new UIService()
  }

  async render(container) {
    // Check admin access
    if (!this.authService.isAdmin()) {
      container.innerHTML = `
                <div class="container mx-auto px-4 py-8 text-center">
                    <h2 class="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                    <p class="text-gray-600 dark:text-gray-400">No tienes permisos para acceder a esta sección</p>
                </div>
            `
      return
    }

    this.uiService.showLoading(container)

    try {
      // Fetch admin data
      const [users, recipes, stats] = await Promise.all([
        this.apiService.get("/users"),
        this.apiService.get("/recipes"),
        this.apiService.get("/appStats"),
      ])

      container.innerHTML = `
                <div class="container mx-auto px-4 py-8">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            <i class="fas fa-cog text-primary-500 mr-2"></i>
                            Panel de Administración
                        </h1>
                        <p class="text-gray-600 dark:text-gray-400">
                            Gestiona usuarios y supervisa la actividad de la aplicación
                        </p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                    <i class="fas fa-users text-blue-600 dark:text-blue-400 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">${users.length}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                    <i class="fas fa-user-check text-green-600 dark:text-green-400 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">${users.filter((u) => u.isActive).length}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                                    <i class="fas fa-book text-purple-600 dark:text-purple-400 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recetas</p>
                                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">${recipes.length}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                                    <i class="fas fa-chart-line text-orange-600 dark:text-orange-400 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Última Actualización</p>
                                    <p class="text-sm font-semibold text-gray-900 dark:text-white">${new Date(stats.lastUpdated).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Users Management -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                                    <i class="fas fa-users text-primary-500 mr-2"></i>
                                    Gestión de Usuarios
                                </h2>
                                <button id="refresh-users" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>

                            <div class="space-y-4 max-h-96 overflow-y-auto">
                                ${users
                                  .map(
                                    (user) => `
                                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                                <i class="fas fa-user text-white"></i>
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900 dark:text-white">${user.name}</p>
                                                <p class="text-sm text-gray-600 dark:text-gray-400">${user.email}</p>
                                                <p class="text-xs text-gray-500 dark:text-gray-500">
                                                    Último acceso: ${new Date(user.lastLogin).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <span class="px-2 py-1 bg-${user.role === "admin" ? "red" : "blue"}-100 dark:bg-${user.role === "admin" ? "red" : "blue"}-900 text-${user.role === "admin" ? "red" : "blue"}-800 dark:text-${user.role === "admin" ? "red" : "blue"}-200 text-xs rounded-full">
                                                ${user.role === "admin" ? "Admin" : "Usuario"}
                                            </span>
                                            <span class="w-3 h-3 bg-${user.isActive ? "green" : "red"}-500 rounded-full"></span>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <!-- System Analytics -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                <i class="fas fa-chart-pie text-primary-500 mr-2"></i>
                                Análisis del Sistema
                            </h2>

                            <!-- User Registration Timeline -->
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Registro de Usuarios
                                </h3>
                                <div class="space-y-2">
                                    ${this.generateUserTimeline(users)}
                                </div>
                            </div>

                            <!-- Popular Categories -->
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Categorías Populares
                                </h3>
                                <div class="space-y-2">
                                    ${stats.popularCategories
                                      .map(
                                        (category, index) => `
                                        <div class="flex items-center justify-between">
                                            <span class="text-gray-700 dark:text-gray-300 capitalize">${category.replace("-", " ")}</span>
                                            <div class="flex items-center">
                                                <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                                    <div class="bg-primary-600 h-2 rounded-full" style="width: ${100 - index * 20}%"></div>
                                                </div>
                                                <span class="text-sm text-gray-600 dark:text-gray-400">${100 - index * 20}%</span>
                                            </div>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <!-- Diet Type Distribution -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Distribución de Dietas
                                </h3>
                                <div class="space-y-2">
                                    ${this.generateDietDistribution(users)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            <i class="fas fa-history text-primary-500 mr-2"></i>
                            Actividad Reciente
                        </h2>
                        
                        <div class="space-y-4">
                            ${this.generateRecentActivity(users)}
                        </div>
                    </div>

                    <!-- Admin Actions -->
                    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            <i class="fas fa-tools text-primary-500 mr-2"></i>
                            Acciones de Administrador
                        </h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button id="export-data" class="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-download mr-2"></i>
                                Exportar Datos
                            </button>
                            
                            <button id="send-notification" class="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-bell mr-2"></i>
                                Enviar Notificación
                            </button>
                            
                            <button id="system-backup" class="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-database mr-2"></i>
                                Backup Sistema
                            </button>
                        </div>
                    </div>
                </div>
            `

      this.setupEventListeners()
    } catch (error) {
      container.innerHTML = `
                <div class="container mx-auto px-4 py-8 text-center">
                    <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p class="text-gray-600 dark:text-gray-400">No se pudieron cargar los datos del panel de administración</p>
                </div>
            `
    }
  }

  generateUserTimeline(users) {
    const timeline = users
      .map((user) => ({
        ...user,
        date: new Date(user.createdAt),
      }))
      .sort((a, b) => b.date - a.date)

    return timeline
      .slice(0, 5)
      .map(
        (user) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white font-medium">${user.name}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                ${user.email} • ${user.date.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 bg-${user.role === "admin" ? "red" : "blue"}-100 dark:bg-${user.role === "admin" ? "red" : "blue"}-900 text-${user.role === "admin" ? "red" : "blue"}-800 dark:text-${user.role === "admin" ? "red" : "blue"}-200 text-xs rounded-full">
              ${user.role === "admin" ? "Admin" : "Usuario"}
            </span>
            <div class="relative">
              <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" onclick="this.nextElementSibling.classList.toggle('hidden')">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                <button class="user-action-btn block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="toggle-status" data-user-id="${user.id}">
                  <i class="fas fa-${user.isActive ? "ban" : "check"} mr-2"></i>
                  ${user.isActive ? "Desactivar" : "Activar"}
                </button>
                <button class="user-action-btn block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="reset-password" data-user-id="${user.id}">
                  <i class="fas fa-key mr-2"></i>
                  Restablecer contraseña
                </button>
                ${
                  user.role !== "admin"
                    ? `
                  <button class="user-action-btn block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="make-admin" data-user-id="${user.id}">
                    <i class="fas fa-crown mr-2"></i>
                    Hacer administrador
                  </button>
                  <button class="user-action-btn block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900" data-action="delete-user" data-user-id="${user.id}">
                    <i class="fas fa-trash mr-2"></i>
                    Eliminar usuario
                  </button>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

  generateDietDistribution(users) {
    const dietCounts = {}
    users.forEach((user) => {
      const diet = user.preferences?.dietType || "no-specified"
      dietCounts[diet] = (dietCounts[diet] || 0) + 1
    })

    const total = users.length
    return Object.entries(dietCounts)
      .map(([diet, count]) => {
        const percentage = Math.round((count / total) * 100)
        return `
                <div class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300 capitalize">${diet.replace("-", " ")}</span>
                    <div class="flex items-center">
                        <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div class="bg-primary-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">${percentage}%</span>
                    </div>
                </div>
            `
      })
      .join("")
  }

  generateRecentActivity(users) {
    const activities = users
      .map((user) => ({
        user: user.name,
        action: "Último acceso",
        time: new Date(user.lastLogin),
        icon: "fa-sign-in-alt",
      }))
      .sort((a, b) => b.time - a.time)

    return activities
      .slice(0, 8)
      .map(
        (activity) => `
            <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <i class="fas ${activity.icon} text-primary-600 dark:text-primary-400 text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        ${activity.user}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        ${activity.action} - ${activity.time.toLocaleString()}
                    </p>
                </div>
            </div>
        `,
      )
      .join("")
  }

  setupEventListeners() {
    // Refresh users
    document.getElementById("refresh-users")?.addEventListener("click", () => {
      this.refreshUsers()
    })

    // Export data
    document.getElementById("export-data")?.addEventListener("click", () => {
      this.exportData()
    })

    // Send notification
    document.getElementById("send-notification")?.addEventListener("click", () => {
      this.showNotificationModal()
    })

    // System backup
    document.getElementById("system-backup")?.addEventListener("click", () => {
      this.performBackup()
    })

    // User management actions
    document.addEventListener("click", (e) => {
      if (e.target.closest(".user-action-btn")) {
        const action = e.target.closest(".user-action-btn").dataset.action
        const userId = e.target.closest(".user-action-btn").dataset.userId
        this.handleUserAction(action, userId)
      }
    })
  }

  async refreshUsers() {
    try {
      this.uiService.showNotification("Actualizando datos de usuarios...", "info")

      // Re-render the admin view to refresh data
      const container = document.getElementById("app-content")
      await this.render(container)

      this.uiService.showNotification("Datos actualizados correctamente", "success")
    } catch (error) {
      this.uiService.showNotification("Error al actualizar datos", "error")
    }
  }

  async handleUserAction(action, userId) {
    try {
      switch (action) {
        case "toggle-status":
          await this.toggleUserStatus(userId)
          break
        case "reset-password":
          await this.resetUserPassword(userId)
          break
        case "delete-user":
          await this.deleteUser(userId)
          break
        case "make-admin":
          await this.makeUserAdmin(userId)
          break
      }
    } catch (error) {
      this.uiService.showNotification(error.message || "Error en la acción", "error")
    }
  }

  async toggleUserStatus(userId) {
    const users = await this.apiService.get("/users")
    const user = users.find((u) => u.id == userId)

    if (!user) throw new Error("Usuario no encontrado")

    await this.apiService.patch(`/users/${userId}`, {
      isActive: !user.isActive,
    })

    this.uiService.showNotification(`Usuario ${user.isActive ? "desactivado" : "activado"} correctamente`, "success")

    this.refreshUsers()
  }

  async resetUserPassword(userId) {
    const users = await this.apiService.get("/users")
    const user = users.find((u) => u.id == userId)

    if (!user) throw new Error("Usuario no encontrado")

    const tempPassword = Math.random().toString(36).slice(-8)

    await this.apiService.patch(`/users/${userId}`, {
      password: tempPassword,
    })

    this.uiService.createModal(
      "Contraseña Restablecida",
      `
      <div class="text-center">
        <p class="mb-4">La contraseña de <strong>${user.name}</strong> ha sido restablecida.</p>
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Nueva contraseña temporal:</p>
          <p class="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">${tempPassword}</p>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
          El usuario deberá cambiar esta contraseña en su próximo inicio de sesión.
        </p>
      </div>
    `,
      [
        {
          text: "Cerrar",
          class: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg",
          onclick: 'this.closest(".fixed").remove()',
        },
      ],
    )
  }

  async deleteUser(userId) {
    const users = await this.apiService.get("/users")
    const user = users.find((u) => u.id == userId)

    if (!user) throw new Error("Usuario no encontrado")

    if (user.role === "admin") {
      throw new Error("No se puede eliminar un administrador")
    }

    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`,
    )

    if (confirmed) {
      await this.apiService.delete(`/users/${userId}`)
      this.uiService.showNotification("Usuario eliminado correctamente", "success")
      this.refreshUsers()
    }
  }

  async makeUserAdmin(userId) {
    const users = await this.apiService.get("/users")
    const user = users.find((u) => u.id == userId)

    if (!user) throw new Error("Usuario no encontrado")

    if (user.role === "admin") {
      throw new Error("El usuario ya es administrador")
    }

    const confirmed = confirm(`¿Estás seguro de que quieres hacer administrador a ${user.name}?`)

    if (confirmed) {
      await this.apiService.patch(`/users/${userId}`, {
        role: "admin",
      })

      this.uiService.showNotification(`${user.name} ahora es administrador`, "success")
      this.refreshUsers()
    }
  }

  exportData() {
    // Simulate data export
    this.uiService.showNotification("Exportando datos...", "info")

    setTimeout(() => {
      const data = {
        timestamp: new Date().toISOString(),
        users: "exported",
        recipes: "exported",
        stats: "exported",
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recipe-app-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      this.uiService.showNotification("Datos exportados correctamente", "success")
    }, 2000)
  }

  showNotificationModal() {
    const modal = this.uiService.createModal(
      "Enviar Notificación Global",
      `
                <form id="notification-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de notificación
                        </label>
                        <select name="type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                            <option value="info">Información</option>
                            <option value="success">Éxito</option>
                            <option value="warning">Advertencia</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mensaje
                        </label>
                        <textarea name="message" rows="3" required
                                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                  placeholder="Escribe tu mensaje aquí..."></textarea>
                    </div>
                </form>
            `,
      [
        {
          text: "Enviar",
          class: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg",
          onclick:
            'this.closest(".fixed").querySelector("form").dispatchEvent(new Event("submit")); this.closest(".fixed").remove();',
        },
        {
          text: "Cancelar",
          class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
          onclick: 'this.closest(".fixed").remove()',
        },
      ],
    )

    modal.querySelector("#notification-form").addEventListener("submit", (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const type = formData.get("type")
      const message = formData.get("message")

      // Simulate sending notification
      this.uiService.showNotification(`Notificación ${type} enviada: "${message}"`, "success")
    })
  }

  performBackup() {
    this.uiService.showNotification("Iniciando backup del sistema...", "info")

    // Simulate backup process
    setTimeout(() => {
      this.uiService.showNotification("Backup completado correctamente", "success")
    }, 3000)
  }

  destroy() {
    // Cleanup if needed
  }
}
