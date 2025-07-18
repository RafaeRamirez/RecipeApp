export class UIService {
  constructor() {
    this.notifications = []
  }

  showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div")
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full max-w-sm`

    const colors = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-black",
      info: "bg-blue-500 text-white",
    }

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    notification.className += ` ${colors[type] || colors.info}`
    notification.innerHTML = `
      <div class="flex items-start">
        <i class="${icons[type] || icons.info} mr-3 mt-0.5"></i>
        <div class="flex-1">
          <span class="text-sm font-medium">${message}</span>
        </div>
        <button class="ml-4 text-white hover:text-gray-200 flex-shrink-0" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.classList.remove("translate-x-full")
    }, 100)

    // Auto remove
    setTimeout(() => {
      notification.classList.add("translate-x-full")
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, 300)
    }, duration)
  }

  showConfirmDialog(title, message, onConfirm, onCancel) {
    const modal = this.createModal(title, `<p class="text-gray-700 dark:text-gray-300">${message}</p>`, [
      {
        text: "Confirmar",
        class: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg",
        onclick: `(${onConfirm.toString()})(); this.closest('.fixed').remove();`,
      },
      {
        text: "Cancelar",
        class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
        onclick: onCancel
          ? `(${onCancel.toString()})(); this.closest('.fixed').remove();`
          : 'this.closest(".fixed").remove()',
      },
    ])
    return modal
  }

  showPromptDialog(title, message, placeholder = "", onConfirm, onCancel) {
    const modal = this.createModal(
      title,
      `
        <div>
          <p class="text-gray-700 dark:text-gray-300 mb-4">${message}</p>
          <input type="text" id="prompt-input" placeholder="${placeholder}" 
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
        </div>
      `,
      [
        {
          text: "Confirmar",
          class: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg",
          onclick: `
            const value = document.getElementById('prompt-input').value;
            if (value.trim()) {
              (${onConfirm.toString()})(value);
              this.closest('.fixed').remove();
            }
          `,
        },
        {
          text: "Cancelar",
          class: "bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg",
          onclick: onCancel
            ? `(${onCancel.toString()})(); this.closest('.fixed').remove();`
            : 'this.closest(".fixed").remove()',
        },
      ],
    )

    // Focus on input
    setTimeout(() => {
      modal.querySelector("#prompt-input")?.focus()
    }, 100)

    return modal
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu")
    mobileMenu.classList.toggle("hidden")
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu")
    mobileMenu.classList.add("hidden")
  }

  showLoading(container, message = "Cargando...") {
    container.innerHTML = `
      <div class="flex flex-col justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">${message}</p>
      </div>
    `
  }

  showLoadingOverlay(message = "Procesando...") {
    const overlay = document.createElement("div")
    overlay.id = "loading-overlay"
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    overlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">${message}</p>
      </div>
    `
    document.body.appendChild(overlay)
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay")
    if (overlay) {
      overlay.remove()
    }
  }

  createModal(title, content, actions = []) {
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onclick="this.closest('.fixed').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mb-6 text-gray-700 dark:text-gray-300">
          ${content}
        </div>
        <div class="flex justify-end space-x-2">
          ${actions
            .map(
              (action) => `
              <button class="${action.class}" onclick="${action.onclick}">
                ${action.text}
              </button>
            `,
            )
            .join("")}
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    return modal
  }

  createToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div")
    toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-y-full max-w-sm`

    const colors = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-black",
      info: "bg-blue-500 text-white",
    }

    toast.className += ` ${colors[type] || colors.info}`
    toast.innerHTML = `
      <div class="flex items-center">
        <span class="text-sm">${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-full")
    }, 100)

    // Auto remove
    setTimeout(() => {
      toast.classList.add("translate-y-full")
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }, duration)

    return toast
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showNotification("Copiado al portapapeles", "success", 2000)
        })
        .catch(() => {
          this.fallbackCopyToClipboard(text)
        })
    } else {
      this.fallbackCopyToClipboard(text)
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand("copy")
      this.showNotification("Copiado al portapapeles", "success", 2000)
    } catch (err) {
      this.showNotification("Error al copiar", "error", 2000)
    }

    document.body.removeChild(textArea)
  }
}
