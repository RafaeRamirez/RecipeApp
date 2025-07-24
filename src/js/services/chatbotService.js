export class ChatbotService {
  constructor() {
    this.responses = {
      greetings: [
        "¡Hola! Soy ChefBot, tu asistente culinario personal. ¿En qué puedo ayudarte hoy?",
        "¡Bienvenido! Estoy aquí para ayudarte con recetas, consejos de cocina y más. ¿Qué necesitas?",
        "¡Hola chef! ¿Listo para cocinar algo delicioso? ¿Cómo puedo asistirte?",
      ],
      recipes: [
        "Te puedo ayudar a encontrar recetas perfectas para ti. ¿Qué tipo de comida te apetece? ¿Italiana, mexicana, saludable?",
        "¡Excelente elección! Tengo miles de recetas. ¿Prefieres algo rápido, vegetariano, o tienes algún ingrediente específico?",
        "Para encontrar la receta perfecta, dime: ¿cuánto tiempo tienes para cocinar y qué ingredientes tienes disponibles?",
      ],
      ingredients: [
        "¡Perfecto! Con esos ingredientes puedo sugerirte varias opciones deliciosas. ¿Prefieres algo salado o dulce?",
        "Esos ingredientes son geniales. ¿Te gustaría una receta rápida de 30 minutos o algo más elaborado?",
        "Con esos ingredientes podemos hacer magia en la cocina. ¿Qué tipo de plato tienes en mente?",
      ],
      cooking_tips: [
        "¡Gran pregunta! Aquí tienes un consejo profesional: siempre precalienta el horno y ten todos los ingredientes listos antes de empezar.",
        "Consejo de chef: prueba siempre la comida mientras cocinas y ajusta los condimentos gradualmente.",
        "Tip importante: deja que la carne repose después de cocinarla para que los jugos se redistribuyan.",
      ],
      nutrition: [
        "La nutrición es clave para una vida saludable. ¿Te interesa información sobre calorías, macronutrientes o dietas específicas?",
        "¡Excelente pregunta! Una dieta balanceada incluye proteínas, carbohidratos complejos, grasas saludables y muchas verduras.",
        "Para una alimentación saludable, trata de incluir colores variados en tu plato: cada color aporta nutrientes diferentes.",
      ],
      substitutions: [
        "¡Por supuesto! Puedo ayudarte con sustituciones. ¿Qué ingrediente necesitas reemplazar y por qué razón?",
        "Las sustituciones son mi especialidad. ¿Es por alergias, dieta específica o simplemente no tienes el ingrediente?",
        "¡Claro! Hay muchas alternativas. Dime qué ingrediente quieres sustituir y te daré las mejores opciones.",
      ],
      default: [
        "Interesante pregunta. ¿Podrías ser más específico? Puedo ayudarte con recetas, ingredientes, técnicas de cocina o nutrición.",
        "No estoy seguro de entender completamente. ¿Te refieres a recetas, consejos de cocina o información nutricional?",
        "¡Me encanta ayudar! ¿Podrías reformular tu pregunta? Soy experto en cocina, recetas y nutrición.",
      ],
    }

    this.keywords = {
      greetings: ["hola", "hi", "hello", "buenos días", "buenas tardes", "buenas noches", "saludos"],
      recipes: ["receta", "cocinar", "plato", "comida", "preparar", "hacer", "recipe"],
      ingredients: ["ingrediente", "tengo", "disponible", "usar", "con qué"],
      cooking_tips: ["consejo", "tip", "cómo", "técnica", "método", "ayuda"],
      nutrition: ["nutrición", "calorías", "saludable", "dieta", "proteína", "vitamina"],
      substitutions: ["sustituir", "reemplazar", "cambiar", "alternativa", "sin", "alérgico"],
    }

    this.conversationHistory = []
  }

  async processMessage(message) {
    const userMessage = {
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    this.conversationHistory.push(userMessage)

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const response = this.generateResponse(message)
    const botMessage = {
      type: "bot",
      content: response,
      timestamp: new Date(),
    }

    this.conversationHistory.push(botMessage)
    return botMessage
  }

  generateResponse(message) {
    const lowerMessage = message.toLowerCase()

    // Check for specific recipe requests
    if (this.containsKeywords(lowerMessage, ["pasta", "espagueti", "spaghetti"])) {
      return "¡La pasta es deliciosa! Te recomiendo probar espaguetis a la carbonara o pasta con salsa de tomate fresco. ¿Prefieres algo cremoso o con tomate?"
    }

    if (this.containsKeywords(lowerMessage, ["pollo", "chicken"])) {
      return "¡El pollo es muy versátil! Puedes hacerlo a la plancha, al horno, en curry o frito. ¿Qué estilo prefieres? ¿Algo saludable o más indulgente?"
    }

    if (this.containsKeywords(lowerMessage, ["vegetariano", "vegano", "vegetarian", "vegan"])) {
      return "¡Las opciones vegetarianas son increíbles! Te sugiero probar quinoa bowls, curry de lentejas o pasta con verduras. ¿Tienes alguna preferencia específica?"
    }

    if (this.containsKeywords(lowerMessage, ["postre", "dulce", "dessert"])) {
      return "¡Los postres son mi debilidad! ¿Te apetece algo chocolatoso, frutal o cremoso? Puedo sugerirte desde brownies hasta tiramisú."
    }

    if (this.containsKeywords(lowerMessage, ["rápido", "quick", "30 minutos", "fácil"])) {
      return "¡Perfecto para días ocupados! Te recomiendo salteados, ensaladas completas, pasta simple o sándwiches gourmet. ¿Qué ingredientes tienes a mano?"
    }

    // Check for general categories
    for (const [category, keywords] of Object.entries(this.keywords)) {
      if (this.containsKeywords(lowerMessage, keywords)) {
        return this.getRandomResponse(category)
      }
    }

    // Special responses for specific questions
    if (lowerMessage.includes("tiempo") && lowerMessage.includes("cocinar")) {
      return "El tiempo de cocción depende del plato. ¿Qué quieres preparar? Te puedo dar tiempos específicos para diferentes técnicas."
    }

    if (lowerMessage.includes("temperatura") || lowerMessage.includes("horno")) {
      return "Las temperaturas son cruciales. Para hornear: 180°C es estándar, para asar: 200-220°C, para cocción lenta: 160°C. ¿Qué vas a cocinar?"
    }

    if (lowerMessage.includes("sal") || lowerMessage.includes("condimento")) {
      return "¡Los condimentos son el alma de la cocina! Sal al gusto, pero recuerda: siempre puedes agregar más, pero no quitar. ¿Necesitas consejos sobre especias específicas?"
    }

    return this.getRandomResponse("default")
  }

  containsKeywords(message, keywords) {
    return keywords.some((keyword) => message.includes(keyword))
  }

  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default
    return responses[Math.floor(Math.random() * responses.length)]
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearHistory() {
    this.conversationHistory = []
  }

  getSuggestedQuestions() {
    return [
      "¿Qué puedo cocinar con pollo?",
      "Dame una receta vegetariana rápida",
      "¿Cómo sustituyo los huevos en repostería?",
      "Consejos para cocinar pasta perfecta",
      "¿Qué especias van bien con el salmón?",
      "Recetas saludables para cenar",
      "¿Cómo hacer que las verduras sepan mejor?",
      "Postres sin azúcar refinada",
    ]
  }
}
