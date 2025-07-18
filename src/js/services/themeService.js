export class ThemeService {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light"
  }

  init() {
    this.applyTheme()
  }

  toggle() {
    this.theme = this.theme === "light" ? "dark" : "light"
    this.applyTheme()
    localStorage.setItem("theme", this.theme)
  }

  applyTheme() {
    if (this.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  getCurrentTheme() {
    return this.theme
  }
}
