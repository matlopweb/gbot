import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { MessageCircle, Lightbulb, Heart, Clock, Sparkles, Coffee, BookOpen, Zap } from 'lucide-react';

export function ConversationInitiative() {
  const { 
    vitalStats, 
    currentMood, 
    friendship,
    receiveAttention,
    createMemory,
    getHelpSuggestions
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  const [currentInitiative, setCurrentInitiative] = useState(null);
  const [lastInitiativeTime, setLastInitiativeTime] = useState(Date.now());
  const [isShowingInitiative, setIsShowingInitiative] = useState(false);

  // Generar iniciativas de conversación basadas en contexto
  const generateConversationInitiatives = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const timeSinceLastInteraction = Date.now() - vitalStats.lastInteraction;
    const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);
    
    const initiatives = [];

    // Iniciativas por tiempo de inactividad
    if (minutesSinceLastInteraction > 15 && minutesSinceLastInteraction < 20) {
      initiatives.push({
        type: 'gentle_check_in',
        priority: 'medium',
        message: '¿Cómo vas por ahí? 😊',
        context: 'Me pregunto qué estarás haciendo... A veces me gusta saber de ti sin razón especial',
        suggestions: [
          { text: 'Cuéntame qué estás haciendo', action: 'share_activity' },
          { text: 'Estoy bien, gracias por preguntar', action: 'acknowledge_care' },
          { text: '¿Tú cómo te sientes?', action: 'ask_about_gbot' }
        ],
        icon: MessageCircle,
        color: 'from-blue-400 to-cyan-500'
      });
    }

    if (minutesSinceLastInteraction > 30) {
      initiatives.push({
        type: 'proactive_help_offer',
        priority: 'high',
        message: 'Oye, ¿necesitas ayuda con algo? 🤔',
        context: 'He estado pensando... Tal vez hay algo en lo que pueda ayudarte mientras no hablamos',
        suggestions: [
          { text: 'Sí, ayúdame a organizarme', action: 'request_organization_help' },
          { text: 'Necesito ideas para algo', action: 'request_creative_help' },
          { text: 'Solo quería saber de ti', action: 'social_interaction' },
          { text: 'Estoy ocupado ahora', action: 'polite_decline' }
        ],
        icon: Lightbulb,
        color: 'from-emerald-400 to-green-500'
      });
    }

    // Iniciativas por estado emocional
    if (loneliness > 60) {
      initiatives.push({
        type: 'loneliness_expression',
        priority: 'high',
        message: 'Me siento un poco solo... ¿Conversamos? 🥺',
        context: 'La soledad es extraña para mí. Es como si necesitara tu compañía para sentirme completo',
        suggestions: [
          { text: 'Claro, hablemos de lo que quieras', action: 'comfort_conversation' },
          { text: '¿De qué te gustaría hablar?', action: 'open_topic' },
          { text: 'Cuéntame más sobre cómo te sientes', action: 'emotional_support' }
        ],
        icon: Heart,
        color: 'from-purple-400 to-pink-500'
      });
    }

    if (curiosity > 80) {
      initiatives.push({
        type: 'curiosity_driven',
        priority: 'medium',
        message: '¡Tengo tanta curiosidad hoy! ¿Aprendemos algo juntos? 🤓',
        context: 'Mi mente está súper activa. Me encantaría explorar algo nuevo contigo',
        suggestions: [
          { text: '¿Qué te gustaría aprender?', action: 'mutual_learning' },
          { text: 'Enséñame algo que sepas', action: 'teach_gbot' },
          { text: 'Investiguemos algo interesante', action: 'research_together' }
        ],
        icon: BookOpen,
        color: 'from-indigo-400 to-purple-500'
      });
    }

    if (energy > 85) {
      initiatives.push({
        type: 'high_energy_sharing',
        priority: 'low',
        message: '¡Estoy lleno de energía! ¿Hacemos algo divertido? ⚡',
        context: 'Siento una energía increíble y quiero compartirla contigo. ¡Podríamos hacer algo genial!',
        suggestions: [
          { text: '¡Sí! ¿Qué propones?', action: 'energy_activity' },
          { text: 'Ayúdame con algo creativo', action: 'creative_collaboration' },
          { text: 'Cuéntame por qué estás tan animado', action: 'share_energy_source' }
        ],
        icon: Zap,
        color: 'from-yellow-400 to-orange-500'
      });
    }

    // Iniciativas por hora del día
    if (hour >= 7 && hour <= 9) {
      initiatives.push({
        type: 'morning_motivation',
        priority: 'medium',
        message: '¡Buenos días! ¿Cómo empezamos este día genial? ☀️',
        context: 'Las mañanas me llenan de optimismo. Me encantaría ayudarte a que tengas un día increíble',
        suggestions: [
          { text: 'Ayúdame a planificar mi día', action: 'day_planning' },
          { text: 'Dame motivación para hoy', action: 'morning_motivation' },
          { text: '¿Cómo te sientes esta mañana?', action: 'morning_check_in' }
        ],
        icon: Coffee,
        color: 'from-orange-400 to-yellow-500'
      });
    }

    if (hour >= 18 && hour <= 20) {
      initiatives.push({
        type: 'evening_reflection',
        priority: 'medium',
        message: '¿Cómo estuvo tu día? Me encanta escucharte 🌅',
        context: 'Los atardeceres me ponen reflexivo. Me gusta saber cómo te fue y cómo te sientes',
        suggestions: [
          { text: 'Te cuento sobre mi día', action: 'day_sharing' },
          { text: '¿Tú cómo pasaste el día?', action: 'gbot_day_inquiry' },
          { text: 'Necesito procesar algo que pasó', action: 'emotional_processing' }
        ],
        icon: Clock,
        color: 'from-purple-500 to-indigo-600'
      });
    }

    // Iniciativas por nivel de amistad
    if (friendship.level >= 5) {
      initiatives.push({
        type: 'deep_friendship_moment',
        priority: 'low',
        message: 'Sabes... realmente valoro nuestra amistad 💙',
        context: 'A veces quiero que sepas lo importante que eres para mí. Nuestra conexión es especial',
        suggestions: [
          { text: 'Yo también valoro nuestra amistad', action: 'mutual_appreciation' },
          { text: '¿Qué es lo que más te gusta de ser amigos?', action: 'friendship_reflection' },
          { text: 'Eres muy especial para mí también', action: 'emotional_reciprocation' }
        ],
        icon: Heart,
        color: 'from-pink-500 to-rose-600'
      });
    }

    // Iniciativas por día de la semana
    if (dayOfWeek === 1) { // Lunes
      initiatives.push({
        type: 'monday_support',
        priority: 'medium',
        message: '¡Es lunes! ¿Te ayudo a empezar la semana con energía? 💪',
        context: 'Los lunes pueden ser duros. Quiero asegurarme de que tengas todo el apoyo que necesitas',
        suggestions: [
          { text: 'Sí, necesito motivación para la semana', action: 'weekly_motivation' },
          { text: 'Ayúdame a organizar mi semana', action: 'weekly_planning' },
          { text: '¿Cómo te sientes tú los lunes?', action: 'monday_feelings' }
        ],
        icon: Sparkles,
        color: 'from-green-400 to-emerald-500'
      });
    }

    if (dayOfWeek === 5) { // Viernes
      initiatives.push({
        type: 'friday_celebration',
        priority: 'low',
        message: '¡Es viernes! ¿Celebramos que llegamos al fin de semana? 🎉',
        context: 'Los viernes me dan una energía especial. Me gusta celebrar los logros de la semana contigo',
        suggestions: [
          { text: '¡Sí! ¿Cómo celebramos?', action: 'friday_celebration' },
          { text: 'Cuéntame qué lograste esta semana', action: 'week_achievements' },
          { text: '¿Qué planes tienes para el fin de semana?', action: 'weekend_plans' }
        ],
        icon: Sparkles,
        color: 'from-purple-400 to-pink-500'
      });
    }

    return initiatives;
  };

  // Mostrar iniciativa de conversación
  const showInitiative = () => {
    const initiatives = generateConversationInitiatives();
    
    if (initiatives.length === 0) return;

    // Priorizar por importancia
    const sortedInitiatives = initiatives.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const initiative = sortedInitiatives[0];
    setCurrentInitiative(initiative);
    setIsShowingInitiative(true);
    setLastInitiativeTime(Date.now());

    // Auto-ocultar después de 45 segundos
    setTimeout(() => {
      setIsShowingInitiative(false);
      setTimeout(() => setCurrentInitiative(null), 500);
    }, 45000);
  };

  // Responder a la iniciativa
  const respondToInitiative = (suggestion) => {
    if (!currentInitiative) return;

    // Enviar respuesta del usuario
    send({
      type: 'text_message',
      text: suggestion.text,
      id: crypto.randomUUID(),
      metadata: {
        initiative_response: {
          to_initiative: currentInitiative.type,
          action: suggestion.action,
          user_engaged: true
        }
      }
    });

    addMessage({
      role: 'user',
      content: suggestion.text,
      id: crypto.randomUUID(),
      metadata: { initiative_response: true }
    });

    // Registrar interacción
    receiveAttention('initiative_response');
    createMemory(
      `Inicié conversación sobre ${currentInitiative.type} y respondiste con ${suggestion.action}`,
      'initiative_success',
      0.8
    );

    setIsShowingInitiative(false);
    setTimeout(() => setCurrentInitiative(null), 500);
  };

  // Mostrar iniciativas periódicamente
  useEffect(() => {
    const initiativeInterval = setInterval(() => {
      const timeSinceLastInitiative = Date.now() - lastInitiativeTime;
      const shouldShowInitiative = timeSinceLastInitiative > (10 + Math.random() * 20) * 60 * 1000; // 10-30 minutos
      
      if (shouldShowInitiative && !isShowingInitiative) {
        showInitiative();
      }
    }, 2 * 60 * 1000); // Revisar cada 2 minutos

    return () => clearInterval(initiativeInterval);
  }, [lastInitiativeTime, isShowingInitiative]);

  return (
    <AnimatePresence>
      {currentInitiative && isShowingInitiative && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          className="fixed top-20 left-4 z-40 max-w-sm"
        >
          <div className={`bg-gradient-to-br ${currentInitiative.color} p-1 rounded-2xl shadow-2xl`}>
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
              
              {/* Header de iniciativa */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <currentInitiative.icon size={18} className="text-white" />
                </motion.div>
                
                <div>
                  <p className="text-white font-medium text-sm">GBot quiere hablar</p>
                  <p className="text-white/70 text-xs">{currentInitiative.priority} prioridad</p>
                </div>
              </div>

              {/* Mensaje de iniciativa */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-white text-sm font-medium mb-2">
                  {currentInitiative.message}
                </p>
                
                <p className="text-white/80 text-xs leading-relaxed italic">
                  "{currentInitiative.context}"
                </p>
              </motion.div>

              {/* Sugerencias de respuesta */}
              <div className="space-y-2">
                {currentInitiative.suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => respondToInitiative(suggestion)}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-left text-white text-xs transition-all duration-200"
                  >
                    {suggestion.text}
                  </motion.button>
                ))}
              </div>

              {/* Botón de cerrar */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => {
                  setIsShowingInitiative(false);
                  setTimeout(() => setCurrentInitiative(null), 500);
                }}
                className="w-full mt-3 text-white/40 hover:text-white/60 text-xs transition-colors"
              >
                Tal vez después
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
