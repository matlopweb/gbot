# 📂 Estructura del Proyecto GBot

## Árbol de Directorios Completo

```
gbot/
│
├── 📁 backend/                      # Servidor Node.js
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configuraciones
│   │   │   ├── openai.js           # Config OpenAI Realtime API + Tools
│   │   │   ├── google.js           # Config Google OAuth2
│   │   │   └── supabase.sql        # Schema SQL para Supabase
│   │   │
│   │   ├── 📁 middleware/          # Middlewares Express
│   │   │   ├── auth.js             # Autenticación JWT
│   │   │   └── errorHandler.js     # Manejo de errores
│   │   │
│   │   ├── 📁 routes/              # Rutas API REST
│   │   │   ├── auth.js             # OAuth2 y autenticación
│   │   │   ├── calendar.js         # Google Calendar endpoints
│   │   │   └── tasks.js            # Google Tasks endpoints
│   │   │
│   │   ├── 📁 services/            # Lógica de negocio
│   │   │   ├── calendarService.js  # Servicio de Calendar
│   │   │   ├── tasksService.js     # Servicio de Tasks
│   │   │   └── memoryService.js    # Sistema de memoria
│   │   │
│   │   ├── 📁 websocket/           # WebSocket y Realtime
│   │   │   ├── index.js            # WebSocket server
│   │   │   ├── openaiRealtime.js   # Cliente OpenAI Realtime
│   │   │   └── stateMachine.js     # Máquina de estados del bot
│   │   │
│   │   ├── 📁 utils/               # Utilidades
│   │   │   ├── logger.js           # Sistema de logs
│   │   │   ├── encryption.js       # Encriptación de tokens
│   │   │   └── tokenStore.js       # Almacenamiento de tokens
│   │   │
│   │   └── index.js                # Entry point del servidor
│   │
│   ├── .env.example                # Ejemplo de variables de entorno
│   └── package.json                # Dependencias backend
│
├── 📁 frontend/                     # Aplicación React
│   ├── 📁 public/                  # Assets públicos
│   │   └── vite.svg
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/          # Componentes React
│   │   │   ├── 📁 Bot/
│   │   │   │   └── BotAvatar.jsx   # Avatar animado del bot
│   │   │   ├── 📁 Chat/
│   │   │   │   └── ChatInterface.jsx # Interfaz de chat
│   │   │   ├── 📁 Voice/
│   │   │   │   └── VoiceControl.jsx  # Control de voz
│   │   │   └── ProtectedRoute.jsx   # HOC para rutas protegidas
│   │   │
│   │   ├── 📁 hooks/               # Custom hooks
│   │   │   └── useWebSocket.js     # Hook de WebSocket
│   │   │
│   │   ├── 📁 pages/               # Páginas
│   │   │   ├── HomePage.jsx        # Página de inicio
│   │   │   ├── AuthCallback.jsx    # Callback OAuth
│   │   │   └── DashboardPage.jsx   # Dashboard principal
│   │   │
│   │   ├── 📁 store/               # Estado global (Zustand)
│   │   │   ├── authStore.js        # Store de autenticación
│   │   │   └── botStore.js         # Store del bot
│   │   │
│   │   ├── App.jsx                 # Componente principal
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Estilos globales
│   │
│   ├── .env.example                # Ejemplo de variables de entorno
│   ├── index.html                  # HTML principal
│   ├── vite.config.js              # Configuración Vite
│   ├── tailwind.config.js          # Configuración Tailwind
│   ├── postcss.config.js           # Configuración PostCSS
│   └── package.json                # Dependencias frontend
│
├── 📁 docs/                         # Documentación
│   ├── SETUP.md                    # Guía de configuración
│   ├── API.md                      # Documentación de API
│   ├── EXAMPLES.md                 # Ejemplos de uso
│   └── DEPLOYMENT.md               # Guía de despliegue
│
├── 📁 scripts/                      # Scripts de utilidad
│   └── setup.js                    # Script de configuración inicial
│
├── .gitignore                      # Archivos ignorados por Git
├── .env.example                    # Ejemplo de variables de entorno raíz
├── package.json                    # Configuración raíz (workspaces)
├── README.md                       # Documentación principal
├── QUICKSTART.md                   # Inicio rápido
├── PROJECT_SUMMARY.md              # Resumen del proyecto
├── STRUCTURE.md                    # Este archivo
├── CONTRIBUTING.md                 # Guía de contribución
└── LICENSE                         # Licencia MIT
```

## 📊 Estadísticas del Proyecto

### Archivos por Categoría

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Backend** | 15 | Servidor, APIs, servicios |
| **Frontend** | 12 | Componentes, páginas, hooks |
| **Documentación** | 8 | Guías y ejemplos |
| **Configuración** | 10 | Config files, env examples |
| **Scripts** | 1 | Utilidades de setup |
| **Total** | **46+** | Archivos principales |

### Líneas de Código (Aproximado)

| Componente | LOC | Porcentaje |
|------------|-----|------------|
| Backend | ~2,500 | 50% |
| Frontend | ~1,800 | 36% |
| Documentación | ~700 | 14% |
| **Total** | **~5,000** | 100% |

## 🔑 Archivos Clave

### Backend

1. **`backend/src/index.js`**
   - Entry point del servidor
   - Configura Express, WebSocket, rutas
   - Middleware de seguridad

2. **`backend/src/websocket/openaiRealtime.js`**
   - Cliente de OpenAI Realtime API
   - Manejo de audio streaming
   - Function calling

3. **`backend/src/config/openai.js`**
   - Configuración de OpenAI
   - Definición de tools (funciones)
   - Instrucciones del bot

4. **`backend/src/services/calendarService.js`**
   - CRUD de eventos de Google Calendar
   - Búsqueda y filtrado

5. **`backend/src/services/tasksService.js`**
   - CRUD de tareas de Google Tasks
   - Gestión de listas

### Frontend

1. **`frontend/src/App.jsx`**
   - Componente raíz
   - Routing
   - Configuración de toasts

2. **`frontend/src/hooks/useWebSocket.js`**
   - Hook personalizado para WebSocket
   - Manejo de reconexión
   - Procesamiento de mensajes

3. **`frontend/src/components/Bot/BotAvatar.jsx`**
   - Avatar animado del bot
   - Cambio de estados visuales
   - Animaciones con Framer Motion

4. **`frontend/src/pages/DashboardPage.jsx`**
   - Página principal de la app
   - Layout del dashboard
   - Integración de componentes

5. **`frontend/src/store/botStore.js`**
   - Estado global del bot
   - Mensajes, transcripciones
   - Contexto de usuario

### Configuración

1. **`backend/.env.example`**
   - Variables de entorno del backend
   - API keys, secrets

2. **`frontend/.env.example`**
   - Variables de entorno del frontend
   - URLs de API y WebSocket

3. **`package.json` (raíz)**
   - Configuración de workspaces
   - Scripts principales

## 🎯 Flujo de Datos

```
Usuario (Voz/Texto)
    ↓
Frontend (React)
    ↓
WebSocket
    ↓
Backend (Express)
    ↓
OpenAI Realtime API
    ↓
Function Calls → Google APIs (Calendar/Tasks)
    ↓
Respuesta (Texto/Audio)
    ↓
Frontend (Animaciones + Reproducción)
    ↓
Usuario
```

## 🔄 Dependencias Principales

### Backend
- `express` - Framework web
- `ws` - WebSocket server
- `openai` - SDK de OpenAI
- `googleapis` - APIs de Google
- `jsonwebtoken` - JWT
- `crypto-js` - Encriptación
- `@supabase/supabase-js` - Base de datos

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `framer-motion` - Animaciones
- `zustand` - Estado global
- `axios` - HTTP client
- `lucide-react` - Iconos
- `tailwindcss` - Estilos

## 📦 Tamaño del Proyecto

| Componente | Tamaño (aprox.) |
|------------|-----------------|
| `node_modules` (backend) | ~150 MB |
| `node_modules` (frontend) | ~250 MB |
| Código fuente | ~500 KB |
| Documentación | ~100 KB |
| **Total** | **~400 MB** |

## 🚀 Puntos de Entrada

1. **Desarrollo**
   - Backend: `npm run dev` en `/backend`
   - Frontend: `npm run dev` en `/frontend`
   - Ambos: `npm run dev` en raíz

2. **Producción**
   - Backend: `npm start` en `/backend`
   - Frontend: Build en `/frontend/dist`

3. **Setup**
   - Interactivo: `npm run setup` en raíz
   - Manual: Copiar `.env.example` files

## 📝 Notas Importantes

- Los tokens de usuario se guardan en `backend/tokens/` (gitignored)
- Los logs se muestran en consola (configurar archivo en producción)
- La memoria en RAM se pierde al reiniciar (usar Supabase para persistencia)
- Las animaciones requieren navegador moderno con soporte para Framer Motion
- El micrófono requiere HTTPS en producción

## 🔮 Extensiones Futuras

Posibles ubicaciones para nuevas funcionalidades:

- **Nuevos servicios**: `backend/src/services/`
- **Nuevas rutas**: `backend/src/routes/`
- **Nuevos componentes**: `frontend/src/components/`
- **Nuevas páginas**: `frontend/src/pages/`
- **Nuevos hooks**: `frontend/src/hooks/`
- **Nuevas tools**: `backend/src/config/openai.js`

---

Este documento proporciona una visión completa de la estructura del proyecto GBot.
