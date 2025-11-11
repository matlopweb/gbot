# 📡 Documentación de API - GBot

## Endpoints REST

### Autenticación

#### `GET /auth/google`
Inicia el flujo de OAuth2 con Google.

**Response:**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### `GET /auth/google/callback`
Callback de OAuth2. Redirige al frontend con el token JWT.

**Query Params:**
- `code`: Código de autorización de Google

**Redirect:**
```
http://localhost:3000/auth/callback?token=JWT_TOKEN
```

#### `POST /auth/refresh`
Refresca el access token de Google.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully"
}
```

#### `GET /auth/status`
Verifica el estado de autenticación.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "userId": "user_123",
  "hasRefreshToken": true,
  "tokenExpiry": 1699999999999
}
```

#### `POST /auth/logout`
Cierra la sesión del usuario.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Google Calendar

Todos los endpoints requieren autenticación.

#### `POST /api/calendar/events`
Crea un nuevo evento en el calendario.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Body:**
```json
{
  "summary": "Reunión con equipo",
  "description": "Discutir proyecto Q4",
  "start": "2025-11-12T10:00:00Z",
  "end": "2025-11-12T11:00:00Z",
  "attendees": ["email1@example.com", "email2@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "event_123",
  "htmlLink": "https://calendar.google.com/...",
  "event": { /* evento completo */ }
}
```

#### `GET /api/calendar/events`
Lista eventos del calendario.

**Query Params:**
- `timeMin` (opcional): Fecha de inicio (ISO 8601)
- `timeMax` (opcional): Fecha de fin (ISO 8601)
- `maxResults` (opcional): Número máximo de resultados (default: 10)

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_123",
      "summary": "Reunión",
      "start": "2025-11-12T10:00:00Z",
      "end": "2025-11-12T11:00:00Z",
      "htmlLink": "https://...",
      "attendees": ["email@example.com"]
    }
  ]
}
```

#### `GET /api/calendar/events/:eventId`
Obtiene un evento específico.

**Response:**
```json
{
  "success": true,
  "event": { /* evento completo */ }
}
```

#### `PUT /api/calendar/events/:eventId`
Actualiza un evento.

**Body:**
```json
{
  "summary": "Nuevo título",
  "start": "2025-11-12T11:00:00Z"
}
```

#### `DELETE /api/calendar/events/:eventId`
Elimina un evento.

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### `GET /api/calendar/search`
Busca eventos por texto.

**Query Params:**
- `q`: Texto de búsqueda

**Response:**
```json
{
  "success": true,
  "events": [ /* eventos encontrados */ ]
}
```

#### `GET /api/calendar/upcoming`
Obtiene eventos próximos.

**Query Params:**
- `minutes` (opcional): Minutos hacia adelante (default: 60)

**Response:**
```json
{
  "success": true,
  "events": [ /* eventos próximos */ ]
}
```

---

### Google Tasks

Todos los endpoints requieren autenticación.

#### `POST /api/tasks`
Crea una nueva tarea.

**Body:**
```json
{
  "title": "Comprar flores",
  "notes": "Para el cumpleaños de mamá",
  "due": "2025-11-15T00:00:00Z",
  "tasklist": "@default"
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task_123",
  "task": { /* tarea completa */ }
}
```

#### `GET /api/tasks`
Lista todas las tareas.

**Query Params:**
- `showCompleted` (opcional): true/false
- `tasklist` (opcional): ID de la lista (default: @default)

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task_123",
      "title": "Comprar flores",
      "status": "needsAction",
      "due": "2025-11-15T00:00:00Z"
    }
  ]
}
```

#### `GET /api/tasks/:taskId`
Obtiene una tarea específica.

#### `PUT /api/tasks/:taskId`
Actualiza una tarea.

#### `POST /api/tasks/:taskId/complete`
Marca una tarea como completada.

#### `DELETE /api/tasks/:taskId`
Elimina una tarea.

#### `GET /api/tasks/lists/all`
Lista todas las listas de tareas.

#### `POST /api/tasks/lists`
Crea una nueva lista de tareas.

#### `GET /api/tasks/pending/all`
Obtiene tareas pendientes.

#### `GET /api/tasks/overdue/all`
Obtiene tareas vencidas.

---

## WebSocket API

### Conexión

```javascript
const ws = new WebSocket('ws://localhost:3001?token=JWT_TOKEN');
```

### Mensajes del Cliente → Servidor

#### Iniciar sesión de realtime
```json
{
  "type": "start_realtime",
  "config": {
    "language": "es"
  }
}
```

#### Enviar chunk de audio
```json
{
  "type": "audio_chunk",
  "audio": "base64_encoded_audio"
}
```

#### Enviar mensaje de texto
```json
{
  "type": "text_message",
  "text": "Hola GBot"
}
```

#### Detener sesión de realtime
```json
{
  "type": "stop_realtime"
}
```

#### Actualizar contexto
```json
{
  "type": "update_context",
  "context": {
    "key": "value"
  }
}
```

### Mensajes del Servidor → Cliente

#### Conexión establecida
```json
{
  "type": "connected",
  "sessionId": "session_123",
  "timestamp": 1699999999999
}
```

#### Cambio de estado
```json
{
  "type": "state_change",
  "state": "listening",
  "timestamp": 1699999999999
}
```

#### Delta de audio
```json
{
  "type": "audio_delta",
  "audio": "base64_encoded_audio"
}
```

#### Delta de texto
```json
{
  "type": "text_delta",
  "text": "Hola, "
}
```

#### Respuesta completa
```json
{
  "type": "response",
  "text": "Hola, ¿en qué puedo ayudarte?"
}
```

#### Function call
```json
{
  "type": "function_call",
  "function": "create_calendar_event",
  "arguments": {
    "summary": "Reunión",
    "start": "2025-11-12T10:00:00Z"
  }
}
```

#### Error
```json
{
  "type": "error",
  "message": "Error message"
}
```

---

## Estados del Bot

- **idle**: En reposo, esperando interacción
- **listening**: Escuchando al usuario
- **thinking**: Procesando información
- **speaking**: Respondiendo al usuario
- **working**: Ejecutando tareas (Calendar/Tasks)

---

## Códigos de Error

- `400`: Bad Request - Parámetros inválidos
- `401`: Unauthorized - Token inválido o expirado
- `403`: Forbidden - Sin permisos
- `404`: Not Found - Recurso no encontrado
- `500`: Internal Server Error - Error del servidor

---

## Rate Limiting

- **API REST**: 100 requests por 15 minutos por IP
- **WebSocket**: Sin límite, pero se recomienda no enviar más de 10 mensajes por segundo

---

## Ejemplos de Uso

Ver `docs/EXAMPLES.md` para ejemplos completos de uso.
