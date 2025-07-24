import { ChatbotService } from "../services/chatbotService.js"
import { UIService } from "../services/uiService.js"

export class ChatbotWidget {
  constructor() {
    this.chatbotService = new ChatbotService()
    this.uiService = new UIService()
    this.isOpen = false
    this.isTyping = false
    this.unreadCount = 0
  }

  init() {
    this.createWidget()
    this.setupEventListeners()
    this.showWelcomeMessage()
  }

  createWidget() {
    const widget = document.createElement("div")
    widget.id = "chatbot-widget"
    widget.innerHTML = `
      <!-- Chat Toggle Button -->
      <button id="chat-toggle" class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center">
        <i id="chat-icon" class="fas fa-comments text-xl"></i>
        <span id="unread-badge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hidden">0</span>
      </button>

      <!-- Chat Window -->
      <div id="chat-window" class="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 hidden z-50 flex flex-col overflow-hidden">
        <!-- Chat Header -->
        <div class="bg-gradient-to-r from-primary-500 to-blue-600 p-4 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-robot text-lg"></i>
              </div>
              <div>
                <h3 class="font-semibold">ChefBot</h3>
                <p class="text-xs opacity-90">Tu asistente culinario</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-xs">En línea</span>
              </div>
              <button id="chat-minimize" class="p-1 hover:bg-white hover:bg-opacity-20 rounded">
                <i class="fas fa-minus text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
          <!-- Messages will be added here -->
        </div>

        <!-- Typing Indicator -->
        <div id="typing-indicator" class="hidden px-4 py-2 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span class="text-sm">ChefBot está escribiendo...</span>
          </div>
        </div>

        <!-- Suggested Questions -->
        <div id="suggested-questions" class="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-2 mb-2">
            <!-- Suggestions will be added here -->
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
          <div class="flex items-center space-x-2">
            <div class="flex-1 relative">
              <input type="text" id="chat-input" placeholder="Pregúntame sobre recetas, ingredientes..." 
                     class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm">
              <button id="chat-send" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors">
                <i class="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Presiona Enter para enviar</span>
            <div class="flex items-center space-x-2">
              <button id="clear-chat" class="hover:text-gray-700 dark:hover:text-gray-300">
                <i class="fas fa-trash mr-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(widget)
  }

  setupEventListeners() {
    // Toggle chat
    document.getElementById("chat-toggle").addEventListener("click", () => {
      this.toggleChat()
    })

    // Minimize chat
    document.getElementById("chat-minimize").addEventListener("click", () => {
      this.toggleChat()
    })

    // Send message
    document.getElementById("chat-send").addEventListener("click", () => {
      this.sendMessage()
    })

    // Enter key to send
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage()
      }
    })

    // Clear chat
    document.getElementById("clear-chat").addEventListener("click", () => {
      this.clearChat()
    })

    // Close chat when clicking outside
    document.addEventListener("click", (e) => {
      const chatWindow = document.getElementById("chat-window")
      const chatToggle = document.getElementById("chat-toggle")

      if (this.isOpen && !chatWindow.contains(e.target) && !chatToggle.contains(e.target)) {
        this.toggleChat()
      }
    })
  }

  toggleChat() {
    const chatWindow = document.getElementById("chat-window")
    const chatIcon = document.getElementById("chat-icon")
    const unreadBadge = document.getElementById("unread-badge")

    this.isOpen = !this.isOpen

    if (this.isOpen) {
      chatWindow.classList.remove("hidden")
      chatIcon.className = "fas fa-times text-xl"
      unreadBadge.classList.add("hidden")
      this.unreadCount = 0

      // Focus input
      setTimeout(() => {
        document.getElementById("chat-input").focus()
      }, 100)
    } else {
      chatWindow.classList.add("hidden")
      chatIcon.className = "fas fa-comments text-xl"
    }
  }

  async sendMessage() {
    const input = document.getElementById("chat-input")
    const message = input.value.trim()

    if (!message) return

    // Add user message
    this.addMessage(message, "user")
    input.value = ""

    // Show typing indicator
    this.showTyping()

    try {
      // Get bot response
      const response = await this.chatbotService.processMessage(message)

      // Hide typing indicator
      this.hideTyping()

      // Add bot response
      this.addMessage(response.content, "bot")

      // Update suggestions
      this.updateSuggestions()
    } catch (error) {
      this.hideTyping()
      this.addMessage("Lo siento, hubo un error. ¿Podrías intentar de nuevo?", "bot")
    }
  }

  addMessage(content, type) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageDiv = document.createElement("div")

    const isUser = type === "user"
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    messageDiv.className = `flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`
    messageDiv.innerHTML = `
      <div class="max-w-xs lg:max-w-md">
        <div class="${
          isUser
            ? "bg-primary-500 text-white rounded-l-2xl rounded-tr-2xl"
            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-r-2xl rounded-tl-2xl shadow-sm"
        } px-4 py-3 relative">
          ${!isUser ? '<i class="fas fa-robot text-primary-500 absolute -left-2 -top-2 bg-white dark:bg-gray-800 rounded-full p-1 text-xs"></i>' : ""}
          <p class="text-sm leading-relaxed">${content}</p>
          <span class="text-xs opacity-70 mt-1 block">${timestamp}</span>
        </div>
      </div>
    `

    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Update unread count if chat is closed
    if (!this.isOpen && type === "bot") {
      this.unreadCount++
      this.updateUnreadBadge()
    }
  }

  showTyping() {
    document.getElementById("typing-indicator").classList.remove("hidden")
    const messagesContainer = document.getElementById("chat-messages")
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  hideTyping() {
    document.getElementById("typing-indicator").classList.add("hidden")
  }

  updateUnreadBadge() {
    const badge = document.getElementById("unread-badge")
    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 9 ? "9+" : this.unreadCount
      badge.classList.remove("hidden")
    } else {
      badge.classList.add("hidden")
    }
  }

  updateSuggestions() {
    const suggestionsContainer = document.getElementById("suggested-questions")
    const suggestions = this.chatbotService.getSuggestedQuestions()
    const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3)

    suggestionsContainer.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-2">
        ${randomSuggestions
          .map(
            (suggestion) => `
          <button class="suggestion-btn px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
            ${suggestion}
          </button>
        `,
          )
          .join("")}
      </div>
    `

    // Add click handlers for suggestions
    suggestionsContainer.querySelectorAll(".suggestion-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("chat-input").value = btn.textContent
        this.sendMessage()
      })
    })
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage("¡Hola! Soy ChefBot, tu asistente culinario personal. ¿En qué puedo ayudarte hoy? 👨‍🍳", "bot")
      this.updateSuggestions()
    }, 1000)
  }

  clearChat() {
    const messagesContainer = document.getElementById("chat-messages")
    messagesContainer.innerHTML = ""
    this.chatbotService.clearHistory()
    this.showWelcomeMessage()
  }
}
