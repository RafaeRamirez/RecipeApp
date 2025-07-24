# Configuración de Spoonacular API

## 1. Obtener API Key

1. Ve a [Spoonacular Food API](https://spoonacular.com/food-api)
2. Crea una cuenta gratuita
3. Ve a tu dashboard y copia tu API key
4. El plan gratuito incluye 150 requests por día

## 2. Configurar en el proyecto

1. Crea un archivo `.env` en la raíz del proyecto:
\`\`\`bash
VITE_SPOONACULAR_API_KEY=tu_api_key_aqui
\`\`\`

2. Reinicia el servidor de desarrollo:
\`\`\`bash
npm run dev:full
\`\`\`

## 3. Funcionalidades disponibles

### Búsqueda de recetas
- Búsqueda por texto libre
- Filtros por dieta (vegetariana, vegana, keto, etc.)
- Filtros por cocina (italiana, mexicana, etc.)
- Filtros por tiempo de preparación
- Autocompletado de búsquedas

### Información detallada
- Ingredientes con cantidades exactas
- Instrucciones paso a paso
- Información nutricional completa
- Imágenes de alta calidad
- Enlaces a recetas originales

### Funciones adicionales
- Recetas aleatorias
- Recetas similares
- Búsqueda por ingredientes
- Sugerencias inteligentes

## 4. Límites y consideraciones

### Plan gratuito
- 150 requests por día
- Todas las funcionalidades disponibles
- Perfecto para desarrollo y pruebas

### Planes pagos
- Desde $19/mes por 1,500 requests/día
- Hasta planes enterprise con requests ilimitados
- Soporte prioritario

## 5. Optimizaciones implementadas

### Cache inteligente
- Las respuestas se cachean por 5 minutos
- Reduce el consumo de requests
- Mejora la velocidad de respuesta

### Fallback a datos locales
- Si no hay API key configurada, usa datos locales
- Transición suave entre modos
- No interrumpe la experiencia del usuario

### Manejo de errores
- Detección automática de límites alcanzados
- Mensajes informativos para el usuario
- Reintentos automáticos cuando es apropiado

## 6. Estructura de datos

La aplicación transforma automáticamente los datos de Spoonacular al formato interno, manteniendo compatibilidad con el resto del sistema.

## 7. Monitoreo de uso

Puedes monitorear tu uso de API en el dashboard de Spoonacular:
- Requests realizados hoy
- Requests restantes
- Historial de uso
- Estadísticas detalladas
