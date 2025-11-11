# 🚀 Guía de Configuración - GBot

## Requisitos Previos

- **Node.js** 18 o superior
- **npm** o **yarn**
- Cuenta de **OpenAI** con API Key
- Proyecto de **Google Cloud** configurado
- (Opcional) Cuenta de **Supabase**

## 1. Configuración de Google Cloud

### Paso 1: Crear Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### Paso 2: Habilitar APIs
1. En el menú lateral, ve a **APIs y servicios** > **Biblioteca**
2. Busca y habilita:
   - Google Calendar API
   - Google Tasks API

### Paso 3: Crear Credenciales OAuth 2.0
1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **Crear credenciales** > **ID de cliente de OAuth 2.0**
3. Configura la pantalla de consentimiento:
   - Tipo de usuario: Externo
   - Nombre de la aplicación: GBot
   - Correo de soporte: tu email
   - Scopes: Calendar, Tasks
4. Crea el cliente OAuth:
   - Tipo de aplicación: Aplicación web
   - URIs de redireccionamiento autorizados:
     - `http://localhost:3001/auth/google/callback`
     - (Agrega tu dominio de producción cuando despliegues)
5. Descarga el JSON de credenciales o copia:
   - Client ID
   - Client Secret

## 2. Configuración de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com)
2. Crea una API Key en la sección de API Keys
3. Guarda la key de forma segura

## 3. Instalación del Proyecto

```bash
# Clonar el repositorio (si aplica)
cd gbot

# Instalar dependencias
npm run install:all

# O instalar manualmente
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 4. Configuración de Variables de Entorno

### Backend

Crea el archivo `backend/.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-tu-api-key-aqui

# Google OAuth2
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# JWT
JWT_SECRET=genera-un-secreto-aleatorio-seguro-aqui
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Encryption (genera una clave de 32 caracteres)
ENCRYPTION_KEY=tu-clave-de-encriptacion-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Frontend URL (para redirecciones)
FRONTEND_URL=http://localhost:3000

# Supabase (opcional)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key

# Logging
LOG_LEVEL=info
```

### Frontend

Crea el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 5. Generar Claves de Seguridad

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Encryption Key (32 caracteres)
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 6. Iniciar la Aplicación

### Desarrollo

**Opción 1: Iniciar todo junto**
```bash
npm run dev
```

**Opción 2: Iniciar por separado**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Producción

```bash
# Build frontend
cd frontend
npm run build

# Iniciar backend
cd ../backend
npm start
```

## 7. Verificar la Instalación

1. Abre `http://localhost:3000` en tu navegador
2. Deberías ver la página de inicio de GBot
3. Haz clic en "Comenzar con Google"
4. Autoriza la aplicación
5. Deberías ser redirigido al dashboard

## 8. Solución de Problemas

### Error: "No se pudo conectar con el servidor"
- Verifica que el backend esté corriendo en el puerto 3001
- Revisa las variables de entorno `VITE_API_URL` y `VITE_WS_URL`

### Error: "Authentication failed"
- Verifica las credenciales de Google Cloud
- Asegúrate de que las URIs de redirección coincidan
- Revisa que las APIs estén habilitadas

### Error: "OpenAI API error"
- Verifica que tu API Key sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa los límites de rate limiting

### Error de micrófono
- Asegúrate de dar permisos al navegador
- Usa HTTPS en producción (requerido para getUserMedia)
- Verifica que tu navegador soporte Web Audio API

## 9. Configuración Adicional

### Supabase (Opcional - para memoria persistente)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia la URL y la anon key
5. Agrégalas a las variables de entorno

### Despliegue en Producción

Ver `docs/DEPLOYMENT.md` para instrucciones de despliegue.

## 10. Próximos Pasos

- Lee la [Documentación de API](./API.md)
- Explora los [Ejemplos de Uso](./EXAMPLES.md)
- Personaliza las [Animaciones](./ANIMATIONS.md)

## Soporte

Si encuentras problemas, revisa:
- Los logs del backend en la consola
- Los logs del navegador (F12 > Console)
- El archivo `backend/logs/` si está configurado

Para más ayuda, abre un issue en el repositorio.
