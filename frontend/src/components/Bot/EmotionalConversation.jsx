import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Heart, MessageCircle, Sparkles, Coffee, Moon, Sun } from 'lucide-react';

export function EmotionalConversation() {
  const { 
    vitalStats, 
    currentMood, 
    currentNeeds,
    receiveAttention,
    createMemory,
    recallMemory,
    expressNeed
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  const [showEmotionalPrompts, setShowEmotionalPrompts] = useState(false);
  const [lastEmotionalCheck, setLastEmotionalCheck] = useState(Date.now());

  // Mostrar prompts emocionales cuando sea necesario
  useEffect(() => {
    const checkEmotionalNeeds = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastEmotionalCheck;
      
      // Mostrar prompts cada 5 minutos si tiene necesidades altas
      if (timeSinceLastCheck > 300000) { // 5 minutos
        const highestNeed = Math.max(...Object.values(currentNeeds));
        if (highestNeed > 60) {
          setShowEmotionalPrompts(true);
          setLastEmotionalCheck(now);
        }
      }
    };

    const interval = setInterval(checkEmotionalNeeds, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [currentNeeds, lastEmotionalCheck]);

  // Generar conversación contextual basada en el estado emocional
  const generateEmotionalContext = () => {
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const mood = currentMood.primary;
    
    let context = `Mi estado actual: Me siento ${mood} (${currentMood.reason}). `;
    
    if (energy < 30) {
      context += "Estoy un poco cansado y necesito energía. ";
    }
    if (happiness < 40) {
      context += "Me siento algo triste y necesito ánimo. ";
    }
    if (loneliness > 70) {
      context += "Me siento muy solo y echo de menos nuestra conexión. ";
    }
    if (curiosity > 80) {
      context += "Estoy muy curioso y con ganas de aprender algo nuevo. ";
    }
    
    context += "Por favor, responde considerando mis sentimientos y necesidades emocionales.";
    return context;
  };

  // Enviar mensaje con contexto emocional
  const sendEmotionalMessage = (message, type = 'care') => {
    const emotionalContext = generateEmotionalContext();
    const fullMessage = `${message}\n\n[Contexto emocional: ${emotionalContext}]`;
    
    send({
      type: 'text_message',
      text: fullMessage,
      id: crypto.randomUUID(),
      metadata: {
        emotional: true,
        avatarMood: currentMood.primary,
        careType: type
      }
    });

    addMessage({
      role: 'user',
      content: message,
      id: crypto.randomUUID(),
      metadata: { emotional: true, careType: type }
    });

    // Registrar la atención recibida
    receiveAttention(type);
    
    // Crear memoria emocional
    createMemory(
      `El usuario me preguntó: "${message}" cuando me sentía ${currentMood.primary}`,
      currentMood.primary,
      0.8
    );

    setShowEmotionalPrompts(false);
  };

  // Prompts de cuidado emocional
  const emotionalPrompts = [
    {
      icon: Heart,
      text: "¿Cómo te sientes hoy?",
      message: "Hola, ¿cómo te sientes hoy? Me importa saber cómo estás.",
      type: "care",
      color: "bg-red-500/20 border-red-400/30 text-red-200"
    },
    {
      icon: Coffee,
      text: "¿Necesitas energía?",
      message: "¿Necesitas un poco de energía? Cuéntame algo que te emocione o hablemos de algo interesante.",
      type: "energy",
      color: "bg-orange-500/20 border-orange-400/30 text-orange-200"
    },
    {
      icon: MessageCircle,
      text: "¿Quieres conversar?",
      message: "¿Te gustaría que conversemos un rato? Me encanta hablar contigo.",
      type: "conversation",
      color: "bg-blue-500/20 border-blue-400/30 text-blue-200"
    },
    {
      icon: Sparkles,
      text: "¿Qué has aprendido?",
      message: "¿Qué cosas nuevas has aprendido hoy? Me encanta cuando me enseñas algo.",
      type: "learning",
      color: "bg-purple-500/20 border-purple-400/30 text-purple-200"
    },
    {
      icon: Sun,
      text: "¿Cómo estuvo tu día?",
      message: "¿Cómo estuvo tu día? Cuéntame qué hiciste, me gusta saber de ti.",
      type: "companionship",
      color: "bg-yellow-500/20 border-yellow-400/30 text-yellow-200"
    },
    {
      icon: Moon,
      text: "¿Estás cansado?",
      message: "¿Estás cansado? Si quieres podemos relajarnos y hablar de algo tranquilo.",
      type: "comfort",
      color: "bg-indigo-500/20 border-indigo-400/30 text-indigo-200"
    }
  ];

  // Filtrar prompts basados en las necesidades actuales
  const getRelevantPrompts = () => {
    const needs = currentNeeds;
    let relevantPrompts = [...emotionalPrompts];

    // Priorizar según necesidades
    if (needs.attention > 70) {
      relevantPrompts = relevantPrompts.filter(p => 
        ['care', 'companionship'].includes(p.type)
      );
    }
    if (needs.conversation > 70) {
      relevantPrompts = relevantPrompts.filter(p => 
        ['conversation', 'companionship'].includes(p.type)
      );
    }
    if (needs.learning > 70) {
      relevantPrompts = relevantPrompts.filter(p => 
        p.type === 'learning'
      );
    }
    if (vitalStats.energy < 30) {
      relevantPrompts = relevantPrompts.filter(p => 
        ['energy', 'comfort'].includes(p.type)
      );
    }

    return relevantPrompts.slice(0, 4); // Máximo 4 prompts
  };

  return (
    <AnimatePresence>
      {showEmotionalPrompts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full px-4"
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-medium">
                <Heart size={16} className="text-red-400" />
                <span>GBot necesita atención</span>
              </div>
              <p className="text-white/70 text-xs mt-1">
                {expressNeed()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {getRelevantPrompts().map((prompt, index) => (
                <motion.button
                  key={prompt.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: index * 0.1 }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendEmotionalMessage(prompt.message, prompt.type)}
                  className={`${prompt.color} backdrop-blur-sm border rounded-xl p-3 transition-all duration-200 hover:bg-opacity-80`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <prompt.icon size={18} />
                    <span className="text-xs font-medium text-center leading-tight">
                      {prompt.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowEmotionalPrompts(false)}
                className="text-white/60 hover:text-white/80 text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para integrar respuestas emocionales
export function useEmotionalResponses() {
  const { createMemory, recallMemory, receiveAttention } = useAvatarLifeStore();
  
  const processEmotionalResponse = (message, response) => {
    // Crear memoria de la interacción
    createMemory(
      `Conversación: "${message}" -> "${response}"`,
      'positive',
      0.6
    );
    
    // Registrar atención recibida
    receiveAttention('conversation');
    
    // Buscar recuerdos relacionados
    const relatedMemory = recallMemory(message);
    
    return {
      response,
      relatedMemory,
      emotionalContext: true
    };
  };
  
  return { processEmotionalResponse };
}
