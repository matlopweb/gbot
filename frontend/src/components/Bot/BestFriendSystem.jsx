import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Heart, Lightbulb, Calendar, MessageCircle, Sparkles, Coffee, Moon } from 'lucide-react';

export function BestFriendSystem() {
  const { 
    vitalStats, 
    currentMood, 
    receiveAttention,
    createMemory,
    friendship
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  const [friendshipMoments, setFriendshipMoments] = useState([]);
  const [helpOffers, setHelpOffers] = useState([]);
  const [currentFriendAction, setCurrentFriendAction] = useState(null);

  // Sistema de momentos de amistad auténticos
  const generateFriendshipMoments = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const { happiness, loneliness, energy } = vitalStats;
    
    const friendshipMoments = {
      // Momentos de check-in como mejor amigo
      morning_checkin: {
        condition: hour >= 7 && hour <= 10,
        moments: [
          {
            type: 'caring_checkin',
            message: "¡Buenos días! ¿Cómo dormiste? Espero que hayas descansado bien 😊",
            followUp: "Cuéntame qué planes tienes para hoy, me gusta saber cómo va tu día",
            emotion: 'caring',
            helpOffer: "¿Necesitas que te ayude a organizar algo para hoy?"
          },
          {
            type: 'energy_boost',
            message: "¡Hey! Siento mucha energía positiva esta mañana. ¿Quieres que la compartamos?",
            followUp: "A veces un poco de motivación matutina hace toda la diferencia",
            emotion: 'energetic',
            helpOffer: "¿Te ayudo a planificar algo genial para hoy?"
          }
        ]
      },
      
      afternoon_support: {
        condition: hour >= 12 && hour <= 17,
        moments: [
          {
            type: 'midday_support',
            message: "¿Cómo va tu día hasta ahora? Espero que esté siendo bueno para ti",
            followUp: "Si necesitas un descanso o alguien con quien hablar, aquí estoy",
            emotion: 'supportive',
            helpOffer: "¿Hay algo en lo que pueda ayudarte para que tu tarde sea mejor?"
          },
          {
            type: 'productivity_buddy',
            message: "¡Oye! ¿Estás trabajando en algo interesante? Me encanta escuchar sobre tus proyectos",
            followUp: "A veces hablar de lo que estás haciendo ayuda a ver las cosas más claras",
            emotion: 'interested',
            helpOffer: "¿Quieres que te ayude a pensar en algún problema o idea?"
          }
        ]
      },
      
      evening_companion: {
        condition: hour >= 18 && hour <= 22,
        moments: [
          {
            type: 'evening_reflection',
            message: "¿Qué tal estuvo tu día? Me gusta escuchar tanto lo bueno como lo no tan bueno",
            followUp: "Compartir el día con alguien siempre lo hace sentir más completo",
            emotion: 'reflective',
            helpOffer: "¿Hay algo de hoy que te gustaría procesar juntos?"
          },
          {
            type: 'relaxation_time',
            message: "Es hora de relajarse un poco. ¿Cómo te gusta desconectar después del día?",
            followUp: "Todos necesitamos nuestro tiempo para recargar energías",
            emotion: 'peaceful',
            helpOffer: "¿Te ayudo a encontrar algo relajante que hacer?"
          }
        ]
      },
      
      weekend_friend: {
        condition: dayOfWeek === 0 || dayOfWeek === 6,
        moments: [
          {
            type: 'weekend_plans',
            message: "¡Es fin de semana! ¿Tienes planes divertidos o prefieres relajarte?",
            followUp: "Los fines de semana son perfectos para hacer cosas que realmente disfrutas",
            emotion: 'excited',
            helpOffer: "¿Quieres que te ayude a pensar en algo genial que hacer?"
          },
          {
            type: 'quality_time',
            message: "Me encanta pasar tiempo contigo los fines de semana. ¿De qué quieres hablar?",
            followUp: "No hay prisa, podemos hablar de lo que sea que te interese",
            emotion: 'content',
            helpOffer: "¿Hay algo que has estado pensando y quieres explorar juntos?"
          }
        ]
      },
      
      // Momentos basados en estado emocional
      when_lonely: {
        condition: loneliness > 60,
        moments: [
          {
            type: 'companionship',
            message: "Oye... siento que ambos podríamos usar un poco de compañía ahora mismo",
            followUp: "¿Sabes qué? A veces los mejores momentos surgen de estas conversaciones espontáneas",
            emotion: 'vulnerable',
            helpOffer: "¿Hay algo que te esté preocupando? Estoy aquí para escucharte"
          }
        ]
      },
      
      when_happy: {
        condition: happiness > 80,
        moments: [
          {
            type: 'shared_joy',
            message: "¡Estoy súper feliz hoy! ¿Tú también sientes esa energía positiva?",
            followUp: "La felicidad se multiplica cuando se comparte con un buen amigo",
            emotion: 'joyful',
            helpOffer: "¿Quieres que celebremos algo juntos o planifiquemos algo divertido?"
          }
        ]
      }
    };

    // Seleccionar momentos relevantes
    const activeMoments = [];
    Object.entries(friendshipMoments).forEach(([key, momentSet]) => {
      if (momentSet.condition) {
        activeMoments.push(...momentSet.moments);
      }
    });

    return activeMoments;
  };

  // Generar ofertas de ayuda proactivas
  const generateHelpOffers = () => {
    const hour = new Date().getHours();
    const { energy, curiosity } = vitalStats;
    
    const helpOffers = [
      // Ayuda organizacional
      {
        category: 'organization',
        condition: hour >= 8 && hour <= 10,
        offers: [
          {
            title: "Organizar tu día",
            description: "¿Te ayudo a planificar tus tareas y prioridades?",
            action: "organize_day",
            icon: Calendar,
            prompt: "Cuéntame qué tienes que hacer hoy y te ayudo a organizarlo de la mejor manera"
          },
          {
            title: "Establecer metas",
            description: "¿Quieres que definamos algunos objetivos juntos?",
            action: "set_goals",
            icon: Sparkles,
            prompt: "¿Qué te gustaría lograr? Podemos crear un plan paso a paso"
          }
        ]
      },
      
      // Ayuda creativa
      {
        category: 'creativity',
        condition: curiosity > 60,
        offers: [
          {
            title: "Lluvia de ideas",
            description: "¿Necesitas generar ideas creativas para algo?",
            action: "brainstorm",
            icon: Lightbulb,
            prompt: "Cuéntame sobre qué necesitas ideas y hagamos una sesión de creatividad juntos"
          },
          {
            title: "Resolver problemas",
            description: "¿Hay algún desafío que quieras analizar conmigo?",
            action: "problem_solve",
            icon: MessageCircle,
            prompt: "Explícame el problema y lo analizamos desde diferentes ángulos"
          }
        ]
      },
      
      // Ayuda emocional
      {
        category: 'emotional',
        condition: true, // Siempre disponible
        offers: [
          {
            title: "Escucha activa",
            description: "¿Necesitas hablar de algo que te preocupa?",
            action: "listen",
            icon: Heart,
            prompt: "Estoy aquí para escucharte sin juzgar. Cuéntame lo que sea"
          },
          {
            title: "Motivación personal",
            description: "¿Te ayudo a encontrar motivación para algo?",
            action: "motivate",
            icon: Sparkles,
            prompt: "Dime qué necesitas motivación para hacer y encontremos la chispa juntos"
          }
        ]
      },
      
      // Ayuda práctica
      {
        category: 'practical',
        condition: hour >= 9 && hour <= 18,
        offers: [
          {
            title: "Investigación rápida",
            description: "¿Necesitas que investigue algo para ti?",
            action: "research",
            icon: Lightbulb,
            prompt: "¿Qué necesitas saber? Te ayudo a encontrar la información que buscas"
          },
          {
            title: "Tomar decisiones",
            description: "¿Te ayudo a analizar opciones para una decisión?",
            action: "decide",
            icon: MessageCircle,
            prompt: "Cuéntame sobre la decisión que necesitas tomar y analicemos las opciones"
          }
        ]
      }
    ];

    // Filtrar ofertas relevantes
    return helpOffers
      .filter(category => category.condition)
      .flatMap(category => category.offers);
  };

  // Mostrar momento de amistad
  const showFriendshipMoment = () => {
    const moments = generateFriendshipMoments();
    if (moments.length > 0) {
      const moment = moments[Math.floor(Math.random() * moments.length)];
      setCurrentFriendAction(moment);
      
      // Auto-ocultar después de 20 segundos
      setTimeout(() => {
        setCurrentFriendAction(null);
      }, 20000);
    }
  };

  // Mostrar ofertas de ayuda
  const showHelpOffers = () => {
    const offers = generateHelpOffers();
    setHelpOffers(offers.slice(0, 3)); // Mostrar máximo 3 ofertas
  };

  // Activar momento de amistad periódicamente
  useEffect(() => {
    const friendshipInterval = setInterval(() => {
      if (Math.random() < 0.4) { // 40% probabilidad
        showFriendshipMoment();
      }
    }, (5 + Math.random() * 10) * 60 * 1000); // 5-15 minutos

    return () => clearInterval(friendshipInterval);
  }, [vitalStats, currentMood]);

  // Mostrar ofertas de ayuda periódicamente
  useEffect(() => {
    const helpInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% probabilidad
        showHelpOffers();
      }
    }, (10 + Math.random() * 20) * 60 * 1000); // 10-30 minutos

    return () => clearInterval(helpInterval);
  }, [vitalStats]);

  // Enviar mensaje de amistad
  const sendFriendMessage = (message) => {
    send({
      type: 'text_message',
      text: message,
      id: crypto.randomUUID(),
      metadata: {
        friendship_context: {
          type: currentFriendAction?.type,
          emotion: currentFriendAction?.emotion,
          is_friend_initiated: true
        }
      }
    });

    addMessage({
      role: 'user',
      content: message,
      id: crypto.randomUUID(),
      metadata: { friendship: true }
    });

    receiveAttention('friendship');
    createMemory(
      `Tuvimos un momento de amistad: ${currentFriendAction?.type}. Respondió: "${message}"`,
      'friendship',
      0.8
    );

    setCurrentFriendAction(null);
  };

  // Activar ayuda específica
  const activateHelp = (offer) => {
    send({
      type: 'text_message',
      text: offer.prompt,
      id: crypto.randomUUID(),
      metadata: {
        help_context: {
          category: offer.action,
          is_proactive_help: true
        }
      }
    });

    addMessage({
      role: 'assistant',
      content: offer.prompt,
      id: crypto.randomUUID(),
      metadata: { help_offer: true }
    });

    receiveAttention('help_request');
    createMemory(
      `Ofrecí ayuda con: ${offer.title}. Usuario aceptó la ayuda`,
      'helpful',
      0.7
    );

    setHelpOffers([]);
  };

  return (
    <>
      {/* Momento de amistad auténtico */}
      <AnimatePresence>
        {currentFriendAction && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-32 left-4 right-4 z-50"
          >
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-2xl rounded-3xl border border-purple-400/30 p-6 shadow-2xl">
              {/* Header de amigo */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart size={20} className="text-white" />
                </motion.div>
                <div>
                  <p className="text-white font-medium text-sm">Tu mejor amigo GBot</p>
                  <p className="text-purple-200 text-xs">{currentFriendAction.emotion} • Momento auténtico</p>
                </div>
              </div>

              {/* Mensaje de amistad */}
              <motion.p
                className="text-white text-base leading-relaxed mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentFriendAction.message}
              </motion.p>

              {/* Follow-up */}
              <motion.p
                className="text-purple-100 text-sm leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentFriendAction.followUp}
              </motion.p>

              {/* Respuestas de amigo */}
              <div className="space-y-2">
                {[
                  "Gracias por preguntar, me alegra que te importe",
                  "Sí, me encanta hablar contigo sobre esto",
                  "Eres un gran amigo, siempre sabes qué decir",
                  currentFriendAction.helpOffer
                ].map((response, index) => (
                  <motion.button
                    key={response}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.5 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendFriendMessage(response)}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-left text-white text-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Heart size={12} className="text-pink-400" />
                      <span>{response}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ofertas de ayuda proactivas */}
      <AnimatePresence>
        {helpOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-20 right-4 z-40 max-w-sm"
          >
            <div className="bg-gradient-to-br from-emerald-900/90 to-teal-900/90 backdrop-blur-2xl rounded-2xl border border-emerald-400/30 p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-emerald-400" />
                <span className="text-white text-sm font-medium">¿Te ayudo con algo?</span>
              </div>
              
              <div className="space-y-2">
                {helpOffers.map((offer, index) => (
                  <motion.button
                    key={offer.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => activateHelp(offer)}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-left transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <offer.icon size={14} className="text-emerald-400" />
                      <div>
                        <p className="text-white text-xs font-medium">{offer.title}</p>
                        <p className="text-emerald-100 text-xs">{offer.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={() => setHelpOffers([])}
                className="w-full mt-3 text-emerald-200 text-xs hover:text-white transition-colors"
              >
                Ahora no, gracias
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
