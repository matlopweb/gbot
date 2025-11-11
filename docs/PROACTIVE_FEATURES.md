# 🎭 Características Proactivas de GBot

GBot ahora tiene **vida propia** y puede interactuar proactivamente con el usuario, haciéndolo sentir como una verdadera mascota virtual y asistente personal.

## 🌟 Nuevas Características

### 1️⃣ **Comportamiento Proactivo**

#### Saludos Automáticos
GBot te saluda según la hora del día cuando te conectas:
- **5:00 - 12:00**: "¡Buenos días! ☀️ ¿Listo para un día productivo?"
- **12:00 - 18:00**: "¡Buenas tardes! 😊 ¿En qué puedo ayudarte hoy?"
- **18:00 - 22:00**: "¡Buenas noches! 🌙 ¿Cómo estuvo tu día?"
- **22:00 - 5:00**: "¡Hola! 🌟 Trabajando hasta tarde, ¿eh?"

#### Recordatorios Automáticos de Tareas
- Revisa tus tareas cada 30 minutos
- Te avisa si tienes tareas atrasadas: "⚠️ Tienes 3 tareas atrasadas. ¿Quieres que te ayude a organizarlas?"
- Te motiva con tareas del día: "📋 Tienes 2 tareas para hoy. ¡Vamos a completarlas!"

#### Alertas de Eventos Próximos
- Revisa tu calendario cada 15 minutos
- Te avisa 30 minutos antes de eventos: "⏰ Recordatorio: 'Reunión de equipo' en 25 minutos"

#### Recordatorios de Descanso
- Cada 2 horas durante horario laboral (9 AM - 6 PM)
- Mensajes aleatorios:
  - "☕ ¿Qué tal un descanso? Has estado trabajando mucho."
  - "🧘 Recuerda tomar un respiro. Tu salud es importante."
  - "💧 ¿Ya tomaste agua? Mantente hidratado."
  - "👀 Descansa la vista un momento. Mira algo lejos de la pantalla."

### 2️⃣ **Reacciones Emocionales**

GBot reacciona a tus acciones con mensajes personalizados:

#### Al Crear Tareas
- "📝 ¡Perfecto! Agregué 'Comprar leche' a tu lista. ¡No te preocupes, te recordaré!"

#### Al Crear Eventos
- "📅 ¡Listo! 'Reunión con el equipo' está en tu calendario. Te avisaré antes."

#### Al Listar Tareas
- **Sin tareas**: "🎈 ¡Increíble! No tienes tareas pendientes. ¡Disfruta tu tiempo libre!"
- **Muchas tareas** (>5): "😮 ¡Wow! Tienes 8 tareas. ¿Quieres que te ayude a priorizarlas?"

#### Celebraciones
- Al completar tareas (próximamente):
  - "🎉 ¡Genial! Completaste 'Revisar aplicación'. ¡Sigue así!"
  - "✨ ¡Bien hecho! Una tarea menos. ¡Eres increíble!"
  - "🌟 ¡Excelente! Cada tarea completada es un paso hacia tus metas."

### 3️⃣ **Animaciones Vivas**

#### Respiración Sutil
- El cuerpo del bot "respira" con una animación muy sutil
- Escala de 1.0 a 1.02 en ciclos de 3 segundos
- Hace que el bot se sienta vivo incluso cuando está quieto

#### Movimientos de Mirada Aleatorios
- Cuando está en estado `idle`, los ojos miran alrededor cada 5-10 segundos
- Movimientos suaves y naturales
- Vuelve al centro después de 1 segundo

#### Animaciones de Idle Aleatorias
- Cada 20-30 segundos, el bot hace pequeñas animaciones:
  - **look_around**: Mira a los lados
  - **blink**: Parpadeo extra
  - **stretch**: Estiramiento feliz
  - **yawn**: Bostezo

#### Parpadeo Automático
- Los ojos parpadean cada 3 segundos
- Animación rápida y natural (0.2 segundos)

### 4️⃣ **Sistema de Personalidad**

#### Preferencias del Usuario
El bot puede recordar:
- Nombre del usuario
- Horario de trabajo (default: 9 AM - 6 PM)
- Preferencias de recordatorios
- Rutinas personalizadas

#### Contexto de Sesión
- Rastrea el tiempo desde la última interacción
- Ajusta su comportamiento según la actividad del usuario
- Detecta sesiones largas de trabajo

### 5️⃣ **Mensajes Proactivos en el Chat**

Los mensajes proactivos aparecen en el chat con:
- Badge especial "Proactivo"
- Cambio de emoción del bot
- Opcional: voz automática (TTS)

## 🎮 Cómo Funciona

### Backend (`ProactiveBehavior`)

```javascript
// Inicialización automática al conectarse
session.proactiveBehavior = new ProactiveBehavior(session, {
  calendarService: session.calendarService,
  tasksService: session.tasksService
});
session.proactiveBehavior.start();
```

### Frontend (Manejo de Mensajes)

```javascript
case 'proactive_message':
  // Mensaje proactivo del bot
  addMessage({
    role: 'assistant',
    content: data.message,
    isProactive: true
  });
  
  // Cambiar emoción
  useBotStore.getState().setState(data.emotion);
  break;

case 'idle_animation':
  // Animación de idle
  useBotStore.getState().setState(data.emotion);
  setTimeout(() => {
    useBotStore.getState().setState('idle');
  }, 2000);
  break;
```

## 🔧 Configuración

### Ajustar Intervalos

En `proactiveBehavior.js`:

```javascript
// Revisar tareas cada X minutos
this.scheduleTaskCheck(30 * 60 * 1000); // 30 minutos

// Recordatorios de eventos cada X minutos
this.scheduleEventReminders(15 * 60 * 1000); // 15 minutos

// Animaciones de idle cada X segundos
this.scheduleIdleAnimations(20 * 1000); // 20 segundos

// Recordatorios de descanso cada X horas
this.scheduleBreakReminders(2 * 60 * 60 * 1000); // 2 horas
```

### Personalizar Horario de Trabajo

```javascript
session.proactiveBehavior.updatePreferences({
  workHoursStart: 8,  // 8 AM
  workHoursEnd: 17,   // 5 PM
  breakReminders: true,
  taskReminders: true
});
```

### Deshabilitar Comportamiento Proactivo

```javascript
session.proactiveBehavior.stop();
```

## 🎨 Estados Emocionales

GBot ahora tiene 8 estados emocionales diferentes:

1. **idle** 😊 - Relajado, esperando
2. **listening** 👂 - Atento, escuchando
3. **thinking** 🤔 - Procesando, pensando
4. **speaking** 💬 - Hablando, respondiendo
5. **working** ⚙️ - Ejecutando tareas
6. **happy** 😄 - Muy feliz, contento
7. **excited** 🤩 - Emocionado, entusiasmado
8. **confused** 😕 - Confundido, dudando

Cada estado tiene:
- Expresión facial única
- Color de fondo característico
- Emoji representativo
- Animaciones específicas

## 📊 Métricas de Interacción

El sistema rastrea:
- Tiempo desde la última interacción
- Número de tareas creadas
- Eventos próximos
- Sesiones de trabajo largas

## 🚀 Próximas Mejoras

- [ ] Detección de patrones de uso
- [ ] Sugerencias inteligentes basadas en historial
- [ ] Integración con clima y noticias
- [ ] Modo "Focus" para concentración
- [ ] Gamificación (logros, racha de productividad)
- [ ] Personalidad adaptativa según el usuario
- [ ] Recordatorios de cumpleaños y fechas importantes
- [ ] Integración con Spotify para música de fondo

## 💡 Ejemplos de Uso

### Escenario 1: Inicio del Día
```
[9:00 AM] GBot: ¡Buenos días! ☀️ ¿Listo para un día productivo?
[9:05 AM] GBot: 📋 Tienes 3 tareas para hoy. ¡Vamos a completarlas!
```

### Escenario 2: Trabajo Intenso
```
[11:00 AM] Usuario: Crea tarea "Revisar código"
[11:00 AM] GBot: 📝 ¡Perfecto! Agregué "Revisar código" a tu lista.
[1:00 PM] GBot: ☕ ¿Qué tal un descanso? Has estado trabajando mucho.
```

### Escenario 3: Evento Próximo
```
[2:30 PM] GBot: ⏰ Recordatorio: "Reunión de equipo" en 30 minutos
```

### Escenario 4: Fin del Día
```
[6:00 PM] Usuario: ¿Qué tareas tengo pendientes?
[6:00 PM] GBot: 🎈 ¡Increíble! No tienes tareas pendientes. ¡Disfruta tu tiempo libre!
```

## 🎯 Beneficios

1. **Más Humano**: GBot se siente como un compañero, no solo una herramienta
2. **Productividad**: Recordatorios automáticos te mantienen enfocado
3. **Bienestar**: Recordatorios de descanso cuidan tu salud
4. **Motivación**: Celebraciones y mensajes positivos te animan
5. **Organización**: Alertas de eventos y tareas te mantienen al día
6. **Engagement**: Animaciones y personalidad hacen la experiencia más agradable

---

**¡GBot ahora tiene vida propia!** 🎉✨
