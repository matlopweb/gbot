# 🧠 CONFIGURACIÓN DEL COMPAÑERO COGNITIVO

## 🚀 Configuración Automática (Recomendada)

### Opción 1: Desde la Aplicación Web
1. **Abre la aplicación** en tu navegador
2. **Espera 6 segundos** después de la pantalla de bienvenida
3. **Aparecerá automáticamente** el popup de configuración
4. **Haz clic en "Configurar Sistema"**
5. **Espera** a que se complete la configuración automática
6. **¡Listo!** Tu compañero cognitivo estará disponible

### Opción 2: Script Automático (Si el servidor está corriendo)
```bash
# Asegúrate de que el servidor backend esté corriendo
npm run dev:backend

# En otra terminal, ejecuta:
npm run setup:companion
```

### Opción 3: Configuración Manual en Supabase
1. **Ve a tu proyecto de Supabase**
2. **Abre el SQL Editor**
3. **Copia todo el contenido** de `backend/src/config/supabase.sql`
4. **Pega y ejecuta** el script completo
5. **Recarga la aplicación**

---

## 🔍 Verificación del Sistema

### Verificar Estado
Visita: `https://tu-dominio.com/api/companion/status`

**Respuestas posibles:**
- ✅ `{"status":"ready"}` - Sistema listo
- ⚠️ `{"status":"database_not_configured","setup_required":true}` - Necesita configuración
- 🔧 `{"status":"supabase_not_configured"}` - Variables de entorno faltantes

### Probar Conectividad
Visita: `https://tu-dominio.com/api/companion/test`

**Debería devolver:**
```json
{
  "status": "success",
  "message": "Rutas del Compañero Cognitivo funcionando correctamente"
}
```

---

## 🗄️ Tablas Creadas

El sistema crea **8 tablas especializadas**:

1. **`companion_personalities`** - Personalidades únicas
2. **`companion_emotional_states`** - Estados emocionales dinámicos
3. **`companion_memories`** - Memorias contextuales
4. **`companion_behavior_patterns`** - Patrones de comportamiento
5. **`voice_emotion_analysis`** - Análisis emocional de voz
6. **`companion_inner_world`** - Mundo interior visualizable
7. **`companion_proactive_interactions`** - Interacciones proactivas
8. **`companion_personality_evolution`** - Evolución de personalidad

---

## 🎭 Compañero de Ejemplo

Se crea automáticamente un compañero llamado **"Luna"** con:

- **Personalidad única**: Curioso, creativo, empático
- **Estado emocional**: Curioso y energético
- **Mundo interior**: Pensamientos y objetivos iniciales
- **Memoria contextual**: Lista para almacenar experiencias

---

## 🧪 Probar el Sistema

### 1. Verificar en la Aplicación
- **Botón 🧠** en la esquina superior izquierda
- **Mundo Interior** debe mostrar datos del compañero
- **4 secciones**: Estado, Emociones, Pensamientos, Enfoque

### 2. Probar Conversación
- **Habla con el sistema** de voz
- **Las respuestas** deben ser más empáticas y personalizadas
- **El mundo interior** se actualiza en tiempo real

### 3. Verificar Memoria
- **Cada conversación** se guarda con contexto emocional
- **El compañero** recuerda interacciones anteriores
- **La personalidad** evoluciona con el tiempo

---

## 🔧 Solución de Problemas

### Error: "Unexpected token '<'"
- ✅ **Solucionado** - Las rutas ahora manejan errores correctamente
- El sistema funciona en modo fallback si hay problemas

### Error: "Database not configured"
1. **Verifica variables** de entorno en `backend/.env`:
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_clave_anonima
   ```
2. **Ejecuta configuración** manual en Supabase SQL Editor
3. **Reinicia el servidor** backend

### Error: "Routes not available"
1. **Verifica** que el servidor backend esté corriendo
2. **Comprueba** que las rutas estén registradas: `/api/debug/routes`
3. **Reinicia** el servidor si es necesario

### Compañero no aparece
1. **Verifica** el estado: `/api/companion/status`
2. **Ejecuta** configuración: `/api/companion/setup` (POST)
3. **Crea** compañero: `/api/companion/demo_user/create` (POST)

---

## 🎊 ¡Sistema Listo!

Una vez configurado, tendrás:

- 🎭 **Personalidad única** para cada usuario
- 🧠 **Memoria contextual** que recuerda emociones
- 💫 **Mundo Interior** visualizable en tiempo real
- 🎯 **Respuestas empáticas** adaptadas al estado emocional
- 📈 **Evolución continua** de la personalidad

**¡El primer Compañero Cognitivo del mundo está listo para usar!** 🚀✨
