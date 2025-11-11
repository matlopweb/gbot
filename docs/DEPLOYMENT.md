# 🚀 Guía de Despliegue - GBot

## Opciones de Despliegue

### 1. Vercel (Frontend) + Railway/Render (Backend)

#### Frontend en Vercel

1. **Preparar el proyecto**
```bash
cd frontend
npm run build
```

2. **Desplegar en Vercel**
```bash
npm install -g vercel
vercel
```

3. **Configurar variables de entorno en Vercel**
- `VITE_API_URL`: URL de tu backend
- `VITE_WS_URL`: URL WebSocket de tu backend

#### Backend en Railway

1. **Crear cuenta en Railway**
   - Ve a https://railway.app

2. **Crear nuevo proyecto**
   - Conecta tu repositorio GitHub
   - Selecciona la carpeta `backend`

3. **Configurar variables de entorno**
   - Agrega todas las variables de `.env.example`
   - Actualiza `GOOGLE_REDIRECT_URI` con tu dominio
   - Actualiza `FRONTEND_URL` con tu dominio de Vercel

4. **Desplegar**
   - Railway desplegará automáticamente

---

### 2. Heroku (Full Stack)

#### Preparar el proyecto

Crea `Procfile` en la raíz:
```
web: cd backend && npm start
```

Crea `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: cd backend && npm start
```

#### Desplegar

```bash
# Login a Heroku
heroku login

# Crear app
heroku create gbot-app

# Configurar variables de entorno
heroku config:set OPENAI_API_KEY=your-key
heroku config:set GOOGLE_CLIENT_ID=your-id
# ... todas las demás variables

# Desplegar
git push heroku main
```

---

### 3. AWS (Producción Completa)

#### Arquitectura Recomendada

- **Frontend**: S3 + CloudFront
- **Backend**: EC2 o ECS
- **Base de datos**: RDS PostgreSQL (para Supabase alternativo)
- **WebSocket**: Application Load Balancer con sticky sessions

#### Pasos

1. **Frontend en S3**
```bash
cd frontend
npm run build

aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

2. **Backend en EC2**
```bash
# Conectar a EC2
ssh -i your-key.pem ec2-user@your-instance

# Instalar Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clonar proyecto
git clone your-repo
cd gbot/backend

# Instalar dependencias
npm install

# Configurar PM2
npm install -g pm2
pm2 start src/index.js --name gbot
pm2 startup
pm2 save
```

3. **Configurar NGINX**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

### 4. Docker (Cualquier Plataforma)

#### Dockerfile para Backend

Crea `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

#### Dockerfile para Frontend

Crea `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./backend/tokens:/app/tokens

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3001
      - VITE_WS_URL=ws://backend:3001
```

#### Desplegar

```bash
docker-compose up -d
```

---

## Configuración de Producción

### Variables de Entorno

Asegúrate de actualizar:

```env
# Backend
NODE_ENV=production
GOOGLE_REDIRECT_URI=https://tu-dominio.com/auth/google/callback
FRONTEND_URL=https://tu-dominio.com
ALLOWED_ORIGINS=https://tu-dominio.com

# Frontend
VITE_API_URL=https://api.tu-dominio.com
VITE_WS_URL=wss://api.tu-dominio.com
```

### SSL/TLS

**Opción 1: Let's Encrypt (Gratis)**
```bash
sudo certbot --nginx -d tu-dominio.com
```

**Opción 2: CloudFlare (Gratis)**
- Agrega tu dominio a CloudFlare
- Activa SSL/TLS automático
- Configura DNS

### Seguridad

1. **Firewall**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Rate Limiting**
   - Ya está configurado en el código (100 req/15min)
   - Considera usar CloudFlare para DDoS protection

3. **Secrets Management**
   - Usa AWS Secrets Manager, Google Secret Manager, o similar
   - Nunca commitees `.env` al repositorio

### Monitoreo

1. **Logs**
```bash
# PM2
pm2 logs gbot

# Docker
docker-compose logs -f
```

2. **Uptime Monitoring**
   - UptimeRobot (gratis)
   - Pingdom
   - New Relic

3. **Error Tracking**
   - Sentry
   - LogRocket
   - Rollbar

### Backups

1. **Base de datos** (si usas Supabase)
   - Backups automáticos incluidos

2. **Tokens de usuario**
```bash
# Backup manual
tar -czf tokens-backup-$(date +%Y%m%d).tar.gz backend/tokens/

# Restaurar
tar -xzf tokens-backup-20251111.tar.gz
```

### Escalabilidad

1. **Load Balancer**
   - AWS ALB
   - NGINX
   - HAProxy

2. **Múltiples Instancias**
   - Usa Redis para sesiones compartidas
   - Sincroniza tokens entre instancias

3. **CDN**
   - CloudFlare
   - AWS CloudFront
   - Vercel Edge Network

---

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] SSL/TLS habilitado
- [ ] Dominio configurado
- [ ] Google OAuth URIs actualizadas
- [ ] Firewall configurado
- [ ] Monitoreo activo
- [ ] Backups configurados
- [ ] Logs centralizados
- [ ] Rate limiting verificado
- [ ] Pruebas de carga realizadas

---

## Costos Estimados

### Opción Económica (Hobby)
- **Vercel**: Gratis (Frontend)
- **Railway**: $5/mes (Backend)
- **Supabase**: Gratis
- **Total**: ~$5/mes

### Opción Media (Startup)
- **Vercel Pro**: $20/mes
- **Railway Pro**: $20/mes
- **Supabase Pro**: $25/mes
- **Total**: ~$65/mes

### Opción Enterprise (Producción)
- **AWS**: Variable ($100-500/mes)
- **Supabase Team**: $599/mes
- **CloudFlare Pro**: $20/mes
- **Total**: ~$700-1200/mes

---

## Mantenimiento

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### Rotación de Secrets

1. Genera nuevos secrets
2. Actualiza en el servidor
3. Reinicia la aplicación
4. Revoca los antiguos

---

Para más información, consulta la documentación de cada plataforma.
