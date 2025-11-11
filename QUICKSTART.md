# ⚡ Inicio Rápido - GBot

## 🚀 En 5 Minutos

### 1. Instalar Dependencias

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
OPENAI_API_KEY=sk-tu-api-key
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
JWT_SECRET=tu-secreto-jwt-aleatorio
ENCRYPTION_KEY=tu-clave-32-caracteres
PORT=3001
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Iniciar la Aplicación

```bash
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:3000`

### 4. Abrir en el Navegador

Ve a `http://localhost:3000` y haz clic en "Comenzar con Google"

---

## 📝 Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] Cuenta OpenAI con API Key
- [ ] Proyecto Google Cloud creado
- [ ] Calendar API habilitada
- [ ] Tasks API habilitada
- [ ] OAuth 2.0 Client ID creado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas

---

## 🔑 Obtener Credenciales

### OpenAI API Key
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala a `OPENAI_API_KEY`

### Google OAuth
1. Ve a https://console.cloud.google.com
2. Crea un proyecto
3. Habilita Calendar API y Tasks API
4. Crea credenciales OAuth 2.0
5. Copia Client ID y Client Secret

### Generar Secretos

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🎯 Primeros Pasos

1. **Autenticarse**: Haz clic en "Comenzar con Google"
2. **Probar voz**: Haz clic en el micrófono y di "Hola"
3. **Crear evento**: Di "Crea una reunión mañana a las 10"
4. **Crear tarea**: Di "Recuérdame comprar leche"

---

## 🐛 Solución Rápida de Problemas

### No se conecta al servidor
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3001/health
```

### Error de autenticación
- Verifica las credenciales de Google
- Asegúrate de que las URIs de redirección coincidan

### Error de micrófono
- Da permisos al navegador
- Usa Chrome o Firefox (Safari puede tener problemas)

---

## 📚 Documentación Completa

- [Guía de Configuración Detallada](./docs/SETUP.md)
- [Documentación de API](./docs/API.md)
- [Ejemplos de Uso](./docs/EXAMPLES.md)

---

## 🆘 Ayuda

¿Problemas? Revisa:
1. Logs del backend en la terminal
2. Consola del navegador (F12)
3. Variables de entorno

Para más ayuda, consulta la documentación completa.
