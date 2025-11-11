# 📋 Integración de Productividad - Notion, Trello, Asana

GBot ahora puede gestionar tus tareas en Notion, Trello y Asana desde un solo lugar, sincronizar entre plataformas y crear un dashboard unificado de productividad.

## ✨ **Funcionalidades**

### 📊 **Gestión Unificada**
- Ver tareas de todas las plataformas
- Crear tareas en cualquier plataforma
- Sincronizar tareas entre plataformas
- Dashboard consolidado

### 🔄 **Sincronización**
- Copiar tareas entre plataformas
- Mantener múltiples herramientas actualizadas
- Migrar proyectos fácilmente

### 🎯 **Control por Voz**
- "¿Qué tareas tengo en Notion?"
- "Crea una tarea en Trello"
- "Sincroniza mis tareas de Asana a Notion"

## 🔧 **Configuración**

### **1. Notion**

#### **Crear Integración:**
1. Ve a: https://www.notion.so/my-integrations
2. Click "New integration"
3. Nombre: GBot
4. Tipo: Internal
5. Copia el "Internal Integration Token"

#### **Compartir Base de Datos:**
1. Abre tu base de datos de tareas en Notion
2. Click en "..." → "Add connections"
3. Selecciona "GBot"
4. Copia el ID de la base de datos de la URL

#### **Configurar en .env:**
```bash
NOTION_API_KEY=secret_tu-token-aqui
NOTION_DATABASE_ID=tu-database-id
```

---

### **2. Trello**

#### **Obtener API Key:**
1. Ve a: https://trello.com/app-key
2. Copia tu "API Key"
3. Click en "Token" para generar un token
4. Autoriza la aplicación
5. Copia el token

#### **Obtener IDs:**
```bash
# Board ID: Abre tu tablero, el ID está en la URL
https://trello.com/b/BOARD_ID/nombre-tablero

# List ID: Agrega .json al final de la URL del tablero
https://trello.com/b/BOARD_ID/nombre-tablero.json
# Busca "idList" en el JSON
```

#### **Configurar en .env:**
```bash
TRELLO_API_KEY=tu-api-key
TRELLO_BOARD_ID=tu-board-id
TRELLO_LIST_ID=tu-list-id
```

---

### **3. Asana**

#### **Crear App:**
1. Ve a: https://app.asana.com/0/developer-console
2. Click "Create new app"
3. Nombre: GBot
4. Redirect URL: `http://localhost:3001/api/asana/callback`
5. Copia Client ID y Client Secret

#### **Obtener Workspace ID:**
1. Abre Asana
2. Ve a tu workspace
3. El ID está en la URL: `https://app.asana.com/0/WORKSPACE_ID/...`

#### **Configurar en .env:**
```bash
ASANA_WORKSPACE_ID=tu-workspace-id
```

---

## 🎤 **Comandos de Voz**

### **Ver Tareas:**
```
"¿Qué tareas tengo en Notion?"
"Muéstrame mis tareas de Trello"
"Lista mis tareas de Asana"
"¿Qué tengo pendiente en Notion?"
```

### **Crear Tareas:**
```
"Crea una tarea en Notion: Revisar código"
"Agrega una tarea en Trello: Diseñar mockups"
"Nueva tarea en Asana: Reunión con equipo"
```

### **Sincronizar:**
```
"Sincroniza mis tareas de Notion a Trello"
"Copia las tareas de Asana a Notion"
"Migra todo de Trello a Asana"
```

## 📋 **Funciones Disponibles**

### **1. productivity_get_tasks**
Obtiene tareas de una plataforma específica.

```javascript
Usuario: "¿Qué tareas tengo en Notion?"
Bot: "Tienes 5 tareas:
     1. Revisar código [In Progress]
     2. Diseñar mockups [To Do]
     3. Reunión con equipo [To Do] - Vence: 15/11/2025
     ..."
```

### **2. productivity_create_task**
Crea una tarea en la plataforma especificada.

```javascript
Usuario: "Crea una tarea en Trello: Actualizar documentación"
Bot: "Tarea creada: 'Actualizar documentación'"
```

### **3. productivity_sync_tasks**
Sincroniza tareas entre plataformas.

```javascript
Usuario: "Sincroniza mis tareas de Notion a Asana"
Bot: "15 tareas sincronizadas de Notion a Asana"
```

## 🎯 **Casos de Uso**

### **Escenario 1: Dashboard Unificado**
```
Usuario: "¿Qué tareas tengo pendientes?"
Bot: "Déjame revisar todas tus plataformas..."

Bot: "Notion: 5 tareas
     - Revisar código [In Progress]
     - Diseñar mockups [To Do]
     
     Trello: 3 tareas
     - Actualizar docs [Doing]
     - Testing [To Do]
     
     Asana: 2 tareas
     - Reunión equipo [Incomplete]
     - Presentación [Incomplete]"
```

### **Escenario 2: Migración de Proyecto**
```
Usuario: "Voy a migrar mi proyecto de Trello a Notion"
Bot: "¿Quieres que sincronice todas las tareas?"
Usuario: "Sí"
Bot: "Sincronizando..."
Bot: "12 tareas copiadas de Trello a Notion exitosamente"
```

### **Escenario 3: Trabajo Multi-Plataforma**
```
Usuario: "Crea tarea en Notion: Revisar PR"
Bot: "Tarea creada en Notion"

Usuario: "Ahora créala también en Asana"
Bot: "Tarea creada en Asana"

Usuario: "¿Qué tengo en ambas plataformas?"
Bot: "Notion: 6 tareas (incluyendo 'Revisar PR')
     Asana: 3 tareas (incluyendo 'Revisar PR')"
```

### **Escenario 4: Sincronización Automática**
```
Bot (proactivo): "Noto que tienes tareas similares en Notion y Trello.
                  ¿Quieres que las sincronice automáticamente?"

Usuario: "Sí, de Notion a Trello"
Bot: "Sincronizando... 8 tareas actualizadas"
```

## 📊 **Estructura de Tareas**

### **Notion:**
```javascript
{
  id: "page-id",
  title: "Revisar código",
  status: "In Progress",
  url: "https://notion.so/...",
  lastEdited: "2025-11-11T20:00:00Z",
  platform: "notion"
}
```

### **Trello:**
```javascript
{
  id: "card-id",
  title: "Actualizar docs",
  description: "Actualizar README y guías",
  status: "Open",
  list: "list-id",
  url: "https://trello.com/c/...",
  dueDate: "2025-11-15",
  platform: "trello"
}
```

### **Asana:**
```javascript
{
  id: "task-gid",
  title: "Reunión equipo",
  status: "Incomplete",
  dueDate: "2025-11-12",
  url: "https://app.asana.com/...",
  platform: "asana"
}
```

## 🔄 **Sincronización**

### **Cómo Funciona:**
1. Obtiene tareas de la plataforma origen
2. Crea tareas equivalentes en la plataforma destino
3. Mantiene título, descripción y fecha de vencimiento
4. Reporta cuántas tareas se sincronizaron

### **Limitaciones:**
- No sincroniza archivos adjuntos
- No mantiene comentarios
- No sincroniza subtareas (por ahora)
- Requiere ambas plataformas conectadas

## 🎨 **Integración con Memoria Contextual**

El bot aprende tus patrones de trabajo:

```javascript
// Después de varias tareas
Bot: "Noto que siempre creas tareas de 'Revisar' en Notion.
     ¿Quieres que te sugiera crear estas tareas automáticamente?"

// Detecta tu plataforma favorita
Bot: "Veo que usas más Notion que Trello.
     ¿Quieres que Notion sea tu plataforma principal?"
```

## 🚀 **Características Avanzadas**

### **Dashboard Consolidado:**
```javascript
Usuario: "Dashboard de productividad"
Bot: "📊 Dashboard de Productividad

     Total de tareas: 15
     - Notion: 6 (2 completadas)
     - Trello: 5 (1 completada)
     - Asana: 4 (0 completadas)
     
     Tareas urgentes: 3
     - Revisar PR (Notion) - Hoy
     - Reunión equipo (Asana) - Hoy
     - Testing (Trello) - Mañana
     
     Productividad esta semana: 12 tareas completadas"
```

### **Sugerencias Inteligentes:**
```javascript
Bot: "Tienes 3 tareas vencidas en Trello.
     ¿Quieres que las reprograme?"

Bot: "Llevas 5 días sin completar tareas en Asana.
     ¿Necesitas ayuda para organizarte?"
```

### **Automatización:**
```javascript
// Reglas automáticas
Bot: "¿Quieres que cree automáticamente en Notion
     todas las tareas que crees en Trello?"

// Plantillas
Bot: "Detecté que siempre creas tareas similares.
     ¿Creo una plantilla para agilizar?"
```

## 🔐 **Seguridad**

- ✅ Tokens encriptados en base de datos
- ✅ OAuth 2.0 cuando está disponible
- ✅ Permisos mínimos necesarios
- ✅ No se almacenan credenciales en texto plano
- ✅ Acceso solo a tus workspaces/boards

## 💡 **Tips**

1. **Conecta todas las plataformas** - Para dashboard completo
2. **Usa sincronización** - Mantén todo actualizado
3. **Aprovecha comandos de voz** - Más rápido que abrir apps
4. **Revisa dashboard diario** - Vista consolidada de todo
5. **Configura automatizaciones** - Ahorra tiempo

## 🐛 **Troubleshooting**

### **"Notion no está conectado"**

**Causas:**
1. Token no configurado
2. Base de datos no compartida con la integración
3. ID de base de datos incorrecto

**Solución:**
```bash
# Verificar .env
cat backend/.env | grep NOTION

# Verificar que la base de datos esté compartida con la integración
# En Notion: ... → Add connections → GBot
```

### **"No se pueden sincronizar tareas"**

**Causas:**
1. Una plataforma no está conectada
2. Permisos insuficientes
3. IDs incorrectos

**Solución:**
- Verifica que ambas plataformas estén conectadas
- Revisa los IDs en .env
- Comprueba permisos de las integraciones

### **"Error al crear tarea"**

**Causas:**
1. Formato de fecha incorrecto
2. Campo requerido faltante
3. Workspace/Board no existe

**Solución:**
- Usa formato ISO 8601 para fechas
- Proporciona al menos el título
- Verifica IDs de workspace/board

## 🔮 **Próximas Mejoras**

- [ ] **Sincronización bidireccional** - Cambios en tiempo real
- [ ] **Subtareas** - Soporte completo
- [ ] **Etiquetas y categorías** - Mantener organización
- [ ] **Archivos adjuntos** - Sincronizar documentos
- [ ] **Comentarios** - Mantener discusiones
- [ ] **Asignaciones** - Gestión de equipo
- [ ] **Prioridades** - Ordenar por importancia
- [ ] **Estadísticas** - Análisis de productividad
- [ ] **Plantillas** - Crear tareas recurrentes
- [ ] **Recordatorios** - Notificaciones inteligentes

## 📚 **APIs Utilizadas**

### **Notion API**
- **Documentación**: https://developers.notion.com
- **Versión**: 2022-06-28
- **Límites**: 3 requests/segundo

### **Trello API**
- **Documentación**: https://developer.atlassian.com/cloud/trello
- **Límites**: 300 requests/10 segundos

### **Asana API**
- **Documentación**: https://developers.asana.com
- **Versión**: 1.0
- **Límites**: 1500 requests/minuto

## 📊 **Comparación de Plataformas**

| Característica | Notion | Trello | Asana |
|---------------|--------|--------|-------|
| Bases de datos | ✅ | ❌ | ❌ |
| Kanban boards | ✅ | ✅ | ✅ |
| Subtareas | ✅ | ✅ | ✅ |
| Fechas | ✅ | ✅ | ✅ |
| Asignaciones | ✅ | ✅ | ✅ |
| Automatización | ✅ | ✅ | ✅ |
| Gratis | ✅ | ✅ | ✅ (limitado) |

## 🎯 **Comandos Rápidos**

```
"Tareas de Notion"
"Crear tarea en Trello: [título]"
"Sincronizar de Asana a Notion"
"Dashboard de productividad"
"¿Qué tengo pendiente?"
```

---

**¡Gestiona todas tus tareas desde un solo lugar!** 📋✨

## 🌟 **Ventajas de la Integración**

1. **Un solo lugar** - No más cambiar entre apps
2. **Control por voz** - Más rápido que escribir
3. **Sincronización** - Mantén todo actualizado
4. **Dashboard unificado** - Vista completa
5. **Inteligencia** - Aprende tus patrones
6. **Automatización** - Ahorra tiempo
