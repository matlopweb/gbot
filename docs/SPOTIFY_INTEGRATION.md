# 🎵 Integración con Spotify - Control de Música por Voz

GBot ahora puede controlar tu música de Spotify con comandos de voz, reproducir playlists según tu actividad y sugerir música según tu estado de ánimo.

## ✨ **Funcionalidades**

### 🎮 **Control Básico**
- ▶️ Reproducir / Pausar
- ⏭️ Siguiente canción
- ⏮️ Canción anterior
- 🔊 Ajustar volumen
- 🔀 Shuffle on/off
- 🔁 Repeat

### 🎯 **Control Inteligente**
- 🎼 Reproducir música para actividades específicas
- 🔍 Buscar y reproducir canciones/artistas
- 📋 Acceder a tus playlists
- 🎭 Música según estado de ánimo
- ℹ️ Información de canción actual

## 🔧 **Configuración**

### **Paso 1: Crear App en Spotify**

1. Ve a: https://developer.spotify.com/dashboard
2. Inicia sesión con tu cuenta de Spotify
3. Click en "Create app"
4. Completa:
   - **App name**: GBot
   - **App description**: Asistente personal con control de Spotify
   - **Redirect URI**: `http://localhost:3001/api/spotify/callback`
   - **APIs used**: Web API
5. Acepta los términos y crea la app
6. En la página de tu app, ve a "Settings"
7. Copia:
   - **Client ID**
   - **Client Secret** (click "View client secret")

### **Paso 2: Configurar en .env**

Agrega a `backend/.env`:

```bash
SPOTIFY_CLIENT_ID=tu-client-id-aqui
SPOTIFY_CLIENT_SECRET=tu-client-secret-aqui
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
SPOTIFY_STATE_SECRET=una-cadena-larga-y-aleatoria
```

> `SPOTIFY_STATE_SECRET` se usa para firmar el parámetro `state` y evitar que terceros inyecten callbacks maliciosos. Una cadena de al menos 32 caracteres es suficiente.

### **Paso 3: Conectar Cuenta**

1. Reinicia el servidor:
```bash
npm run dev
```

2. En el frontend, ve a configuración
3. Click en "Conectar Spotify"
4. Autoriza la aplicación
5. ¡Listo! Ahora puedes controlar Spotify por voz

## 🎤 **Comandos de Voz**

### **Control Básico:**
```
"Reproduce música"
"Pausa la música"
"Siguiente canción"
"Canción anterior"
"Sube el volumen"
"Baja el volumen a 50%"
"¿Qué canción está sonando?"
```

### **Búsqueda:**
```
"Reproduce Bohemian Rhapsody"
"Pon música de Queen"
"Reproduce la playlist Chill Vibes"
"Busca canciones de The Beatles"
```

### **Música para Actividades:**
```
"Pon música para programar"
"Música para estudiar"
"Música para ejercicio"
"Música para relajarme"
"Música para trabajar"
"Música para concentrarme"
```

### **Estado de Ánimo:**
```
"Pon música alegre"
"Música triste"
"Música para fiesta"
"Música energética"
"Música relajante"
```

## 📋 **Funciones Disponibles**

### **1. spotify_play**
Reproduce la música actual o reanuda reproducción.

```javascript
Usuario: "Reproduce música"
Bot: "Reproduciendo música"
```

### **2. spotify_pause**
Pausa la reproducción actual.

```javascript
Usuario: "Pausa la música"
Bot: "Música pausada"
```

### **3. spotify_next**
Salta a la siguiente canción.

```javascript
Usuario: "Siguiente"
Bot: "Siguiente canción"
```

### **4. spotify_previous**
Vuelve a la canción anterior.

```javascript
Usuario: "Anterior"
Bot: "Canción anterior"
```

### **5. spotify_volume**
Ajusta el volumen (0-100%).

```javascript
Usuario: "Sube el volumen a 80"
Bot: "Volumen ajustado a 80%"
```

### **6. spotify_play_for_activity**
Reproduce música apropiada para una actividad.

```javascript
Usuario: "Pon música para programar"
Bot: "Reproduciendo música para programar: Lo-Fi Beats"
```

**Actividades soportadas:**
- Programar
- Estudiar
- Trabajar
- Ejercicio
- Relajarse
- Dormir
- Cocinar
- Leer

### **7. spotify_current_track**
Muestra información de la canción actual.

```javascript
Usuario: "¿Qué canción está sonando?"
Bot: "Sonando: 'Bohemian Rhapsody' por Queen del álbum 'A Night at the Opera'"
```

### **8. spotify_search**
Busca y reproduce una canción o playlist.

```javascript
Usuario: "Reproduce Imagine de John Lennon"
Bot: "Reproduciendo: 'Imagine' por John Lennon"
```

## 🎭 **Música por Estado de Ánimo**

El bot puede sugerir música según tu estado de ánimo:

| Estado de Ánimo | Géneros Sugeridos |
|-----------------|-------------------|
| Concentración | Ambient, Classical, Piano, Study |
| Programar | Electronic, Chill, Lo-Fi, Instrumental |
| Ejercicio | Workout, Rock, EDM, Hip-Hop |
| Relajación | Ambient, Jazz, Acoustic, Chill |
| Fiesta | Dance, Pop, Reggaeton, Electronic |
| Trabajo | Focus, Classical, Instrumental |
| Estudio | Classical, Lo-Fi, Piano, Ambient |
| Energía | Rock, EDM, Pop, Workout |
| Tristeza | Sad, Acoustic, Indie, Alternative |
| Felicidad | Happy, Pop, Dance, Indie |

## 🤖 **Integración con Comportamiento Proactivo**

El bot puede sugerir música automáticamente:

```
Bot (proactivo): "Veo que estás trabajando. ¿Quieres que ponga música para concentrarte?"

Bot (proactivo): "Es hora de tu sesión de ejercicio. ¿Pongo tu playlist de workout?"

Bot (proactivo): "Llevas 2 horas programando. ¿Quieres que cambie a música más relajante?"
```

## 📊 **Información de Reproducción**

El bot puede mostrar detalles de lo que está sonando:

```javascript
{
  isPlaying: true,
  track: {
    name: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 354000,  // ms
    progress: 120000,  // ms
    image: "https://..."
  },
  device: {
    name: "Mi PC",
    type: "Computer",
    volume: 75
  },
  shuffleState: false,
  repeatState: "off"
}
```

## 🎯 **Casos de Uso**

### **Escenario 1: Sesión de Programación**
```
Usuario: "Voy a programar"
Bot: "¿Quieres que ponga música para programar?"
Usuario: "Sí"
Bot: "Reproduciendo música para programar: Coding Music"

[2 horas después]
Bot (proactivo): "Llevas 2 horas programando. ¿Quieres un descanso o cambio de música?"
```

### **Escenario 2: Ejercicio**
```
Usuario: "Voy al gym"
Bot: "¡Genial! ¿Pongo tu música de ejercicio?"
Usuario: "Dale"
Bot: "Reproduciendo música para ejercicio: Workout Hits"

Usuario: "Sube el volumen"
Bot: "Volumen ajustado a 90%"
```

### **Escenario 3: Estudio**
```
Usuario: "Necesito estudiar"
Bot: "Te pongo música para estudiar"
Bot: "Reproduciendo: Study Music - Focus & Concentration"

Usuario: "¿Qué está sonando?"
Bot: "Sonando: 'Piano Study Music' del álbum 'Focus'"
```

### **Escenario 4: Descubrimiento**
```
Usuario: "Pon algo de Queen"
Bot: "Reproduciendo: 'Bohemian Rhapsody' por Queen"

Usuario: "Siguiente"
Bot: "Siguiente canción"

Usuario: "¿Qué es esto?"
Bot: "Sonando: 'We Will Rock You' por Queen"
```

## 🔐 **Seguridad y Privacidad**

- ✅ Tokens encriptados en base de datos
- ✅ OAuth 2.0 con Spotify
- ✅ Refresh automático de tokens
- ✅ No se almacenan credenciales en texto plano
- ✅ Permisos limitados (solo control de reproducción)

## 🎨 **Permisos Requeridos**

La app solicita estos permisos de Spotify:

- `user-read-playback-state` - Ver qué está sonando
- `user-modify-playback-state` - Controlar reproducción
- `user-read-currently-playing` - Canción actual
- `playlist-read-private` - Acceder a tus playlists
- `playlist-read-collaborative` - Playlists colaborativas
- `user-library-read` - Tu biblioteca
- `user-top-read` - Tus artistas/canciones favoritas

## 🚀 **Características Avanzadas**

### **Recomendaciones Inteligentes**

El bot aprende tus preferencias:

```javascript
// Después de varias sesiones
Bot: "Noto que te gusta escuchar lo-fi cuando programas. 
     ¿Quieres que lo ponga automáticamente cuando detecte 
     que estás programando?"
```

### **Integración con Calendario**

```javascript
// Antes de una reunión
Bot: "Tienes reunión en 10 minutos. ¿Pauso la música?"

// Después de una reunión
Bot: "Reunión terminada. ¿Reanudo tu música?"
```

### **Contexto de Actividad**

```javascript
// Detecta tu actividad
Bot: "Veo que creaste una tarea de 'Revisar código'. 
     ¿Pongo música para concentrarte?"
```

## 📱 **Dispositivos Soportados**

Spotify debe estar abierto en al menos un dispositivo:

- 💻 **Computadora** - Spotify Desktop App
- 📱 **Móvil** - Spotify Mobile App
- 🌐 **Web** - Spotify Web Player
- 🔊 **Altavoces** - Spotify Connect

## 🐛 **Troubleshooting**

### **"Spotify no está conectado"**

**Causas:**
1. No has autorizado la app
2. Tokens expirados
3. App de Spotify no configurada

**Solución:**
```bash
# 1. Verifica credenciales en .env
cat backend/.env | grep SPOTIFY

# 2. Reconecta desde el frontend
# 3. Verifica que la app esté activa en Spotify Dashboard
```

### **"No se puede controlar la reproducción"**

**Causas:**
1. Spotify no está abierto
2. No hay dispositivo activo

**Solución:**
- Abre Spotify en cualquier dispositivo
- Inicia reproducción manualmente una vez
- Luego el bot podrá controlarla

### **"No encontré la canción"**

**Causas:**
1. Nombre incorrecto
2. Canción no disponible en tu región
3. Spotify Premium requerido

**Solución:**
- Verifica el nombre de la canción
- Usa comandos más específicos
- Spotify Premium es necesario para control completo

## 💡 **Tips**

1. **Spotify Premium** - Requerido para control completo
2. **Mantén Spotify abierto** - En al menos un dispositivo
3. **Comandos naturales** - Habla como lo harías normalmente
4. **Combina con tareas** - "Pon música para [actividad]"
5. **Explora playlists** - Pide recomendaciones

## 🔮 **Próximas Mejoras**

- [ ] **Crear playlists** - Desde el bot
- [ ] **Agregar a favoritos** - Guardar canciones
- [ ] **Letras de canciones** - Mostrar lyrics
- [ ] **Análisis de audio** - Tempo, energía, mood
- [ ] **Recomendaciones ML** - Basadas en tu historial
- [ ] **Control multi-dispositivo** - Cambiar entre dispositivos
- [ ] **Sincronización con actividades** - Auto-play según contexto
- [ ] **Estadísticas** - Tu música más escuchada

## 📚 **Recursos**

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Spotify Dashboard](https://developer.spotify.com/dashboard)
- [OAuth 2.0 Guide](https://developer.spotify.com/documentation/general/guides/authorization/)

---

**¡Controla tu música con la voz!** 🎵✨

## 🎯 **Comandos Rápidos**

```
"Play"
"Pause"
"Next"
"Previous"
"Volume 50"
"What's playing?"
"Play [song name]"
"Music for [activity]"
```
