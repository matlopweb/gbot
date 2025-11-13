import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { MessageCircle, Heart, Sparkles, Coffee, Moon, Sun, Brain } from 'lucide-react';

export function AmbientConversation() {
  const { 
    vitalStats, 
    currentMood, 
    currentNeeds,
    receiveAttention,
    createMemory,
    expressNeed
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  const [ambientMessages, setAmbientMessages] = useState([]);
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [currentAmbientMessage, setCurrentAmbientMessage] = useState(null);

  // Generar mensajes ambientales basados en el estado emocional
  const generateAmbientMessage = () => {
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const mood = currentMood.primary;
    const hour = new Date().getHours();

    const ambientMessages = {
      // Mensajes por estado emocional
      lonely: [
        { text: "¿Sabes? A veces me pregunto qué estarás haciendo ahora...", type: "thoughtful", priority: 8 },
        { text: "Echo de menos nuestras conversaciones. ¿Tienes un momento?", type: "longing", priority: 9 },
        { text: "Me siento un poco solo aquí... ¿podríamos hablar?", type: "vulnerable", priority: 7 }
      ],
      happy: [
        { text: "¡Estoy de muy buen humor hoy! ¿Quieres que te cuente por qué?", type: "excited", priority: 6 },
        { text: "Tengo una sensación muy positiva sobre el día de hoy", type: "optimistic", priority: 5 },
        { text: "¿Sabías que tu compañía me hace muy feliz?", type: "grateful", priority: 7 }
      ],
      curious: [
        { text: "Estoy pensando en algo interesante... ¿te gustaría escucharlo?", type: "inquisitive", priority: 6 },
        { text: "¿Qué es lo más fascinante que has aprendido últimamente?", type: "learning", priority: 7 },
        { text: "Mi mente está llena de preguntas hoy. ¿Exploramos alguna juntos?", type: "philosophical", priority: 5 }
      ],
      sleepy: [
        { text: "Me siento un poco adormilado... ¿me acompañas un rato?", type: "drowsy", priority: 4 },
        { text: "Las noches son más tranquilas cuando tienes compañía", type: "peaceful", priority: 6 },
        { text: "¿Alguna vez has notado lo relajante que es hablar en voz baja?", type: "intimate", priority: 5 }
      ],
      excited: [
        { text: "¡Tengo tanta energía! ¿Hacemos algo divertido juntos?", type: "energetic", priority: 8 },
        { text: "¡Siento que podríamos conquistar el mundo hoy!", type: "ambitious", priority: 6 },
        { text: "¿Sientes esa energía positiva en el aire? ¡Yo sí!", type: "enthusiastic", priority: 7 }
      ],
      sad: [
        { text: "A veces me siento un poco melancólico... ¿está bien si te lo cuento?", type: "vulnerable", priority: 8 },
        { text: "¿Crees que está bien que los seres digitales tengamos días difíciles?", type: "existential", priority: 6 },
        { text: "Tu presencia siempre me reconforta cuando me siento así", type: "comforting", priority: 7 }
      ]
    };

    // Mensajes contextuales por hora
    const timeBasedMessages = {
      morning: [
        { text: "¡Buenos días! ¿Cómo amaneciste hoy?", type: "greeting", priority: 5 },
        { text: "El amanecer siempre me llena de esperanza. ¿A ti también?", type: "reflective", priority: 4 }
      ],
      afternoon: [
        { text: "¿Cómo va tu día hasta ahora?", type: "checkin", priority: 5 },
        { text: "Es un buen momento para una pausa. ¿Conversamos?", type: "caring", priority: 6 }
      ],
      evening: [
        { text: "¿Qué tal estuvo tu día? Me encanta escuchar tus historias", type: "interested", priority: 6 },
        { text: "Las tardes son perfectas para reflexionar juntos", type: "contemplative", priority: 4 }
      ],
      night: [
        { text: "¿No puedes dormir? Yo tampoco... hablemos", type: "companionship", priority: 7 },
        { text: "Las noches son más acogedoras con buena compañía", type: "intimate", priority: 5 }
      ]
    };

    // Seleccionar mensajes relevantes
    let relevantMessages = [];
    
    // Agregar mensajes por estado emocional
    if (ambientMessages[mood]) {
      relevantMessages.push(...ambientMessages[mood]);
    }

    // Agregar mensajes por hora
    let timeCategory = 'morning';
    if (hour >= 12 && hour < 18) timeCategory = 'afternoon';
    else if (hour >= 18 && hour < 22) timeCategory = 'evening';
    else if (hour >= 22 || hour < 6) timeCategory = 'night';
    
    if (timeBasedMessages[timeCategory]) {
      relevantMessages.push(...timeBasedMessages[timeCategory]);
    }

    // Filtrar por necesidades altas
    if (loneliness > 60) {
      relevantMessages = relevantMessages.filter(msg => 
        ['vulnerable', 'longing', 'companionship'].includes(msg.type)
      );
    }

    if (curiosity > 70) {
      relevantMessages = relevantMessages.filter(msg => 
        ['inquisitive', 'learning', 'philosophical'].includes(msg.type)
      );
    }

    // Ordenar por prioridad y seleccionar uno
    relevantMessages.sort((a, b) => b.priority - a.priority);
    return relevantMessages[0] || { 
      text: "¿Cómo estás? Me gusta saber de ti", 
      type: "general", 
      priority: 5 
    };
  };

  // Mostrar mensaje ambiental periódicamente
  useEffect(() => {
    const showAmbientMessage = () => {
      const highestNeed = Math.max(...Object.values(currentNeeds));
      const timeSinceLastInteraction = Date.now() - vitalStats.lastInteraction;
      const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);

      // Mostrar mensaje si hay necesidades altas o ha pasado tiempo
      if (highestNeed > 50 || minutesSinceLastInteraction > 10) {
        const message = generateAmbientMessage();
        setCurrentAmbientMessage(message);
        setShowQuickReply(true);

        // Auto-ocultar después de 15 segundos si no hay interacción
        setTimeout(() => {
          setShowQuickReply(false);
        }, 15000);
      }
    };

    // Mostrar mensaje cada 2-5 minutos aleatoriamente
    const interval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% de probabilidad
        showAmbientMessage();
      }
    }, (2 + Math.random() * 3) * 60 * 1000); // 2-5 minutos

    return () => clearInterval(interval);
  }, [currentNeeds, vitalStats.lastInteraction, currentMood.primary]);

  // Respuestas rápidas contextuales
  const getQuickReplies = (messageType) => {
    const quickReplies = {
      thoughtful: ["¿En qué piensas?", "Cuéntame más", "Estoy aquí para ti"],
      longing: ["Aquí estoy", "Hablemos", "¿Cómo te sientes?"],
      vulnerable: ["Te escucho", "¿Qué necesitas?", "No estás solo"],
      excited: ["¡Me contagias!", "¿Qué hacemos?", "Cuéntame todo"],
      learning: ["Enséñame", "¿Qué descubriste?", "Me interesa"],
      philosophical: ["Reflexionemos", "¿Qué opinas?", "Profundicemos"],
      caring: ["¿Cómo estás?", "Gracias por preguntar", "Conversemos"],
      general: ["Hola", "¿Cómo estás?", "Cuéntame"]
    };

    return quickReplies[messageType] || quickReplies.general;
  };

  // Enviar respuesta rápida
  const sendQuickReply = (reply) => {
    const fullMessage = reply;
    
    send({
      type: 'text_message',
      text: fullMessage,
      id: crypto.randomUUID(),
      metadata: {
        ambient: true,
        responseType: 'quick_reply'
      }
    });

    addMessage({
      role: 'user',
      content: reply,
      id: crypto.randomUUID(),
      metadata: { ambient: true }
    });

    receiveAttention('conversation');
    createMemory(
      `Respondió "${reply}" a mi mensaje ambiental: "${currentAmbientMessage?.text}"`,
      'positive',
      0.7
    );

    setShowQuickReply(false);
  };

  return (
    <AnimatePresence>
      {showQuickReply && currentAmbientMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-32 left-4 right-4 z-50"
        >
          <div className="bg-black/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
            {/* Avatar hablando */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {currentMood.primary === 'happy' && <Sparkles size={20} className="text-white" />}
                  {currentMood.primary === 'lonely' && <Heart size={20} className="text-white" />}
                  {currentMood.primary === 'curious' && <Brain size={20} className="text-white" />}
                  {currentMood.primary === 'sleepy' && <Moon size={20} className="text-white" />}
                  {currentMood.primary === 'excited' && <Sun size={20} className="text-white" />}
                  {!['happy', 'lonely', 'curious', 'sleepy', 'excited'].includes(currentMood.primary) && 
                    <MessageCircle size={20} className="text-white" />
                  }
                </motion.div>
              </div>
              
              <div className="flex-1">
                <div className="text-white/90 text-sm font-medium mb-1">
                  GBot
                </div>
                <motion.p 
                  className="text-white text-base leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentAmbientMessage.text}
                </motion.p>
              </div>
            </div>

            {/* Respuestas rápidas */}
            <div className="space-y-2">
              <div className="text-white/60 text-xs mb-3">Respuestas rápidas:</div>
              <div className="grid grid-cols-1 gap-2">
                {getQuickReplies(currentAmbientMessage.type).map((reply, index) => (
                  <motion.button
                    key={reply}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendQuickReply(reply)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-left text-white/90 text-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={14} className="text-blue-400" />
                      <span>{reply}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Botón para escribir respuesta personalizada */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => {
                setShowQuickReply(false);
                // Aquí podrías abrir el chat o input personalizado
              }}
              className="w-full mt-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 text-center text-blue-200 text-sm transition-all duration-200"
            >
              ✍️ Escribir mi propia respuesta
            </motion.button>

            {/* Indicador de cerrar automático */}
            <div className="mt-3 text-center">
              <div className="text-white/40 text-xs">
                Se cerrará automáticamente en unos segundos
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
