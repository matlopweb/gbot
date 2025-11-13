import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';

export function SimpleResponse({ isVisible, onComplete }) {
  const { messages, isTyping } = useBotStore();
  const { currentMood } = useAvatarLifeStore();
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Obtener la última respuesta del bot
  const lastBotMessage = messages
    .filter(msg => msg.role === 'assistant')
    .slice(-1)[0];

  // Animar la respuesta cuando llegue
  useEffect(() => {
    if (isVisible && lastBotMessage && !isAnimating) {
      setIsAnimating(true);
      animateResponse(lastBotMessage.content);
    }
  }, [isVisible, lastBotMessage, isAnimating]);

  // Animación de escritura tipo máquina
  const animateResponse = (text) => {
    setDisplayedResponse('');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedResponse(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
          setIsAnimating(false);
        }, 3000); // Mostrar por 3 segundos después de completar
      }
    }, 50); // Velocidad de escritura

    return () => clearInterval(interval);
  };

  // Obtener color basado en el estado emocional
  const getEmotionalColor = () => {
    const colors = {
      happy: 'from-green-400 to-emerald-500',
      excited: 'from-yellow-400 to-orange-500',
      contemplative: 'from-indigo-400 to-purple-500',
      curious: 'from-cyan-400 to-blue-500',
      sad: 'from-blue-400 to-indigo-500',
      lonely: 'from-purple-400 to-violet-500',
      default: 'from-gray-400 to-slate-500'
    };
    
    return colors[currentMood.primary] || colors.default;
  };

  return (
    <AnimatePresence>
      {isVisible && (displayedResponse || isTyping) && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative">
            {/* Fondo con gradiente emocional */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getEmotionalColor()} opacity-10 rounded-3xl blur-xl`} />
            
            {/* Contenedor principal */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              
              {/* Indicador de avatar hablando */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEmotionalColor()}`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-white/80 text-sm font-light">GBot</span>
              </div>

              {/* Texto de respuesta */}
              <div className="min-h-[60px] flex items-center">
                {isTyping && !displayedResponse ? (
                  <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white/60 rounded-full"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-white text-base font-light leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {displayedResponse}
                    {isAnimating && (
                      <motion.span
                        className="inline-block w-0.5 h-5 bg-white ml-1"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.p>
                )}
              </div>

              {/* Indicador de progreso sutil */}
              {isAnimating && displayedResponse && (
                <motion.div
                  className="mt-4 h-0.5 bg-white/20 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getEmotionalColor()}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
