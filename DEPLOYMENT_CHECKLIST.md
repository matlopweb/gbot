# ✅ Checklist de Deployment - GBot

## 📋 **Pre-Deployment**

### **Código y Repositorio**
- [ ] Código completo y funcionando localmente
- [ ] Archivo `.gitignore` configurado (no subir `.env`)
- [ ] Repositorio creado en GitHub
- [ ] Código pusheado a GitHub

### **Credenciales y APIs**
- [ ] OpenAI API Key obtenida
- [ ] Google OAuth configurado (Client ID + Secret)
- [ ] OpenWeather API Key (opcional)
- [ ] Tavily API Key (opcional)
- [ ] Supabase proyecto creado (opcional)

### **Archivos de Configuración**
- [ ] `backend/Dockerfile` existe
- [ ] `backend/.dockerignore` existe
- [ ] `frontend/vercel.json` existe
- [ ] `.env.example` actualizado

---

## 🚀 **Durante Deployment**

### **Frontend (Vercel)**
- [ ] Cuenta Vercel creada
- [ ] Proyecto importado desde GitHub
- [ ] Root Directory: `frontend` ✓
- [ ] Framework: Vite ✓
- [ ] Build Command: `npm run build` ✓
- [ ] Output Directory: `dist` ✓
- [ ] Variables de entorno configuradas:
  - [ ] `VITE_API_URL`
  - [ ] `VITE_WS_URL`
- [ ] Deploy exitoso
- [ ] URL del frontend anotada: `_______________`

### **Backend (Railway)**
- [ ] Cuenta Railway creada
- [ ] Proyecto importado desde GitHub
- [ ] Root Directory: `backend` ✓
- [ ] Dockerfile detectado ✓
- [ ] Variables de entorno configuradas:
  - [ ] `OPENAI_API_KEY`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REDIRECT_URI`
  - [ ] `PORT=3001`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL`
  - [ ] `ALLOWED_ORIGINS`
- [ ] Deploy exitoso
- [ ] URL del backend anotada: `_______________`

### **Actualización de URLs**
- [ ] URLs del backend actualizadas en Vercel
- [ ] Frontend redeployado con nuevas URLs
- [ ] Google OAuth redirect URIs actualizadas

---

## 🔧 **Post-Deployment**

### **Configuración de Servicios**
- [ ] Google OAuth:
  - [ ] Authorized JavaScript origins actualizado
  - [ ] Authorized redirect URIs actualizado
- [ ] Spotify (si aplica):
  - [ ] Redirect URIs actualizado
- [ ] Otros servicios configurados

### **Testing**
- [ ] Frontend carga correctamente
- [ ] Backend responde (health check)
- [ ] WebSocket conecta
- [ ] Login con Google funciona
- [ ] Control por voz funciona
- [ ] Crear evento en Calendar funciona
- [ ] Crear tarea funciona
- [ ] Todas las funcionalidades probadas

### **Monitoreo**
- [ ] Logs del backend revisados (Railway)
- [ ] Logs del frontend revisados (Vercel)
- [ ] No hay errores críticos
- [ ] Performance aceptable

---

## 📱 **Testing en Dispositivos**

### **Desktop**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### **Mobile**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Responsive design OK
- [ ] PWA instalable

---

## 🎯 **Optimizaciones Opcionales**

### **Performance**
- [ ] Lighthouse score > 90
- [ ] Imágenes optimizadas
- [ ] Code splitting configurado
- [ ] Caching configurado

### **SEO**
- [ ] Meta tags configurados
- [ ] Open Graph tags
- [ ] Sitemap generado
- [ ] robots.txt configurado

### **Dominio Custom**
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] SSL/HTTPS activo
- [ ] Redirects configurados

### **Monitoreo**
- [ ] UptimeRobot configurado
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Logs centralizados

---

## 🔐 **Seguridad**

### **Checklist de Seguridad**
- [ ] Variables de entorno no expuestas
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] HTTPS en producción
- [ ] Tokens encriptados
- [ ] Headers de seguridad (Helmet)
- [ ] Validación de inputs
- [ ] Sanitización de datos

---

## 📊 **Métricas**

### **URLs de Producción**
```
Frontend: https://___________________
Backend:  https://___________________
```

### **Tiempo de Deploy**
```
Inicio:   _____:_____
Fin:      _____:_____
Total:    _____ minutos
```

### **Costos Mensuales**
```
Vercel:   $_____ (gratis)
Railway:  $_____ ($5 recomendado)
Otros:    $_____
Total:    $_____
```

---

## 🎉 **Deployment Completado**

- [ ] Todas las tareas completadas
- [ ] App funcionando en producción
- [ ] URLs compartidas con usuarios
- [ ] Documentación actualizada
- [ ] README.md actualizado con URLs de producción

---

## 📞 **Contactos de Emergencia**

```
Vercel Support:   https://vercel.com/support
Railway Support:  https://railway.app/help
OpenAI Status:    https://status.openai.com
Google Status:    https://www.google.com/appsstatus
```

---

## 📝 **Notas**

```
Fecha de deployment: _______________
Versión deployada:   _______________
Notas adicionales:
_____________________________________
_____________________________________
_____________________________________
```

---

**¡Deployment exitoso!** 🚀✨

**Próximos pasos:**
1. Monitorear logs por 24 horas
2. Recopilar feedback de usuarios
3. Planear siguientes features
4. Celebrar! 🎊
