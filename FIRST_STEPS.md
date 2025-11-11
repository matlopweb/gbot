# 🎯 Primeros Pasos con GBot

## ¡Bienvenido! 👋

Esta guía te ayudará a dar tus primeros pasos con GBot en menos de 10 minutos.

---

## ✅ Checklist Pre-Instalación

Antes de comenzar, asegúrate de tener:

- [ ] **Node.js 18+** instalado ([Descargar](https://nodejs.org/))
- [ ] **npm** o **yarn** disponible
- [ ] Cuenta de **OpenAI** ([Registrarse](https://platform.openai.com/signup))
- [ ] Cuenta de **Google Cloud** ([Registrarse](https://console.cloud.google.com))
- [ ] Editor de código (VS Code recomendado)
- [ ] Navegador moderno (Chrome, Firefox, Edge)

---

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm run install:all
```

Esto instalará todas las dependencias del backend y frontend.

☕ **Tiempo estimado**: 2-3 minutos

---

### Paso 2: Configurar Credenciales

#### Opción A: Configuración Automática (Recomendado)

```bash
npm run setup
```

El script te pedirá:
1. OpenAI API Key
2. Google Client ID
3. Google Client Secret
4. (Opcional) Credenciales de Supabase

#### Opción B: Configuración Manual

1. Copia los archivos de ejemplo:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Edita `backend/.env` con tus credenciales
3. Edita `frontend/.env` si es necesario

---

### Paso 3: Obtener Credenciales

#### 🔑 OpenAI API Key

1. Ve a https://platform.openai.com/api-keys
2. Haz clic en "Create new secret key"
3. Copia la key (empieza con `sk-`)
4. Pégala en `OPENAI_API_KEY`

#### 🔑 Google OAuth Credentials

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Configura la pantalla de consentimiento:
   - Tipo: Externo
   - Nombre: GBot
   - Email de soporte: tu email
6. Crea el cliente OAuth:
   - Tipo: Web application
   - URIs autorizados: `http://localhost:3001/auth/google/callback`
7. Copia el **Client ID** y **Client Secret**

#### 🔑 Habilitar APIs de Google

1. En Google Cloud Console, ve a **APIs & Services** > **Library**
2. Busca y habilita:
   - ✅ Google Calendar API
   - ✅ Google Tasks API

---

### Paso 4: Iniciar la Aplicación

```bash
npm run dev
```

Esto iniciará:
- ✅ Backend en `http://localhost:3001`
- ✅ Frontend en `http://localhost:3000`

---

## 🎮 Primer Uso

### 1. Abrir la Aplicación

Abre tu navegador y ve a: `http://localhost:3000`

### 2. Autenticarse

1. Haz clic en **"Comenzar con Google"**
2. Autoriza la aplicación
3. Serás redirigido al dashboard

### 3. Probar la Voz

1. Haz clic en el **botón del micrófono** (círculo grande)
2. Permite el acceso al micrófono cuando te lo pida
3. Di: **"Hola, ¿cómo estás?"**
4. Espera la respuesta del bot

### 4. Crear un Evento

Di o escribe:
```
"Crea una reunión de equipo mañana a las 10 de la mañana"
```

GBot creará el evento en tu Google Calendar.

### 5. Crear una Tarea

Di o escribe:
```
"Recuérdame comprar leche"
```

GBot agregará la tarea a Google Tasks.

---

## 🎨 Explorar la Interfaz

### Dashboard Principal

```
┌─────────────────────────────────────────┐
│  [Estado: Conectado]        [⚙️] [🚪]  │
└─────────────────────────────────────────┘

┌──────────────┐  ┌──────────────────────┐
│              │  │                      │
│   🤖 Bot     │  │   💬 Chat            │
│   Avatar     │  │   Interface          │
│              │  │                      │
│   [🎤]       │  │   [Mensajes...]      │
│              │  │                      │
│              │  │   [Input] [Enviar]   │
└──────────────┘  └──────────────────────┘
```

### Estados del Bot

Observa cómo cambia el avatar:

- **Gris** (idle): Esperando
- **Azul** (listening): Escuchando
- **Púrpura** (thinking): Pensando
- **Verde** (speaking): Hablando
- **Naranja** (working): Trabajando

---

## 💡 Comandos de Ejemplo

### Calendario

```
✅ "¿Qué tengo en mi agenda hoy?"
✅ "Crea una reunión con Ana mañana a las 3 PM"
✅ "Cancela mi reunión de las 10"
✅ "Muéstrame mis eventos de esta semana"
```

### Tareas

```
✅ "Agrega 'Llamar al doctor' a mis tareas"
✅ "¿Qué tareas tengo pendientes?"
✅ "Marca como completada la tarea de comprar leche"
✅ "Recuérdame enviar el reporte el viernes"
```

### Conversación General

```
✅ "Hola, ¿cómo estás?"
✅ "Cuéntame un chiste"
✅ "¿Qué puedes hacer?"
✅ "Ayúdame a organizar mi día"
```

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Cannot find module"

**Solución**: Reinstala las dependencias
```bash
npm run install:all
```

### ❌ Error: "Port 3000 already in use"

**Solución**: Cambia el puerto en `frontend/vite.config.js`
```javascript
server: {
  port: 3002, // Cambiar aquí
}
```

### ❌ Error: "Authentication failed"

**Solución**:
1. Verifica que las credenciales de Google sean correctas
2. Asegúrate de que las URIs de redirección coincidan
3. Verifica que las APIs estén habilitadas

### ❌ Error: "Microphone not working"

**Solución**:
1. Da permisos al navegador para usar el micrófono
2. Verifica que tu micrófono funcione en otras apps
3. Usa Chrome o Firefox (mejor compatibilidad)

### ❌ Error: "OpenAI API error"

**Solución**:
1. Verifica que tu API Key sea válida
2. Asegúrate de tener créditos en tu cuenta
3. Revisa los límites de rate limiting

---

## 📚 Próximos Pasos

Una vez que tengas GBot funcionando:

1. **Lee la documentación completa**
   - [Guía de Configuración](./docs/SETUP.md)
   - [Documentación de API](./docs/API.md)
   - [Ejemplos de Uso](./docs/EXAMPLES.md)

2. **Personaliza el bot**
   - Cambia la personalidad en `backend/src/config/openai.js`
   - Personaliza las animaciones en `frontend/src/components/Bot/BotAvatar.jsx`

3. **Explora las funcionalidades**
   - Prueba diferentes comandos
   - Experimenta con la voz
   - Crea eventos y tareas complejas

4. **Contribuye al proyecto**
   - Lee [CONTRIBUTING.md](./CONTRIBUTING.md)
   - Reporta bugs o sugiere mejoras
   - Comparte tus personalizaciones

---

## 🎓 Recursos de Aprendizaje

### Documentación Oficial

- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Tasks API](https://developers.google.com/tasks)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs)

### Tutoriales Recomendados

- [Cómo funciona OAuth 2.0](https://www.oauth.com/)
- [WebSocket Tutorial](https://javascript.info/websocket)
- [Framer Motion Guide](https://www.framer.com/motion/)

---

## 💬 Obtener Ayuda

Si tienes problemas:

1. **Revisa la documentación** en `/docs`
2. **Busca en los issues** del repositorio
3. **Abre un nuevo issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Tu entorno (OS, Node version, etc.)

---

## 🎉 ¡Felicidades!

Ya tienes GBot funcionando. Ahora puedes:

- ✅ Conversar por voz con tu asistente
- ✅ Gestionar tu calendario
- ✅ Administrar tus tareas
- ✅ Disfrutar de un asistente con personalidad

**¡Diviértete usando GBot!** 🚀

---

<div align="center">

**¿Necesitas ayuda?** Consulta la [documentación completa](./README.md)

</div>
