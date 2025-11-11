# 💡 Ejemplos de Uso - GBot

## Ejemplos de Conversación

### Crear un Evento en el Calendario

**Usuario:** "Crea una reunión con el equipo mañana a las 10 de la mañana"

**GBot procesa:**
1. Detecta la intención: crear evento
2. Extrae información: "reunión con el equipo", "mañana", "10 AM"
3. Llama a `create_calendar_event`
4. Confirma al usuario

**GBot responde:** "Perfecto, agendé tu reunión con el equipo para mañana a las 10:00 AM. ¿Quieres que invite a alguien más?"

### Listar Eventos Próximos

**Usuario:** "¿Qué tengo en mi agenda hoy?"

**GBot:** "Hoy tienes 3 eventos:
- 10:00 AM - Reunión con el equipo
- 2:00 PM - Llamada con cliente
- 5:00 PM - Revisión de proyecto"

### Crear una Tarea

**Usuario:** "Recuérdame comprar flores para el cumpleaños de mamá"

**GBot:** "Claro, agregué 'Comprar flores para mamá 🌸' a tus tareas. ¿Para cuándo la necesitas?"

**Usuario:** "Para el viernes"

**GBot:** "Perfecto, la marqué para el viernes. Te recordaré ese día."

### Comportamiento Proactivo

**GBot (detecta evento próximo):** "Oye, tienes una reunión en 15 minutos con el equipo. ¿Quieres que te prepare un resumen de los puntos a tratar?"

**Usuario:** "Sí, por favor"

**GBot:** "Aquí está el resumen basado en tus notas anteriores..."

---

## Ejemplos de Código

### Frontend: Conectar WebSocket

```javascript
import { useWebSocket } from './hooks/useWebSocket';

function MyComponent() {
  const { send, isConnected } = useWebSocket();

  const sendMessage = () => {
    send({
      type: 'text_message',
      text: 'Hola GBot'
    });
  };

  return (
    <div>
      <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <button onClick={sendMessage}>Enviar mensaje</button>
    </div>
  );
}
```

### Frontend: Grabar Audio

```javascript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 16000
    } 
  });

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    const reader = new FileReader();
    reader.readAsDataURL(event.data);
    reader.onloadend = () => {
      const base64Audio = reader.result.split(',')[1];
      send({
        type: 'audio_chunk',
        audio: base64Audio
      });
    };
  };

  mediaRecorder.start(100); // Chunks cada 100ms
};
```

### Backend: Crear Evento con Calendar Service

```javascript
import { CalendarService } from './services/calendarService.js';

const calendarService = new CalendarService(userTokens);

const result = await calendarService.createEvent({
  summary: 'Reunión importante',
  description: 'Discutir Q4',
  start: '2025-11-12T10:00:00Z',
  end: '2025-11-12T11:00:00Z',
  attendees: ['team@example.com']
});

console.log('Evento creado:', result.eventId);
```

### Backend: Crear Tarea con Tasks Service

```javascript
import { TasksService } from './services/tasksService.js';

const tasksService = new TasksService(userTokens);

const result = await tasksService.createTask({
  title: 'Comprar flores',
  notes: 'Para mamá',
  due: '2025-11-15T00:00:00Z'
});

console.log('Tarea creada:', result.taskId);
```

### Backend: Manejar Function Call de OpenAI

```javascript
async function executeFunctionCall(session, functionCall) {
  const { name, arguments: args } = functionCall;

  switch (name) {
    case 'create_calendar_event':
      const calendarService = new CalendarService(session.userTokens);
      const event = await calendarService.createEvent(args);
      return {
        success: true,
        eventId: event.eventId,
        message: `Evento "${args.summary}" creado exitosamente`
      };

    case 'create_task':
      const tasksService = new TasksService(session.userTokens);
      const task = await tasksService.createTask(args);
      return {
        success: true,
        taskId: task.taskId,
        message: `Tarea "${args.title}" creada exitosamente`
      };

    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
```

---

## Ejemplos de Personalización

### Cambiar la Personalidad del Bot

Edita `backend/src/config/openai.js`:

```javascript
export const REALTIME_CONFIG = {
  // ...
  instructions: `Eres un asistente personal muy formal y profesional.
  
  Características:
  - Siempre usas un lenguaje corporativo
  - Eres extremadamente organizado
  - Priorizas la eficiencia
  - Usas términos técnicos cuando es apropiado
  
  Evita:
  - Lenguaje casual o coloquial
  - Emojis
  - Humor excesivo`,
  // ...
};
```

### Agregar Nueva Tool (Function)

```javascript
// En backend/src/config/openai.js
export const TOOLS = [
  // ... tools existentes
  {
    type: 'function',
    name: 'send_email',
    description: 'Envía un email a través de Gmail',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Destinatario del email'
        },
        subject: {
          type: 'string',
          description: 'Asunto del email'
        },
        body: {
          type: 'string',
          description: 'Cuerpo del mensaje'
        }
      },
      required: ['to', 'subject', 'body']
    }
  }
];
```

Luego implementa el servicio correspondiente.

### Personalizar Animaciones

Edita `frontend/src/components/Bot/BotAvatar.jsx`:

```javascript
const stateConfig = {
  idle: {
    color: '#your-color',
    icon: YourIcon,
    animation: 'your-animation',
    glow: true
  },
  // ... otros estados
};
```

### Agregar Nuevo Estado

```javascript
// En backend/src/websocket/stateMachine.js
this.validTransitions = {
  // ... transiciones existentes
  custom_state: ['idle', 'thinking'],
};

this.stateMetadata = {
  // ... metadata existente
  custom_state: {
    animation: 'custom',
    description: 'Estado personalizado',
    canInterrupt: true
  }
};
```

---

## Casos de Uso Avanzados

### 1. Recordatorios Inteligentes

```javascript
// El bot revisa eventos próximos cada 5 minutos
setInterval(async () => {
  const upcomingEvents = await calendarService.getUpcomingEvents(15);
  
  if (upcomingEvents.length > 0) {
    sendToClient(ws, {
      type: 'proactive_message',
      message: `Tienes ${upcomingEvents.length} evento(s) en los próximos 15 minutos`
    });
  }
}, 5 * 60 * 1000);
```

### 2. Análisis de Sentimiento

```javascript
// Detectar el estado emocional del usuario
const sentiment = analyzeSentiment(userMessage);

if (sentiment === 'stressed') {
  botResponse = "Parece que estás ocupado. ¿Quieres que reorganice tu agenda?";
}
```

### 3. Sugerencias Proactivas

```javascript
// Sugerir optimizaciones en el calendario
const events = await calendarService.listEvents({
  timeMin: startOfDay,
  timeMax: endOfDay
});

if (events.length > 8) {
  suggest("Tienes muchas reuniones hoy. ¿Quieres que cancele las menos importantes?");
}
```

---

## Testing

### Test de WebSocket

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001?token=YOUR_TOKEN');

ws.on('open', () => {
  console.log('Connected');
  
  ws.send(JSON.stringify({
    type: 'text_message',
    text: 'Hola GBot'
  }));
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
});
```

### Test de API REST

```bash
# Obtener URL de autenticación
curl http://localhost:3001/auth/google

# Listar eventos (con token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/calendar/events

# Crear evento
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"summary":"Test","start":"2025-11-12T10:00:00Z","end":"2025-11-12T11:00:00Z"}' \
  http://localhost:3001/api/calendar/events
```

---

## Mejores Prácticas

1. **Manejo de Errores**: Siempre envuelve las llamadas a APIs en try-catch
2. **Rate Limiting**: Respeta los límites de OpenAI y Google APIs
3. **Seguridad**: Nunca expongas tokens o API keys en el frontend
4. **UX**: Proporciona feedback visual durante operaciones largas
5. **Privacidad**: Pide consentimiento antes de acceder a datos sensibles

---

Para más ejemplos, consulta el código fuente en `/backend/src` y `/frontend/src`.
