# 🚀 Guía de Deployment - GBot

## 📋 **Tabla de Contenidos**
1. [Preparación](#preparación)
2. [Opción 1: Vercel + Railway (Recomendado)](#opción-1-vercel--railway)
3. [Opción 2: Netlify + Render](#opción-2-netlify--render)
4. [Configuración de Variables](#configuración-de-variables)
5. [Post-Deployment](#post-deployment)

---

## 🎯 **Preparación**

### **1. Crear Repositorio en GitHub**

```bash
# Inicializar git (si no lo has hecho)
cd c:\Users\matlo\OneDrive\Documentos\gbot
git init

# Agregar archivos
git add .
git commit -m "Initial commit - GBot"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/gbot.git
git branch -M main
git push -u origin main
```

### **2. Verificar Archivos**

Asegúrate de tener:
- ✅ `backend/Dockerfile`
- ✅ `backend/.dockerignore`
- ✅ `backend/.env.production.example`
- ✅ `frontend/vercel.json`
- ✅ `.gitignore` (no subir `.env`)

---

## 🚀 **Opción 1: Vercel + Railway (RECOMENDADO)**

### **A. Deploy Frontend en Vercel**

#### **1. Crear cuenta en Vercel**
- Ve a https://vercel.com
- Regístrate con GitHub

#### **2. Importar Proyecto**
```
1. Click "Add New Project"
2. Selecciona tu repo "gbot"
3. Framework Preset: Vite
4. Root Directory: frontend
5. Build Command: npm run build
6. Output Directory: dist
```

#### **3. Configurar Variables de Entorno**

En Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_API_URL=https://tu-backend.railway.app
VITE_WS_URL=wss://tu-backend.railway.app
```

#### **4. Deploy**
```
Click "Deploy"
Espera 2-3 minutos
✅ Tu frontend estará en: https://gbot-tu-usuario.vercel.app
```

---

### **B. Deploy Backend en Railway**

#### **1. Crear cuenta en Railway**
- Ve a https://railway.app
- Regístrate con GitHub

#### **2. Crear Nuevo Proyecto**
```
1. Click "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repo "gbot"
4. Root Directory: backend
```

#### **3. Configurar Variables de Entorno**

En Railway Dashboard → Variables:

```bash
# OpenAI
OPENAI_API_KEY=sk-tu-key

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-secret
GOOGLE_REDIRECT_URI=https://gbot-tu-usuario.vercel.app/auth/callback

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://gbot-tu-usuario.vercel.app

# CORS
ALLOWED_ORIGINS=https://gbot-tu-usuario.vercel.app

# Otras APIs (opcionales)
OPENWEATHER_API_KEY=tu-key
TAVILY_API_KEY=tu-key
SUPABASE_URL=tu-url
SUPABASE_KEY=tu-key
```

#### **4. Deploy**
```
Railway detectará el Dockerfile automáticamente
Click "Deploy"
✅ Tu backend estará en: https://tu-proyecto.railway.app
```

#### **5. Actualizar Frontend**

Vuelve a Vercel y actualiza las variables:
```bash
VITE_API_URL=https://tu-proyecto.railway.app
VITE_WS_URL=wss://tu-proyecto.railway.app
```

Redeploy el frontend.

---

## 🌐 **Opción 2: Netlify + Render**

### **A. Deploy Frontend en Netlify**

#### **1. Crear cuenta**
- Ve a https://netlify.com
- Regístrate con GitHub

#### **2. Importar Proyecto**
```
1. Click "Add new site" → "Import an existing project"
2. Selecciona GitHub → tu repo "gbot"
3. Base directory: frontend
4. Build command: npm run build
5. Publish directory: dist
```

#### **3. Variables de Entorno**
```bash
VITE_API_URL=https://tu-backend.onrender.com
VITE_WS_URL=wss://tu-backend.onrender.com
```

#### **4. Deploy**
```
Click "Deploy site"
✅ Tu frontend estará en: https://gbot-random.netlify.app
```

---

### **B. Deploy Backend en Render**

#### **1. Crear cuenta**
- Ve a https://render.com
- Regístrate con GitHub

#### **2. Crear Web Service**
```
1. Click "New" → "Web Service"
2. Conecta tu repo "gbot"
3. Name: gbot-backend
4. Root Directory: backend
5. Environment: Docker
6. Plan: Free
```

#### **3. Variables de Entorno**

En Render Dashboard → Environment:

```bash
OPENAI_API_KEY=sk-tu-key
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-secret
GOOGLE_REDIRECT_URI=https://gbot-random.netlify.app/auth/callback
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://gbot-random.netlify.app
ALLOWED_ORIGINS=https://gbot-random.netlify.app
```

#### **4. Deploy**
```
Click "Create Web Service"
Espera 5-10 minutos (primera vez es lenta)
✅ Tu backend estará en: https://gbot-backend.onrender.com
```

---

## ⚙️ **Configuración de Variables de Entorno**

### **Variables Esenciales (Mínimo para funcionar):**

```bash
# Backend
OPENAI_API_KEY=sk-...           # OBLIGATORIO
GOOGLE_CLIENT_ID=...            # OBLIGATORIO
GOOGLE_CLIENT_SECRET=...        # OBLIGATORIO
GOOGLE_REDIRECT_URI=...         # OBLIGATORIO
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
ALLOWED_ORIGINS=https://tu-dominio.com

# Frontend
VITE_API_URL=https://tu-backend.com
VITE_WS_URL=wss://tu-backend.com
```

### **Variables Opcionales (Funcionalidades extra):**

```bash
# Clima
OPENWEATHER_API_KEY=...

# Búsqueda Web
TAVILY_API_KEY=...

# Spotify
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=...

# Supabase (para Spotify y Productividad)
SUPABASE_URL=...
SUPABASE_KEY=...

# Productividad
NOTION_API_KEY=...
TRELLO_API_KEY=...
ASANA_WORKSPACE_ID=...
```

---

## 🔧 **Post-Deployment**

### **1. Actualizar Google OAuth**

En Google Cloud Console:
```
1. Ve a APIs & Services → Credentials
2. Edita tu OAuth 2.0 Client
3. Authorized JavaScript origins:
   - https://tu-dominio.vercel.app
   
4. Authorized redirect URIs:
   - https://tu-dominio.vercel.app/auth/callback
```

### **2. Actualizar Spotify (si usas)**

En Spotify Dashboard:
```
1. Ve a tu app
2. Edit Settings
3. Redirect URIs:
   - https://tu-dominio.vercel.app/api/spotify/callback
```

### **3. Probar la Aplicación**

```
1. Abre https://tu-dominio.vercel.app
2. Verifica conexión (debería conectar automáticamente)
3. Prueba login con Google
4. Prueba control por voz
5. Verifica todas las funcionalidades
```

### **4. Configurar Dominio Personalizado (Opcional)**

#### **En Vercel:**
```
1. Settings → Domains
2. Add Domain
3. Ingresa tu dominio (ej: gbot.tudominio.com)
4. Sigue instrucciones DNS
```

#### **En Railway:**
```
1. Settings → Networking
2. Custom Domain
3. Ingresa tu dominio (ej: api.tudominio.com)
4. Configura CNAME en tu DNS
```

---

## 🐛 **Troubleshooting**

### **Error: "Failed to connect to backend"**

**Causa:** Frontend no puede conectar con backend

**Solución:**
```bash
1. Verifica VITE_API_URL en Vercel
2. Verifica que backend esté corriendo en Railway
3. Verifica CORS en backend (ALLOWED_ORIGINS)
```

### **Error: "WebSocket connection failed"**

**Causa:** WebSocket no puede conectar

**Solución:**
```bash
1. Verifica VITE_WS_URL usa wss:// (no ws://)
2. Verifica que Railway soporte WebSockets (sí lo hace)
3. Verifica firewall/proxy
```

### **Error: "Google OAuth failed"**

**Causa:** Redirect URI no coincide

**Solución:**
```bash
1. Verifica GOOGLE_REDIRECT_URI en Railway
2. Verifica Authorized redirect URIs en Google Console
3. Deben ser EXACTAMENTE iguales
```

### **Backend se duerme (Free tier)**

**Causa:** Railway/Render duermen apps inactivas

**Solución:**
```bash
# Opción 1: Usar servicio de ping
https://uptimerobot.com (gratis)

# Opción 2: Upgrade a plan pago
Railway: $5/mes
Render: $7/mes
```

---

## 💰 **Costos**

### **Plan Gratuito:**
```
Vercel:   Gratis (100GB bandwidth/mes)
Railway:  $5 crédito gratis/mes
Netlify:  Gratis (100GB bandwidth/mes)
Render:   Gratis (750 horas/mes)

Total: GRATIS (con limitaciones)
```

### **Plan Recomendado:**
```
Vercel:   Gratis
Railway:  $5/mes (sin sleep, mejor rendimiento)

Total: $5/mes
```

---

## 📊 **Comparación de Plataformas**

| Característica | Vercel | Railway | Netlify | Render |
|---------------|--------|---------|---------|--------|
| Frontend | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Backend | ❌ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| WebSocket | ❌ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| Precio | Gratis | $5/mes | Gratis | Gratis |
| Velocidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## ✅ **Checklist de Deployment**

### **Antes de Deploy:**
- [ ] Código en GitHub
- [ ] Variables de entorno listas
- [ ] Google OAuth configurado
- [ ] APIs keys obtenidas

### **Durante Deploy:**
- [ ] Frontend deployado
- [ ] Backend deployado
- [ ] Variables configuradas
- [ ] URLs actualizadas

### **Después de Deploy:**
- [ ] Probar conexión
- [ ] Probar login
- [ ] Probar voz
- [ ] Probar funcionalidades
- [ ] Configurar dominio (opcional)
- [ ] Configurar monitoreo (opcional)

---

## 🎉 **¡Listo!**

Tu aplicación GBot está deployada y lista para usar:

```
Frontend: https://gbot-tu-usuario.vercel.app
Backend:  https://tu-proyecto.railway.app
```

**Comparte tu app con el mundo!** 🚀✨

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisa logs en Vercel/Railway
2. Verifica variables de entorno
3. Consulta la documentación de cada plataforma
4. Revisa la consola del navegador (F12)

**¡Éxito con tu deployment!** 🎊
