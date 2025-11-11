# 🌐 Búsqueda Web en Tiempo Real

GBot ahora tiene acceso a internet y puede buscar información actualizada para responder preguntas sobre eventos recientes, conceptos nuevos y cualquier cosa posterior a octubre 2023.

## ✨ **¿Qué Resuelve?**

### ❌ **Antes (Sin Internet):**
```
Usuario: "¿Qué es ChatGPT Atlas?"
Bot: "No reconozco ese término. Podría ser algo posterior a octubre 2023..."
```

### ✅ **Ahora (Con Internet):**
```
Usuario: "¿Qué es ChatGPT Atlas?"
Bot: [Busca en internet]
Bot: "ChatGPT Atlas es el nuevo modelo de OpenAI lanzado en noviembre 2024, 
     que incluye capacidades de razonamiento avanzado y..."
```

## 🔧 **Configuración**

### 1. **Obtener API Key de Tavily**

Tavily es un motor de búsqueda optimizado para IA:

1. Ve a: https://tavily.com
2. Regístrate gratis (incluye 1000 búsquedas/mes gratis)
3. Copia tu API key

### 2. **Configurar en .env**

Agrega a tu archivo `backend/.env`:

```bash
TAVILY_API_KEY=tvly-tu-api-key-aqui
```

### 3. **Reiniciar el Servidor**

```bash
npm run dev
```

## 🎯 **Cómo Funciona**

### **Detección Automática**

GPT-4o decide automáticamente cuándo buscar en internet:

```javascript
// GPT detecta que no sabe algo
Usuario: "¿Qué pasó en las elecciones de Argentina 2024?"

// GPT llama a search_web
{
  function: "search_web",
  query: "elecciones Argentina 2024 resultados",
  searchType: "news"
}

// Obtiene resultados actualizados
// Responde con información real
```

### **Tipos de Búsqueda**

#### 1. **General** (información general)
```
Usuario: "¿Cómo funciona la nueva IA de Google?"
→ search_web(query="nueva IA Google", searchType="general")
```

#### 2. **News** (noticias recientes)
```
Usuario: "¿Qué noticias hay sobre tecnología?"
→ search_web(query="noticias tecnología", searchType="news")
```

#### 3. **Entity** (personas, empresas, conceptos)
```
Usuario: "¿Quién es Sam Altman?"
→ search_web(query="Sam Altman", searchType="entity")
```

## 📋 **Ejemplos de Uso**

### **Ejemplo 1: Información Reciente**
```
Usuario: "¿Qué es Gemini 2.0?"

Bot: [Busca en internet]
Bot: "Gemini 2.0 es el nuevo modelo de IA de Google lanzado en 
     diciembre 2024. Incluye mejoras en razonamiento multimodal,
     procesamiento de video en tiempo real y..."
     
     Fuentes:
     - Google AI Blog
     - TechCrunch
```

### **Ejemplo 2: Noticias**
```
Usuario: "¿Qué pasó hoy en el mundo?"

Bot: [Busca noticias]
Bot: "Aquí están las noticias más relevantes de hoy:
     
     1. Nueva actualización de ChatGPT incluye...
     2. Argentina anuncia...
     3. Tesla lanza..."
```

### **Ejemplo 3: Conceptos Nuevos**
```
Usuario: "¿Qué es Sora de OpenAI?"

Bot: [Busca información]
Bot: "Sora es el modelo de generación de video de OpenAI,
     lanzado en febrero 2024. Puede crear videos realistas
     de hasta 60 segundos a partir de texto..."
```

### **Ejemplo 4: Personas**
```
Usuario: "¿Quién ganó el Nobel de Física 2024?"

Bot: [Busca información]
Bot: "El Premio Nobel de Física 2024 fue otorgado a..."
```

## 🎨 **Formato de Respuestas**

Las respuestas incluyen:

1. **Respuesta directa** - Resumen conciso
2. **Fuentes** - Enlaces a sitios web confiables
3. **Contexto** - Información adicional relevante

```
Bot: "ChatGPT Atlas es el nuevo modelo de OpenAI...

     Fuentes:
     1. OpenAI Blog - Introducing ChatGPT Atlas
        https://openai.com/blog/chatgpt-atlas
        
     2. TechCrunch - OpenAI launches Atlas with...
        https://techcrunch.com/...
        
     3. The Verge - What you need to know about...
        https://theverge.com/..."
```

## 🚀 **Ventajas de Tavily**

### **¿Por qué Tavily y no Google?**

1. **Optimizado para IA** - Resultados estructurados para LLMs
2. **Respuestas directas** - Incluye resumen automático
3. **Sin ruido** - Filtra contenido irrelevante
4. **Rápido** - Optimizado para latencia baja
5. **Económico** - 1000 búsquedas gratis/mes

### **Comparación:**

| Característica | Tavily | Google Search API |
|---------------|--------|-------------------|
| Precio (1000 búsquedas) | Gratis | $5 |
| Optimizado para IA | ✅ | ❌ |
| Respuesta directa | ✅ | ❌ |
| Formato estructurado | ✅ | Parcial |
| Latencia | Baja | Media |

## 🔒 **Privacidad y Seguridad**

- ✅ Las búsquedas son anónimas
- ✅ No se comparte información personal
- ✅ API key encriptada en servidor
- ✅ Sin tracking de usuario

## 📊 **Límites**

### **Plan Gratuito:**
- 1000 búsquedas/mes
- 3 resultados por búsqueda
- Búsqueda básica

### **Plan Pro ($29/mes):**
- 10,000 búsquedas/mes
- 10 resultados por búsqueda
- Búsqueda avanzada
- Prioridad en respuestas

## 🎯 **Casos de Uso**

### **1. Información Actualizada**
```
"¿Cuál es el precio actual de Bitcoin?"
"¿Qué clima hace en Buenos Aires?"
"¿Cuándo es el próximo eclipse solar?"
```

### **2. Noticias y Eventos**
```
"¿Qué pasó en la Copa del Mundo?"
"Noticias sobre inteligencia artificial"
"¿Qué anunció Apple recientemente?"
```

### **3. Investigación**
```
"¿Cómo funciona la computación cuántica?"
"Mejores prácticas de React 2024"
"Tutorial de Next.js 14"
```

### **4. Verificación de Hechos**
```
"¿Es cierto que OpenAI lanzó GPT-5?"
"¿Cuándo fue fundada Tesla?"
"¿Quién es el CEO de Microsoft?"
```

## 🛠️ **Troubleshooting**

### **Error: "No se pudo realizar la búsqueda"**

**Causas:**
1. API key no configurada
2. Límite de búsquedas excedido
3. Error de red

**Solución:**
```bash
# Verificar .env
cat backend/.env | grep TAVILY

# Verificar logs
# Buscar: "Tavily API key not configured"
```

### **Búsquedas Lentas**

**Causas:**
1. Conexión lenta
2. Búsqueda avanzada activada

**Solución:**
- Usar `searchType: 'basic'` para búsquedas más rápidas

### **Resultados Irrelevantes**

**Solución:**
- Mejorar la query en el código
- Usar filtros de dominio

## 🔮 **Próximas Mejoras**

- [ ] **Caché de búsquedas** - Guardar resultados frecuentes
- [ ] **Búsqueda multimodal** - Incluir imágenes
- [ ] **Filtros personalizados** - Por fecha, fuente, idioma
- [ ] **Resúmenes automáticos** - Con GPT-4
- [ ] **Fact-checking** - Verificación cruzada de fuentes
- [ ] **Búsqueda local** - Información geolocalizada

## 💡 **Tips**

1. **Sé específico** - "Precio Bitcoin hoy" mejor que "Bitcoin"
2. **Usa contexto** - "Noticias IA noviembre 2024"
3. **Verifica fuentes** - Revisa los enlaces proporcionados
4. **Combina con memoria** - El bot recordará búsquedas anteriores

## 📝 **Comandos Útiles**

```
"Busca información sobre [tema]"
"¿Qué noticias hay sobre [tema]?"
"¿Qué es [concepto nuevo]?"
"¿Quién es [persona]?"
"Dame información actualizada sobre [tema]"
```

---

**¡GBot ahora tiene acceso a internet y conocimiento actualizado!** 🌐✨

## 🎓 **Recursos**

- [Tavily Documentation](https://docs.tavily.com)
- [Tavily API Reference](https://docs.tavily.com/api-reference)
- [Pricing](https://tavily.com/pricing)
