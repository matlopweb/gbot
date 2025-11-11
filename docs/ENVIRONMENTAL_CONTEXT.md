# 🌍 Contexto Ambiental - Clima, Tráfico y Noticias

GBot ahora puede proporcionarte información sobre tu entorno: clima actual, pronóstico, sugerencias de vestimenta y más.

## ✨ **Funcionalidades**

### 1️⃣ **Clima Actual y Pronóstico** 🌤️

**Qué puede hacer:**
- Obtener temperatura actual
- Condiciones meteorológicas
- Sensación térmica
- Humedad y viento
- Pronóstico de 3 días
- Alertas de lluvia/nieve

**Ejemplos de uso:**
```
Usuario: "¿Qué clima hace?"
Bot: "En Buenos Aires hace 22°C (sensación: 24°C), cielo despejado. 
     Humedad: 65%, Viento: 3 m/s."

Usuario: "¿Cómo va a estar el clima mañana?"
Bot: [Incluye pronóstico de los próximos días]

Usuario: "¿Va a llover hoy?"
Bot: [Verifica pronóstico y alerta si hay lluvia]
```

### 2️⃣ **Sugerencias de Vestimenta** 👕

**Qué hace:**
- Analiza temperatura actual
- Considera condiciones (lluvia, viento, etc.)
- Sugiere ropa apropiada

**Ejemplos:**
```
Usuario: "¿Qué me pongo hoy?"
Bot: "👕 Temperatura agradable (22°C). Ropa ligera está bien."

Usuario: "¿Necesito abrigo?"
Bot: "🧥 Está fresco (15°C). Una chaqueta o suéter sería ideal. 
     ☔ No olvides paraguas, hay posibilidad de lluvia."
```

**Sugerencias según temperatura:**
- **< 10°C**: 🧥 Abrigo, bufanda y guantes
- **10-18°C**: 🧥 Chaqueta o suéter
- **18-25°C**: 👕 Ropa ligera
- **25-30°C**: ☀️ Ropa fresca
- **> 30°C**: 🔥 Ropa muy ligera + hidratación

**Condiciones especiales:**
- ☔ Lluvia → Paraguas o impermeable
- ❄️ Nieve → Abrigarse bien
- 💨 Viento fuerte → Ropa que proteja del viento

### 3️⃣ **Verificar Momento para Salir** 🚶

**Qué hace:**
- Evalúa condiciones actuales
- Determina si es buen momento para salir
- Proporciona recomendaciones

**Ejemplos:**
```
Usuario: "¿Es buen momento para salir?"
Bot: "Buen momento para salir. 22°C y cielo despejado. ☀️"

Usuario: "¿Puedo salir a correr?"
Bot: "Puedes salir, pero lleva paraguas. Está lloviendo. 🌧️"

Usuario: "¿Salgo ahora o espero?"
Bot: "No es buen momento. Hay tormenta. Mejor espera un poco."
```

**Criterios de evaluación:**
- ❌ **No salir**: Tormenta, nieve, lluvia fuerte, temperatura extrema (<5°C o >35°C)
- ⚠️ **Con precaución**: Lluvia ligera, llovizna
- ✅ **Buen momento**: Condiciones normales

## 🔧 **Configuración**

### **1. OpenWeather API (Clima)**

**Gratis:** 1,000 llamadas/día

1. Ve a: https://openweathermap.org/api
2. Crea cuenta gratuita
3. Ve a "API keys"
4. Copia tu API key

**Agrega a `.env`:**
```bash
OPENWEATHER_API_KEY=tu-api-key-aqui
```

### **2. News API (Noticias)** - Opcional

**Gratis:** 100 requests/día

1. Ve a: https://newsapi.org
2. Regístrate gratis
3. Copia tu API key

**Agrega a `.env`:**
```bash
NEWS_API_KEY=tu-api-key-aqui
```

### **3. Reiniciar Servidor**

```bash
npm run dev
```

## 📊 **Datos Proporcionados**

### **Clima Actual:**
```javascript
{
  temperature: 22,        // °C
  feelsLike: 24,         // Sensación térmica
  description: "cielo despejado",
  humidity: 65,          // %
  windSpeed: 3,          // m/s
  city: "Buenos Aires",
  sunrise: Date,
  sunset: Date
}
```

### **Pronóstico:**
```javascript
[
  {
    date: "12/11/2025",
    tempMax: 25,
    tempMin: 18,
    description: "parcialmente nublado",
    humidity: 70,
    rain: false
  },
  // ... más días
]
```

## 🎯 **Casos de Uso**

### **Escenario 1: Planificar el Día**
```
Usuario: "¿Cómo está el clima hoy?"
Bot: "22°C y soleado. Buen día para actividades al aire libre."

Usuario: "¿Qué me pongo?"
Bot: "Ropa ligera está bien. Temperatura agradable."

Usuario: "¿Puedo salir a correr?"
Bot: "¡Perfecto momento para correr! 22°C y cielo despejado."
```

### **Escenario 2: Prepararse para Lluvia**
```
Usuario: "¿Va a llover hoy?"
Bot: "Sí, hay 80% de probabilidad de lluvia esta tarde."

Usuario: "¿Qué me pongo?"
Bot: "Ropa ligera, pero no olvides paraguas o impermeable. ☔"
```

### **Escenario 3: Clima Extremo**
```
Usuario: "¿Puedo salir?"
Bot: "No es buen momento. Hay tormenta eléctrica. 
     Mejor espera que pase."

Usuario: "¿Cuándo mejora?"
Bot: "Según el pronóstico, mejorará en 2-3 horas."
```

### **Escenario 4: Viaje**
```
Usuario: "¿Cómo va a estar el clima el fin de semana?"
Bot: "Sábado: 20-25°C, soleado
     Domingo: 18-23°C, parcialmente nublado
     Buen fin de semana para salir."
```

## 🌡️ **Información Detallada**

### **Temperatura:**
- Actual en °C
- Sensación térmica
- Máxima y mínima del día

### **Condiciones:**
- Descripción (soleado, nublado, lluvia, etc.)
- Visibilidad
- Presión atmosférica

### **Viento:**
- Velocidad en m/s
- Dirección

### **Humedad:**
- Porcentaje de humedad relativa

### **Sol:**
- Hora de amanecer
- Hora de atardecer

## 🔮 **Predicciones Inteligentes**

El bot puede hacer predicciones basadas en el clima:

```
Bot (proactivo): "Hola! Hoy va a llover por la tarde. 
                  ¿Quieres que reprograme tu reunión 
                  al aire libre?"

Bot (proactivo): "Mañana hará mucho calor (35°C). 
                  Recuerda mantenerte hidratado."

Bot (proactivo): "Viene una ola de frío. 
                  ¿Necesitas que te recuerde llevar abrigo?"
```

## 📱 **Integración con Calendario**

El bot puede sugerir cambios en tu agenda según el clima:

```
Usuario: "¿Tengo algo para mañana?"
Bot: "Tienes una reunión al aire libre a las 3 PM, 
     pero el pronóstico indica lluvia. 
     ¿Quieres que la reprograme o cambie a virtual?"
```

## 🎨 **Personalización**

### **Cambiar Ubicación:**

Por defecto usa Buenos Aires. Para cambiar:

```javascript
// En environmentalContext.js
this.userLocation = {
  city: 'Tu Ciudad',
  country: 'Tu País',
  lat: -34.6037,  // Tu latitud
  lon: -58.3816   // Tu longitud
};
```

### **Unidades:**

Por defecto usa:
- Temperatura: Celsius (°C)
- Viento: metros/segundo (m/s)
- Idioma: Español

Para cambiar a Fahrenheit:
```javascript
// En la URL de la API, cambiar units=metric a units=imperial
```

## 🚀 **Próximas Mejoras**

- [ ] **Tráfico en tiempo real** - Google Maps API
- [ ] **Calidad del aire** - AQI
- [ ] **Alertas meteorológicas** - Notificaciones push
- [ ] **Radar de lluvia** - Visualización
- [ ] **UV Index** - Protección solar
- [ ] **Polen** - Para alergias
- [ ] **Geolocalización automática** - Detectar ubicación del usuario
- [ ] **Múltiples ubicaciones** - Comparar clima en diferentes ciudades

## 💡 **Tips**

1. **Consulta por la mañana** - Planifica tu día según el clima
2. **Verifica antes de salir** - Evita sorpresas
3. **Usa pronóstico** - Planifica actividades de fin de semana
4. **Combina con calendario** - Organiza eventos según el clima

## 🐛 **Troubleshooting**

### **"No pude obtener información del clima"**

**Causas:**
1. API key no configurada
2. Límite de requests excedido
3. Error de red

**Solución:**
```bash
# Verificar .env
cat backend/.env | grep OPENWEATHER

# Verificar límites en: https://home.openweathermap.org/api_keys
```

### **Ubicación Incorrecta**

**Solución:**
Actualiza las coordenadas en `environmentalContext.js`:
```javascript
lat: -34.6037,  // Tu latitud
lon: -58.3816   // Tu longitud
```

Puedes obtener coordenadas en: https://www.latlong.net/

## 📚 **APIs Utilizadas**

### **OpenWeather API**
- **Documentación**: https://openweathermap.org/api
- **Endpoints**:
  - Current weather: `/weather`
  - Forecast: `/forecast`
- **Límites gratis**: 1,000 calls/día

### **News API** (Opcional)
- **Documentación**: https://newsapi.org/docs
- **Endpoints**:
  - Top headlines: `/top-headlines`
  - Everything: `/everything`
- **Límites gratis**: 100 requests/día

---

**¡GBot ahora conoce tu entorno y puede ayudarte mejor!** 🌍✨

## 🎯 **Comandos Útiles**

```
"¿Qué clima hace?"
"¿Cómo va a estar mañana?"
"¿Qué me pongo?"
"¿Necesito abrigo?"
"¿Va a llover?"
"¿Es buen momento para salir?"
"¿Puedo salir a correr?"
"Pronóstico de la semana"
```
