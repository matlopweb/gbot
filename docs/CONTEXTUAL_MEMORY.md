# 🧠 Sistema de Memoria Contextual con IA

GBot ahora tiene un sistema avanzado de memoria que aprende y recuerda información sobre ti, haciendo que cada interacción sea más personalizada y útil.

## ✨ **¿Qué es la Memoria Contextual?**

Es un sistema inteligente que:
- 📝 **Recuerda** tus conversaciones pasadas
- 🎯 **Aprende** tus preferencias y patrones
- 🔮 **Predice** lo que podrías necesitar
- 💡 **Personaliza** sus respuestas basándose en lo que sabe de ti

## 🗂️ **Categorías de Memoria**

### 1. **Información Personal**
```javascript
{
  name: "Juan",
  role: "desarrollador",
  interests: ["React", "IA", "música"],
  timezone: "America/Argentina/Buenos_Aires"
}
```

**Ejemplos de aprendizaje:**
- "Me llamo Juan" → Guarda tu nombre
- "Soy desarrollador" → Guarda tu rol
- "Me gusta React" → Agrega a intereses

### 2. **Preferencias de Trabajo**
```javascript
{
  preferredMeetingTimes: ["09:00", "10:00"],
  workHoursStart: 9,
  workHoursEnd: 18,
  breakPreferences: {
    frequency: 120, // minutos
    duration: 15
  },
  focusHours: ["09:00-12:00"]
}
```

**Ejemplos de aprendizaje:**
- "Prefiero reuniones por la mañana" → Guarda horarios preferidos
- "Trabajo de 9 a 6" → Ajusta horario laboral

### 3. **Patrones Detectados**
```javascript
{
  recurringMeetings: [
    { day: "martes", time: "10:00", topic: "standup", count: 8 }
  ],
  taskPatterns: [
    { type: "revisión", count: 15, lastCreated: "2025-11-11" }
  ],
  peakProductivity: ["09:00", "10:00", "15:00"],
  commonProjects: ["GBot", "API REST"]
}
```

**Ejemplos de detección:**
- Creas reuniones todos los martes a las 10 AM → Detecta patrón
- Frecuentemente creas tareas de "revisar código" → Identifica tipo común

### 4. **Contexto de Conversaciones**
```javascript
{
  recentTopics: ["programación", "reuniones", "tareas"],
  ongoingProjects: ["GBot", "Dashboard"],
  pendingQuestions: ["¿Cuándo es la reunión?"],
  lastInteraction: "2025-11-11T18:45:00Z"
}
```

**Ejemplos de uso:**
- "La última vez hablamos sobre React" → Usa contexto anterior
- "¿Cómo va el proyecto GBot?" → Sabe que es un proyecto actual

### 5. **Aprendizaje Continuo**
```javascript
{
  currentCourses: ["React Avanzado", "Machine Learning"],
  skills: [
    { name: "React", level: "avanzado" },
    { name: "Python", level: "intermedio" }
  ],
  studySchedule: ["lunes 20:00", "miércoles 20:00"],
  learningGoals: ["Aprender IA", "Mejorar en TypeScript"]
}
```

### 6. **Relaciones y Contactos**
```javascript
{
  frequentContacts: ["María", "Carlos", "Ana"],
  teamMembers: ["equipo desarrollo"],
  importantDates: [
    { type: "cumpleaños", name: "María", date: "05-15" }
  ]
}
```

### 7. **Estadísticas de Interacción**
```javascript
{
  totalMessages: 156,
  tasksCreated: 23,
  eventsCreated: 12,
  questionsAnswered: 45,
  lastActive: "2025-11-11T18:45:00Z"
}
```

## 🎯 **Cómo Funciona**

### **Aprendizaje Automático**

El sistema aprende de cada interacción:

#### 1. **Mensajes de Texto**
```javascript
Usuario: "Me llamo Juan y soy desarrollador de React"

// GBot aprende:
- Nombre: Juan
- Rol: desarrollador
- Interés: React
- Tema: programación
```

#### 2. **Creación de Tareas**
```javascript
Usuario: "Crea tarea 'Revisar código' para mañana"

// GBot detecta:
- Tipo de tarea: revisión
- Patrón: tareas de revisión frecuentes
- Horario preferido: si siempre las creas a la misma hora
```

#### 3. **Creación de Eventos**
```javascript
Usuario: "Agenda reunión de equipo martes 10 AM"

// GBot identifica:
- Reunión recurrente: martes 10 AM
- Horario preferido: mañanas
- Tipo: reunión de equipo
```

### **Personalización de Respuestas**

GBot usa la memoria para personalizar sus respuestas:

#### Ejemplo 1: Sin Memoria
```
Usuario: "¿Qué tengo para mañana?"
Bot: "Tienes 3 tareas y 2 eventos"
```

#### Ejemplo 2: Con Memoria
```
Usuario: "¿Qué tengo para mañana?"
Bot: "Juan, tienes 3 tareas (incluyendo tu revisión de código habitual) 
     y 2 eventos. Tu reunión de equipo es a las 10 AM como siempre."
```

### **Predicción de Necesidades**

El sistema puede predecir lo que necesitas:

```javascript
// Detecta patrón: Reuniones todos los martes a las 10 AM

Bot (proactivo): "Noto que usualmente tienes reunión de equipo 
                  los martes a las 10 AM. ¿Quieres que la agende 
                  para mañana?"
```

## 💡 **Ejemplos de Uso**

### **Escenario 1: Primera Conversación**
```
Usuario: "Hola, me llamo Juan y soy desarrollador"
Bot: "¡Hola Juan! Encantado de conocerte. ¿En qué puedo ayudarte hoy?"

[GBot guarda: nombre=Juan, rol=desarrollador]
```

### **Escenario 2: Conversación Posterior**
```
Usuario: "Hola"
Bot: "¡Hola Juan! ¿Cómo va tu trabajo como desarrollador hoy?"

[GBot usa: nombre y rol guardados]
```

### **Escenario 3: Detección de Patrones**
```
[Después de crear 5 tareas de "revisar código"]

Usuario: "Crea tarea revisar código"
Bot: "¡Claro! Noto que frecuentemente revisas código. 
     ¿Quieres que te recuerde automáticamente cada día?"

[GBot detectó: patrón de tareas de revisión]
```

### **Escenario 4: Reuniones Recurrentes**
```
[Después de 3 reuniones los martes a las 10 AM]

Bot (lunes): "Juan, mañana martes usualmente tienes tu reunión 
              de equipo a las 10 AM. ¿La agendo?"

[GBot predijo: reunión recurrente]
```

### **Escenario 5: Preferencias**
```
Usuario: "Prefiero reuniones por la mañana"
Bot: "Perfecto, recordaré que prefieres reuniones por la mañana"

[Más tarde...]

Usuario: "Agenda reunión con María"
Bot: "¿Te parece bien mañana a las 10 AM? 
     Sé que prefieres reuniones por la mañana"

[GBot aplicó: preferencia guardada]
```

## 🔧 **Configuración**

### **Actualizar Preferencias Manualmente**

```javascript
// En el futuro, podrás hacer:
Usuario: "Configura mi horario de trabajo de 8 AM a 5 PM"
Bot: "Listo, actualicé tu horario de trabajo"
```

### **Ver lo que GBot Sabe de Ti**

```javascript
Usuario: "¿Qué sabes sobre mí?"
Bot: "Esto es lo que sé:
     - Tu nombre es Juan
     - Eres desarrollador
     - Te interesa React, IA y música
     - Prefieres reuniones por la mañana
     - Tienes reuniones recurrentes los martes a las 10 AM
     - Frecuentemente creas tareas de revisión de código"
```

### **Borrar Información**

```javascript
Usuario: "Olvida mi nombre"
Bot: "Listo, olvidé tu nombre"

Usuario: "Borra toda mi información"
Bot: "¿Estás seguro? Esto borrará todo lo que he aprendido sobre ti"
```

## 📊 **Métricas y Análisis**

El sistema rastrea:
- Total de mensajes intercambiados
- Tareas y eventos creados
- Temas más discutidos
- Proyectos activos
- Patrones de productividad

## 🚀 **Próximas Mejoras**

- [ ] **Persistencia en Supabase**: Guardar memoria entre sesiones
- [ ] **Exportar/Importar**: Backup de tu memoria
- [ ] **Compartir contexto**: Entre dispositivos
- [ ] **Análisis de sentimientos**: Detectar tu estado de ánimo
- [ ] **Sugerencias inteligentes**: Basadas en patrones
- [ ] **Recordatorios contextuales**: "Hace 2 semanas mencionaste..."

## 🔒 **Privacidad**

- ✅ Toda la memoria es **local** por defecto
- ✅ **Tú controlas** qué se guarda
- ✅ Puedes **borrar** cualquier información
- ✅ **Encriptación** de datos sensibles (próximamente)

## 🎯 **Beneficios**

1. **Conversaciones más naturales**: El bot te conoce
2. **Menos repetición**: No necesitas explicar lo mismo
3. **Sugerencias relevantes**: Basadas en tus patrones
4. **Ahorro de tiempo**: Predicciones inteligentes
5. **Experiencia personalizada**: Única para ti

---

**¡GBot ahora te conoce y aprende de ti!** 🧠✨

## 📝 **Comandos Útiles**

```
"¿Qué sabes sobre mí?" - Ver tu perfil
"Olvida [información]" - Borrar dato específico
"Borra mi memoria" - Reset completo
"¿Qué patrones has detectado?" - Ver análisis
"Actualiza mi [preferencia]" - Modificar configuración
```

## 🔮 **Ejemplos de Predicciones**

```
// Patrón detectado: Siempre estudias lunes y miércoles a las 8 PM

Bot (lunes 7:45 PM): "Juan, en 15 minutos usualmente estudias React. 
                      ¿Quieres que prepare algunos recursos?"

// Patrón detectado: Siempre tomas café a las 3 PM

Bot (3:00 PM): "☕ Hora del café, ¿no? ¿Quieres un descanso?"

// Patrón detectado: Revisas emails cada mañana a las 9 AM

Bot (9:00 AM): "Buenos días Juan, ¿revisamos tus emails pendientes?"
```

---

**La memoria contextual es la base para todas las demás funcionalidades avanzadas de GBot.** 🎯
