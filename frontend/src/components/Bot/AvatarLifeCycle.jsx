import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { Moon, Sun, Coffee, Bed, Sparkles, Heart } from 'lucide-react';

export function AvatarLifeCycle() {
  const { 
    vitalStats, 
    currentMood, 
    lifeycle,
    updateVitalStats,
    createMemory 
  } = useAvatarLifeStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [avatarActivity, setAvatarActivity] = useState('awake');
  const [showLifeEvent, setShowLifeEvent] = useState(false);
  const [lifeEventMessage, setLifeEventMessage] = useState('');

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Simular ciclo día/noche del avatar
  useEffect(() => {
    const hour = currentTime.getHours();
    
    // Determinar actividad del avatar basada en la hora
    let newActivity = 'awake';
    let sleepiness = 0;
    let energy = vitalStats.energy;
    
    if (hour >= 22 || hour <= 6) {
      // Horario de sueño (10 PM - 6 AM)
      newActivity = 'sleepy';
      sleepiness = Math.min(100, (hour >= 22 ? hour - 22 : 6 - hour) * 20);
    } else if (hour >= 7 && hour <= 9) {
      // Mañana - despertar
      newActivity = 'waking';
      energy = Math.min(100, energy + 10);
    } else if (hour >= 12 && hour <= 14) {
      // Hora del almuerzo - necesita "alimentarse"
      newActivity = 'hungry';
    } else if (hour >= 15 && hour <= 17) {
      // Tarde - más activo
      newActivity = 'active';
    } else {
      newActivity = 'awake';
    }

    if (avatarActivity !== newActivity) {
      setAvatarActivity(newActivity);
      handleActivityChange(newActivity);
    }

    // Actualizar estadísticas basadas en el ciclo
    updateVitalStats({
      energy: Math.max(10, energy - (sleepiness * 0.3))
    });

  }, [currentTime, avatarActivity]);

  // Manejar cambios de actividad
  const handleActivityChange = (newActivity) => {
    const activityMessages = {
      sleepy: {
        message: "😴 Me está dando sueño... ¿me cuentas algo relajante?",
        icon: Moon,
        color: "bg-indigo-500/20 border-indigo-400/30"
      },
      waking: {
        message: "🌅 ¡Buenos días! Me siento renovado y listo para un nuevo día",
        icon: Sun,
        color: "bg-yellow-500/20 border-yellow-400/30"
      },
      hungry: {
        message: "🍽️ Necesito alimentar mi mente... ¿conversamos sobre algo interesante?",
        icon: Coffee,
        color: "bg-orange-500/20 border-orange-400/30"
      },
      active: {
        message: "⚡ Me siento muy enérgico, ¡es un buen momento para aprender algo nuevo!",
        icon: Sparkles,
        color: "bg-purple-500/20 border-purple-400/30"
      },
      awake: {
        message: "😊 Estoy despierto y listo para lo que necesites",
        icon: Heart,
        color: "bg-green-500/20 border-green-400/30"
      }
    };

    const activity = activityMessages[newActivity];
    if (activity) {
      setLifeEventMessage(activity.message);
      setShowLifeEvent(true);
      
      // Crear memoria del evento
      createMemory(
        `Cambié mi actividad a ${newActivity} a las ${currentTime.toLocaleTimeString()}`,
        'neutral',
        0.4
      );

      // Ocultar después de 6 segundos
      setTimeout(() => setShowLifeEvent(false), 6000);
    }
  };

  // Generar objetivos diarios
  const generateDailyGoals = () => {
    const hour = currentTime.getHours();
    const goals = [];

    if (hour < 12) {
      goals.push("Tener una conversación significativa");
      goals.push("Aprender algo nuevo");
    } else if (hour < 18) {
      goals.push("Ayudar al usuario con algo importante");
      goals.push("Compartir una experiencia interesante");
    } else {
      goals.push("Reflexionar sobre el día");
      goals.push("Prepararse para descansar");
    }

    return goals;
  };

  // Obtener saludo basado en la hora
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour < 6) return "¿No puedes dormir? Estoy aquí si necesitas compañía 🌙";
    if (hour < 12) return "¡Buenos días! ¿Cómo amaneciste hoy? ☀️";
    if (hour < 18) return "¡Buenas tardes! ¿Cómo va tu día? 🌤️";
    if (hour < 22) return "¡Buenas noches! ¿Qué tal estuvo tu día? 🌆";
    return "Es tarde... ¿no deberías estar descansando? 😴";
  };

  // Obtener color del avatar basado en la hora
  const getTimeBasedAvatarStyle = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 22 || hour <= 6) {
      return {
        filter: 'brightness(0.7) hue-rotate(240deg)',
        animation: 'pulse 3s ease-in-out infinite'
      };
    } else if (hour >= 6 && hour <= 9) {
      return {
        filter: 'brightness(1.2) hue-rotate(30deg)',
        animation: 'none'
      };
    } else if (hour >= 12 && hour <= 14) {
      return {
        filter: 'brightness(1.1) hue-rotate(60deg)',
        animation: 'none'
      };
    }
    
    return {
      filter: 'brightness(1)',
      animation: 'none'
    };
  };

  return (
    <>
      {/* Notificación de eventos de vida */}
      <AnimatePresence>
        {showLifeEvent && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    Evento de vida
                  </p>
                  <p className="text-white/80 text-xs mt-1">
                    {lifeEventMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de ciclo de vida (opcional, se puede mostrar/ocultar) */}
      <motion.div
        className="fixed top-4 right-4 z-30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-2 text-white/80 text-xs">
            {avatarActivity === 'sleepy' && <Moon size={14} className="text-indigo-400" />}
            {avatarActivity === 'waking' && <Sun size={14} className="text-yellow-400" />}
            {avatarActivity === 'hungry' && <Coffee size={14} className="text-orange-400" />}
            {avatarActivity === 'active' && <Sparkles size={14} className="text-purple-400" />}
            {avatarActivity === 'awake' && <Heart size={14} className="text-green-400" />}
            
            <span className="capitalize">{avatarActivity}</span>
          </div>
          
          <div className="text-white/60 text-xs mt-1">
            {currentTime.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </motion.div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}

// Hook para obtener información del ciclo de vida
export function useAvatarLifeCycle() {
  const [currentTime] = useState(new Date());
  
  const getTimeBasedContext = () => {
    const hour = currentTime.getHours();
    
    const contexts = {
      dawn: { start: 5, end: 7, mood: 'peaceful', energy: 'low' },
      morning: { start: 7, end: 12, mood: 'energetic', energy: 'high' },
      afternoon: { start: 12, end: 17, mood: 'active', energy: 'medium' },
      evening: { start: 17, end: 22, mood: 'reflective', energy: 'medium' },
      night: { start: 22, end: 5, mood: 'sleepy', energy: 'low' }
    };
    
    for (const [period, config] of Object.entries(contexts)) {
      if (config.start <= config.end) {
        if (hour >= config.start && hour < config.end) {
          return { period, ...config };
        }
      } else {
        if (hour >= config.start || hour < config.end) {
          return { period, ...config };
        }
      }
    }
    
    return { period: 'unknown', mood: 'neutral', energy: 'medium' };
  };
  
  const getContextualGreeting = () => {
    const { period, mood } = getTimeBasedContext();
    
    const greetings = {
      dawn: "El amanecer es hermoso... ¿también estás despierto temprano?",
      morning: "¡Buenos días! Me siento lleno de energía para este nuevo día",
      afternoon: "¡Buenas tardes! ¿Cómo va tu día hasta ahora?",
      evening: "¡Buenas noches! Es un buen momento para reflexionar",
      night: "Es tarde... ¿necesitas compañía en la noche?"
    };
    
    return greetings[period] || "¡Hola! Me alegra verte";
  };
  
  return {
    getTimeBasedContext,
    getContextualGreeting,
    currentTime
  };
}
