# 🚀 Deploy GBot en 10 Minutos

## ⚡ Guía Rápida

### **Paso 1: Subir a GitHub (2 min)**

```bash
cd c:\Users\matlo\OneDrive\Documentos\gbot

# Inicializar git
git init
git add .
git commit -m "🚀 GBot - Ready for deployment"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/gbot.git
git branch -M main
git push -u origin main
```

✅ **Código en GitHub**

---

### **Paso 2: Deploy Frontend en Vercel (3 min)**

1. **Ir a https://vercel.com**
2. **Sign up** con GitHub
3. **New Project** → Selecciona tu repo `gbot`
4. **Configuración:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. **Environment Variables:**
   ```bash
   VITE_API_URL=https://tu-backend.railway.app
   VITE_WS_URL=wss://tu-backend.railway.app
   ```
   *(Actualiza después de deploy del backend)*

6. **Deploy** 🚀

✅ **Frontend en: https://gbot-xxx.vercel.app**

---

### **Paso 3: Deploy Backend en Railway (5 min)**

1. **Ir a https://railway.app**
2. **Sign up** con GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Selecciona** tu repo `gbot`
5. **Root Directory:** `backend`
6. **Environment Variables** (Settings → Variables):

```bash
# OBLIGATORIAS
OPENAI_API_KEY=sk-tu-key-aqui
GOOGLE_CLIENT_ID=tu-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-secret
GOOGLE_REDIRECT_URI=https://gbot-xxx.vercel.app/auth/callback

# SERVIDOR
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://gbot-xxx.vercel.app
ALLOWED_ORIGINS=https://gbot-xxx.vercel.app

# OPCIONALES (agregar después)
OPENWEATHER_API_KEY=tu-key
TAVILY_API_KEY=tu-key
SUPABASE_URL=tu-url
SUPABASE_KEY=tu-key
```

7. **Deploy** 🚀

✅ **Backend en: https://tu-proyecto.railway.app**

---

### **Paso 4: Actualizar URLs (1 min)**

1. **Volver a Vercel**
2. **Settings → Environment Variables**
3. **Actualizar:**
   ```bash
   VITE_API_URL=https://tu-proyecto.railway.app
   VITE_WS_URL=wss://tu-proyecto.railway.app
   ```
4. **Redeploy** (Deployments → ⋯ → Redeploy)

---

### **Paso 5: Configurar Google OAuth (2 min)**

1. **Google Cloud Console**: https://console.cloud.google.com
2. **APIs & Services → Credentials**
3. **Editar OAuth 2.0 Client**
4. **Authorized JavaScript origins:**
   ```
   https://gbot-xxx.vercel.app
   ```
5. **Authorized redirect URIs:**
   ```
   https://gbot-xxx.vercel.app/auth/callback
   ```
6. **Save**

---

## ✅ **¡Listo!**

Tu app está deployada:
- **Frontend**: https://gbot-xxx.vercel.app
- **Backend**: https://tu-proyecto.railway.app

### **Probar:**
1. Abre tu frontend
2. Login con Google
3. Prueba el control por voz
4. ¡Disfruta!

---

## 🐛 **Problemas Comunes**

### **"Failed to connect"**
- Verifica `VITE_API_URL` en Vercel
- Verifica que backend esté corriendo en Railway
- Revisa logs en Railway

### **"Google OAuth failed"**
- Verifica `GOOGLE_REDIRECT_URI` en Railway
- Debe coincidir EXACTAMENTE con Google Console

### **"WebSocket failed"**
- Usa `wss://` no `ws://`
- Railway soporta WebSockets automáticamente

---

## 💰 **Costos**

```
Vercel:  GRATIS
Railway: $5 crédito gratis/mes
         (Después $5/mes para no dormir)

Total: GRATIS para empezar
```

---

## 📚 **Más Info**

- **Guía Completa**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: Ver guía completa
- **Dominio Custom**: Ver guía completa

---

**¡Comparte tu GBot con el mundo!** 🌍✨
