# 📧 Email Inteligente - Gestión Automática de Gmail

GBot ahora puede leer, resumir, categorizar y gestionar tus emails de Gmail automáticamente.

## ✨ **Funcionalidades**

### 📬 **Lectura Inteligente**
- Ver emails recientes
- Solo no leídos o todos
- Resumen automático
- Categorización inteligente

### 🏷️ **Categorización Automática**
- 🚨 Urgentes
- 💼 Trabajo
- 👤 Personales
- 📰 Newsletters
- 💰 Finanzas
- 📱 Redes sociales

### 🤖 **Gestión Automática**
- Marcar como leído
- Archivar emails
- Eliminar spam
- Enviar respuestas

### 📊 **Resúmenes Inteligentes**
- Emails por categoría
- Priorización automática
- Alertas de urgentes
- Estadísticas

## 🔧 **Configuración**

### **Ya está configurado!**

Si ya conectaste tu cuenta de Google para Calendar/Tasks, el servicio de email ya está disponible. Solo necesitas **volver a autorizar** con los nuevos permisos de Gmail.

### **Pasos:**

1. **Desconecta y reconecta Google:**
   - En el frontend, desconecta tu cuenta de Google
   - Vuelve a conectar
   - Autoriza los nuevos permisos de Gmail

2. **Permisos necesarios:**
   - ✅ Leer emails
   - ✅ Enviar emails
   - ✅ Modificar emails (marcar leído, archivar)

## 🎤 **Comandos de Voz**

### **Ver Emails:**
```
"¿Tengo emails nuevos?"
"Muéstrame mis emails"
"¿Qué correos tengo?"
"Lee mis emails no leídos"
```

### **Resumen:**
```
"Resumen de mis emails"
"¿Qué emails importantes tengo?"
"Dame un resumen de mi bandeja"
```

### **Gestión:**
```
"Marca el email 1 como leído"
"Envía un email a juan@example.com"
```

## 📋 **Funciones Disponibles**

### **1. email_get_recent**
Obtiene emails recientes.

```javascript
Usuario: "¿Tengo emails nuevos?"
Bot: "Tienes 5 emails:

1. De: Juan Pérez <juan@example.com>
   Asunto: Reunión de proyecto
   Hola, necesitamos coordinar la reunión...

2. De: María García <maria@example.com>
   Asunto: Propuesta de diseño
   Te envío la propuesta actualizada..."
```

### **2. email_summarize**
Genera resumen categorizado.

```javascript
Usuario: "Resumen de mis emails"
Bot: "📧 Resumen de Emails:

Total: 15 emails
No leídos: 8
Importantes: 3

🚨 Urgentes (2):
  - Reunión urgente - Juan Pérez
  - Aprobación requerida - Jefe

💼 Trabajo (5):
  - Proyecto X - Cliente
  - Reporte semanal - Equipo
  
💰 Finanzas (3):
  - Factura #123 - Proveedor"
```

### **3. email_mark_read**
Marca email como leído.

```javascript
Usuario: "Marca el email 1 como leído"
Bot: "Email 'Reunión de proyecto' marcado como leído"
```

### **4. email_send**
Envía un email.

```javascript
Usuario: "Envía un email a juan@example.com con asunto 'Confirmación' 
         y mensaje 'Confirmo mi asistencia'"
Bot: "Email enviado a juan@example.com"
```

## 🎯 **Casos de Uso**

### **Escenario 1: Revisión Matutina**
```
Usuario: "Buenos días, ¿qué emails tengo?"
Bot: "Buenos días! Tienes 12 emails nuevos.

🚨 3 urgentes:
- Aprobación de presupuesto (Jefe)
- Cliente esperando respuesta (Ventas)
- Problema en producción (Soporte)

¿Quieres que te muestre los detalles?"
```

### **Escenario 2: Filtrado Inteligente**
```
Usuario: "¿Tengo emails importantes?"
Bot: "Sí, tienes 5 emails importantes:

1. Reunión con CEO - Mañana 10 AM
2. Aprobación de contrato - Urgente
3. Propuesta de cliente - Revisar hoy
4. Reporte mensual - Vence viernes
5. Feedback de proyecto - Importante"
```

### **Escenario 3: Gestión Rápida**
```
Usuario: "Resumen de emails"
Bot: "📧 15 emails totales

💼 Trabajo: 8 emails
📰 Newsletters: 4 emails
👤 Personal: 3 emails

¿Quieres que archive los newsletters?"

Usuario: "Sí"
Bot: "4 newsletters archivados"
```

### **Escenario 4: Respuesta Automática**
```
Bot (proactivo): "Tienes un email urgente de tu jefe sobre 
                  aprobación de presupuesto. ¿Quieres que 
                  envíe una respuesta confirmando?"

Usuario: "Sí, confirma que lo revisaré hoy"
Bot: "Email enviado: 'Recibido, lo revisaré hoy y te 
     respondo antes de las 5 PM'"
```

## 🏷️ **Categorización Automática**

### **Cómo Funciona:**

El bot analiza:
- **Remitente** - Dominio, nombre
- **Asunto** - Palabras clave
- **Contenido** - Primeras líneas
- **Etiquetas** - Importante, no leído

### **Categorías:**

#### **🚨 Urgente**
- Palabras: "urgent", "importante", "asap"
- Marcados como importantes
- De tu jefe o clientes clave

#### **💼 Trabajo**
- Dominios corporativos
- Palabras: "meeting", "project", "reunión"
- Horario laboral

#### **👤 Personal**
- Contactos personales
- Sin palabras clave de trabajo
- Fuera de horario laboral

#### **📰 Newsletter**
- "Unsubscribe" en el cuerpo
- De "noreply" o "no-reply"
- Listas de correo

#### **💰 Finanzas**
- Palabras: "invoice", "payment", "factura"
- De bancos o proveedores
- Números de cuenta

#### **📱 Social**
- De redes sociales
- Notificaciones automáticas

## 🤖 **Respuestas Automáticas**

### **Tipos de Respuestas:**

```javascript
// Solicitud de reunión
"Gracias por tu email. He recibido tu solicitud de reunión 
 y te responderé pronto con mi disponibilidad."

// Pregunta
"Gracias por tu pregunta. La he recibido y te responderé 
 lo antes posible."

// Agradecimiento
"De nada, fue un placer ayudarte."

// General
"Gracias por tu email. Lo he recibido y te responderé pronto."
```

## 📊 **Estadísticas y Análisis**

```javascript
Bot: "📊 Análisis de Email (última semana):

Recibidos: 156 emails
Enviados: 42 emails
Tasa de respuesta: 27%

Por categoría:
- Trabajo: 89 (57%)
- Newsletter: 45 (29%)
- Personal: 22 (14%)

Tiempo promedio de respuesta: 4.2 horas
Emails sin responder: 12"
```

## 🔄 **Integración con Otras Funcionalidades**

### **Con Calendario:**
```
Bot: "Tienes un email sobre reunión mañana a las 10 AM.
     ¿Quieres que la agende en tu calendario?"
```

### **Con Tareas:**
```
Bot: "Email de cliente solicita revisión de propuesta.
     ¿Creo una tarea para recordártelo?"
```

### **Con Memoria:**
```
Bot: "Noto que siempre respondes emails de este cliente 
     en menos de 1 hora. ¿Marco sus emails como prioritarios?"
```

## 🎨 **Comportamiento Proactivo**

### **Alertas Inteligentes:**
```
Bot (proactivo): "⚠️ Tienes 3 emails urgentes sin leer:
                  1. Aprobación de presupuesto (Jefe)
                  2. Cliente esperando respuesta
                  3. Problema en producción"
```

### **Recordatorios:**
```
Bot (proactivo): "Tienes un email de hace 2 días sin responder.
                  ¿Quieres que te lo recuerde?"
```

### **Sugerencias:**
```
Bot (proactivo): "Tienes 15 newsletters sin leer.
                  ¿Quieres que los archive automáticamente?"
```

## 🔐 **Privacidad y Seguridad**

- ✅ Solo acceso a tu Gmail
- ✅ Tokens encriptados
- ✅ OAuth 2.0 seguro
- ✅ No se almacenan emails
- ✅ Solo procesamiento temporal
- ✅ Puedes revocar acceso en cualquier momento

## 💡 **Tips**

1. **Revisa resumen diario** - Ahorra tiempo
2. **Usa categorización** - Prioriza mejor
3. **Automatiza respuestas simples** - Más eficiente
4. **Archiva newsletters** - Bandeja limpia
5. **Marca urgentes** - No pierdas nada importante

## 🐛 **Troubleshooting**

### **"Servicio de email no disponible"**

**Causas:**
1. No has autorizado Gmail
2. Permisos insuficientes
3. Token expirado

**Solución:**
```
1. Desconecta Google en el frontend
2. Vuelve a conectar
3. Autoriza todos los permisos (incluyendo Gmail)
```

### **"No puedo enviar emails"**

**Causas:**
1. Falta permiso de envío
2. Dirección inválida
3. Límite de Gmail alcanzado

**Solución:**
- Verifica permisos en Google
- Comprueba dirección de email
- Gmail tiene límite de 500 emails/día

## 🔮 **Próximas Mejoras**

- [ ] **Respuestas con IA** - GPT genera respuestas
- [ ] **Detección de spam** - Filtrado inteligente
- [ ] **Plantillas** - Respuestas predefinidas
- [ ] **Programar envíos** - Enviar más tarde
- [ ] **Seguimiento** - Recordar si no responden
- [ ] **Análisis de sentimiento** - Detectar tono
- [ ] **Extracción de datos** - Fechas, números
- [ ] **Integración con CRM** - Sincronizar contactos

## 📚 **API Utilizada**

### **Gmail API**
- **Documentación**: https://developers.google.com/gmail/api
- **Límites**: 
  - 1 billón de cuota units/día
  - 250 cuota units/usuario/segundo
- **Scopes**:
  - `gmail.readonly` - Leer emails
  - `gmail.send` - Enviar emails
  - `gmail.modify` - Modificar (marcar leído, etc.)

## 🎯 **Comandos Rápidos**

```
"Emails nuevos"
"Resumen de emails"
"Marca email 1 como leído"
"Envía email a [email]"
"¿Tengo emails urgentes?"
"Archive newsletters"
```

---

**¡Gestiona tu email con inteligencia artificial!** 📧✨

## 🌟 **Ventajas**

1. **Ahorra tiempo** - Resúmenes automáticos
2. **No pierdas nada** - Alertas de urgentes
3. **Organización** - Categorización automática
4. **Respuestas rápidas** - Automatización
5. **Control por voz** - Más cómodo
6. **Inteligente** - Aprende tus patrones
