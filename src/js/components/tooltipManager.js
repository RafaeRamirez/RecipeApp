export class TooltipManager {
  constructor() {
    this.tooltips = new Map()
  }

  init() {
    this.createTooltipContainer()
    this.setupEventListeners()
    this.initializeTooltips()
  }

  createTooltipContainer() {
    const container = document.createElement("div")
    container.id = "tooltip-container"
    container.className = "fixed z-[60] pointer-events-none"
    document.body.appendChild(container)
  }

  setupEventListeners() {
    document.addEventListener(
      "mouseenter",
      (e) => {
        if (e.target.hasAttribute("data-tooltip")) {
          this.showTooltip(e.target)
        }
      },
      true,
    )

    document.addEventListener(
      "mouseleave",
      (e) => {
        if (e.target.hasAttribute("data-tooltip")) {
          this.hideTooltip(e.target)
        }
      },
      true,
    )

    document.addEventListener("mousemove", (e) => {
      this.updateTooltipPosition(e)
    })
  }

  initializeTooltips() {
    // Add tooltips to common elements
    this.addTooltip('[data-route="home"]', "Ir a la página de inicio")
    this.addTooltip('[data-route="recipes"]', "Explorar recetas disponibles")
    this.addTooltip('[data-route="profile"]', "Ver y editar tu perfil")
    this.addTooltip("#theme-toggle", "Cambiar entre modo claro y oscuro")
    this.addTooltip("#logout-btn", "Cerrar sesión")
    this.addTooltip("#mobile-menu-btn", "Abrir menú de navegación")
  }

  addTooltip(selector, text, options = {}) {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      element.setAttribute("data-tooltip", text)
      if (options.position) {
        element.setAttribute("data-tooltip-position", options.position)
      }
      if (options.delay) {
        element.setAttribute("data-tooltip-delay", options.delay)
      }
    })
  }

  showTooltip(element) {
    const text = element.getAttribute("data-tooltip")
    const position = element.getAttribute("data-tooltip-position") || "top"
    const delay = Number.parseInt(element.getAttribute("data-tooltip-delay")) || 500

    if (!text) return

    const tooltipId = this.generateTooltipId(element)

    setTimeout(() => {
      if (!element.matches(":hover")) return

      const tooltip = document.createElement("div")
      tooltip.id = tooltipId
      tooltip.className = `absolute bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap animate-fade-in`
      tooltip.textContent = text

      const container = document.getElementById("tooltip-container")
      container.appendChild(tooltip)

      this.positionTooltip(tooltip, element, position)
      this.tooltips.set(element, tooltip)
    }, delay)
  }

  hideTooltip(element) {
    const tooltip = this.tooltips.get(element)
    if (tooltip) {
      tooltip.classList.add("animate-fade-out")
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip)
        }
        this.tooltips.delete(element)
      }, 150)
    }
  }

  positionTooltip(tooltip, element, position) {
    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    let left, top

    switch (position) {
      case "top":
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        top = rect.top - tooltipRect.height - 8
        tooltip.classList.add("tooltip-arrow-bottom")
        break
      case "bottom":
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        top = rect.bottom + 8
        tooltip.classList.add("tooltip-arrow-top")
        break
      case "left":
        left = rect.left - tooltipRect.width - 8
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        tooltip.classList.add("tooltip-arrow-right")
        break
      case "right":
        left = rect.right + 8
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        tooltip.classList.add("tooltip-arrow-left")
        break
      default:
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        top = rect.top - tooltipRect.height - 8
    }

    // Adjust if tooltip would go off screen
    if (left < 10) left = 10
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10
    }
    if (top < 10) top = rect.bottom + 8

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
  }

  updateTooltipPosition(e) {
    // Update position for tooltips that follow mouse
    this.tooltips.forEach((tooltip, element) => {
      if (element.hasAttribute("data-tooltip-follow-mouse")) {
        tooltip.style.left = `${e.clientX + 10}px`
        tooltip.style.top = `${e.clientY - 30}px`
      }
    })
  }

  generateTooltipId(element) {
    return `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
