import { ApiService } from "../services/apiService.js"
import { AuthService } from "../services/authService.js"
import { UIService } from "../services/uiService.js"

export class ProfileView {
  constructor() {
    this.apiService = new ApiService()
    this.authService = new AuthService()
    this.uiService = new UIService()
  }

  async render(container) {
    const currentUser = this.authService.getCurrentUser()

    container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-4xl mx-auto">
                    <!-- Profile Header -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <div class="flex items-center space-x-6">
                            <div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${currentUser.name}
                                </h1>
                                <p class="text-gray-600 dark:text-gray-400">${currentUser.email}</p>
                                <div class="flex items-center mt-2">
                                    <span class="px-2 py-1 bg-${currentUser.role === "admin" ? "red" : "blue"}-100 dark:bg-${currentUser.role === "admin" ? "red" : "blue"}-900 text-${currentUser.role === "admin" ? "red" : "blue"}-800 dark:text-${currentUser.role === "admin" ? "red" : "blue"}-200 text-sm rounded-full capitalize">
                                        ${currentUser.role === "admin" ? "Administrador" : "Usuario"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Preferences -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                <i class="fas fa-cog text-primary-500 mr-2"></i>
                                Preferencias Alimentarias
                            </h2>
                            
                            <form id="preferences-form" class="space-y-4">
                                <!-- Diet Type -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de dieta
                                    </label>
                                    <select name="dietType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                                        <option value="omnivore" ${currentUser.preferences?.dietType === "omnivore" ? "selected" : ""}>Omnívora</option>
                                        <option value="vegetarian" ${currentUser.preferences?.dietType === "vegetarian" ? "selected" : ""}>Vegetariana</option>
                                        <option value="vegan" ${currentUser.preferences?.dietType === "vegan" ? "selected" : ""}>Vegana</option>
                                        <option value="keto" ${currentUser.preferences?.dietType === "keto" ? "selected" : ""}>Keto</option>
                                        <option value="paleo" ${currentUser.preferences?.dietType === "paleo" ? "selected" : ""}>Paleo</option>
                                    </select>
                                </div>

                                <!-- Allergies -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Alergias
                                    </label>
                                    <div class="space-y-2">
                                        ${["nuts", "gluten", "dairy", "eggs", "soy", "shellfish"]
                                          .map(
                                            (allergy) => `
                                            <label class="flex items-center">
                                                <input type="checkbox" name="allergies" value="${allergy}" 
                                                       ${currentUser.preferences?.allergies?.includes(allergy) ? "checked" : ""}
                                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">${allergy}</span>
                                            </label>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>

                                <!-- Favorite Categories -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Categorías favoritas
                                    </label>
                                    <div class="space-y-2">
                                        ${["mediterranean", "healthy", "vegan", "keto", "comfort-food", "quick-meals"]
                                          .map(
                                            (category) => `
                                            <label class="flex items-center">
                                                <input type="checkbox" name="favoriteCategories" value="${category}" 
                                                       ${currentUser.preferences?.favoriteCategories?.includes(category) ? "checked" : ""}
                                                       class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">${category.replace("-", " ")}</span>
                                            </label>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>

                                <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    <i class="fas fa-save mr-2"></i>
                                    Guardar Preferencias
                                </button>
                            </form>
                        </div>

                        <!-- Account Info -->
                        <div class="space-y-6">
                            <!-- Account Stats -->
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    <i class="fas fa-chart-line text-primary-500 mr-2"></i>
                                    Estadísticas de Cuenta
                                </h2>
                                
                                <div class="space-y-4">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700 dark:text-gray-300">Miembro desde</span>
                                        <span class="font-semibold text-primary-600 dark:text-primary-400">
                                            ${new Date(currentUser.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700 dark:text-gray-300">Último acceso</span>
                                        <span class="font-semibold text-primary-600 dark:text-primary-400">
                                            ${new Date(currentUser.lastLogin).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700 dark:text-gray-300">Estado</span>
                                        <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                                            Activo
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    <i class="fas fa-bolt text-primary-500 mr-2"></i>
                                    Acciones Rápidas
                                </h2>
                                
                                <div class="space-y-3">
                                    <button class="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors" data-route="recipes">
                                        <i class="fas fa-search text-primary-500 mr-3"></i>
                                        <span class="text-gray-700 dark:text-gray-300">Explorar recetas</span>
                                    </button>
                                    
                                    <button id="get-recommendation" class="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                        <i class="fas fa-lightbulb text-primary-500 mr-3"></i>
                                        <span class="text-gray-700 dark:text-gray-300">Obtener recomendación</span>
                                    </button>
                                    
                                    <button id="change-password" class="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                        <i class="fas fa-key text-primary-500 mr-3"></i>
                                        <span class="text-gray-700 dark:text-gray-300">Cambiar contraseña</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Preferences form
    const preferencesForm = document.getElementById("preferences-form")
    preferencesForm.addEventListener("submit", this.handlePreferencesUpdate.bind(this))

    // Get recommendation button
    document.getElementById("get-recommendation")?.addEventListener("click", this.showRecommendation.bind(this))

    // Change password button
    document.getElementById("change-password")?.addEventListener("click", this.showChangePasswordModal.bind(this))
  }

  async handlePreferencesUpdate(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const preferences = {
      dietType: formData.get("dietType"),
      allergies: formData.getAll("allergies"),
      favoriteCategories: formData.getAll("favoriteCategories"),
    }

    try {
      const success = await this.authService.updateUserPreferences(preferences)
      if (success) {
        this.uiService.showNotification("Preferencias actualizadas correctamente", "success")
      } else {
        this.uiService.showNotification("Error al actualizar preferencias", "error")
      }
    } catch (error) {
      this.uiService.showNotification("Error al actualizar preferencias", "error")
    }
  }

  async showRecommendation() {
    const currentUser = this.authService.getCurrentUser()

    try {
      const recipes = await this.apiService.get("/recipes")
      const userDietType = currentUser.preferences?.dietType

      // Filter recipes based on user preferences
      let recommendedRecipes = recipes

      if (userDietType && userDietType !== "omnivore") {
        recommendedRecipes = recipes.filter((recipe) => recipe.dietType.includes(userDietType))
      }

      // Get random recommendation
      const randomRecipe = recommendedRecipes[Math.floor(Math.random() * recommendedRecipes.length)]

      if (randomRecipe) {
        const modal = this.uiService.createModal(
          "Recomendación Personalizada",
          `
                        <div class="text-center mb-4">
                            <img src="${randomRecipe.image}" alt="${randomRecipe.title}" class="w-full h-32 object-cover rounded-lg mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${randomRecipe.title}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mt-2">${randomRecipe.description}</p>
                        </div>
                        <div class="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span><i class="fas fa-clock mr-1"></i>${randomRecipe.prepTime} min</span>
                            <span><i class="fas fa-signal mr-1"></i>${randomRecipe.difficulty}</span>
                        </div>
                    `,
          [
            {
              text: "Ver Receta",
              class: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg",
              onclick: `document.querySelector('[data-route="recipes"]').click(); this.closest('.fixed').remove();`,
            },
            {
              text: "Cerrar",
              class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
              onclick: 'this.closest(".fixed").remove()',
            },
          ],
        )
      } else {
        this.uiService.showNotification("No se encontraron recetas para tu dieta", "warning")
      }
    } catch (error) {
      this.uiService.showNotification("Error al obtener recomendación", "error")
    }
  }

  showChangePasswordModal() {
    const modal = this.uiService.createModal(
      "Cambiar Contraseña",
      `
      <form id="change-password-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña actual
          </label>
          <div class="relative">
            <input type="password" name="currentPassword" id="current-password" required
                   class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
            <button type="button" id="toggle-current-password" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <i class="fas fa-eye text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nueva contraseña
          </label>
          <div class="relative">
            <input type="password" name="newPassword" id="new-password" required
                   class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
            <button type="button" id="toggle-new-password" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <i class="fas fa-eye text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
          <div id="password-strength-modal" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            La contraseña debe tener al menos 6 caracteres
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmar nueva contraseña
          </label>
          <div class="relative">
            <input type="password" name="confirmPassword" id="confirm-new-password" required
                   class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
            <button type="button" id="toggle-confirm-new-password" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <i class="fas fa-eye text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
        </div>
      </form>
    `,
      [
        {
          text: "Cambiar",
          class: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg",
          onclick: "document.getElementById('change-password-form').dispatchEvent(new Event('submit'))",
        },
        {
          text: "Cancelar",
          class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
          onclick: 'this.closest(".fixed").remove()',
        },
      ],
    )

    // Setup password visibility toggles
    const toggles = [
      { button: "toggle-current-password", input: "current-password" },
      { button: "toggle-new-password", input: "new-password" },
      { button: "toggle-confirm-new-password", input: "confirm-new-password" },
    ]

    toggles.forEach(({ button, input }) => {
      modal.querySelector(`#${button}`)?.addEventListener("click", () => {
        const inputField = modal.querySelector(`#${input}`)
        const icon = modal.querySelector(`#${button} i`)

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

    // Setup password strength indicator
    const newPasswordInput = modal.querySelector("#new-password")
    const strengthIndicator = modal.querySelector("#password-strength-modal")

    newPasswordInput?.addEventListener("input", (e) => {
      const password = e.target.value
      const validation = this.authService.validatePassword(password)

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
      strengthIndicator.className = `mt-1 text-xs ${strengthClass}`
    })

    // Handle form submission
    modal.querySelector("#change-password-form").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(e.target)
      const currentPassword = formData.get("currentPassword")
      const newPassword = formData.get("newPassword")
      const confirmPassword = formData.get("confirmPassword")

      // Validation
      if (newPassword !== confirmPassword) {
        this.uiService.showNotification("Las contraseñas no coinciden", "error")
        return
      }

      if (newPassword.length < 6) {
        this.uiService.showNotification("La nueva contraseña debe tener al menos 6 caracteres", "error")
        return
      }

      if (currentPassword === newPassword) {
        this.uiService.showNotification("La nueva contraseña debe ser diferente a la actual", "error")
        return
      }

      try {
        await this.authService.changePassword(currentPassword, newPassword)
        modal.remove()
        this.uiService.showNotification("Contraseña cambiada exitosamente", "success")
      } catch (error) {
        this.uiService.showNotification(error.message || "Error al cambiar la contraseña", "error")
      }
    })
  }

  destroy() {
    // Cleanup if needed
  }
}
