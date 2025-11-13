import { motion, AnimatePresence } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useState, useEffect } from 'react';
import { Heart, Battery, Brain, MessageCircle, Sparkles, Moon, Sun } from 'lucide-react';

export default function LivingBotFace() {
  const { state, isSpeaking } = useBotStore();
  const { 
    vitalStats, 
    currentMood, 
    currentNeeds, 
    simulateTimePass, 
    updateMoodFromStats,
    receiveAttention,
    expressNeed 
  } = useAvatarLifeStore();
  
  const [breathe, setBreathe] = useState(0);
  const [lookDirection, setLookDirection] = useState({ x: 0, y: 0 });
  const [showNeedBubble, setShowNeedBubble] = useState(false);
  const [needMessage, setNeedMessage] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);

  // Simulación del paso del tiempo y actualización de estado
  useEffect(() => {
    const lifeInterval = setInterval(() => {
      simulateTimePass();
      updateMoodFromStats();
      
      // Mostrar necesidades ocasionalmente
      if (Math.random() < 0.3 && (currentNeeds.attention > 60 || currentNeeds.conversation > 70)) {
        setNeedMessage(expressNeed());
        setShowNeedBubble(true);
        setTimeout(() => setShowNeedBubble(false), 8000);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(lifeInterval);
  }, []);

  // Efecto de respiración que varía según el estado emocional
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathe(prev => (prev + 1) % 100);
    }, currentMood.primary === 'excited' ? 30 : currentMood.primary === 'sleepy' ? 80 : 50);

    return () => clearInterval(breatheInterval);
  }, [currentMood.primary]);

  // Parpadeo inteligente basado en emociones
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, currentMood.primary === 'sleepy' ? 2000 : currentMood.primary === 'excited' ? 4000 : 3000);

    return () => clearInterval(blinkInterval);
  }, [currentMood.primary]);

  // Movimientos de mirada basados en personalidad
  useEffect(() => {
    if (state === 'idle') {
      const lookInterval = setInterval(() => {
        const intensity = currentMood.primary === 'curious' ? 6 : currentMood.primary === 'sleepy' ? 2 : 4;
        const randomX = (Math.random() - 0.5) * intensity;
        const randomY = (Math.random() - 0.5) * (intensity / 2);
        setLookDirection({ x: randomX, y: randomY });
        
        setTimeout(() => {
          setLookDirection({ x: 0, y: 0 });
        }, 1500);
      }, currentMood.primary === 'lonely' ? 3000 : 6000);

      return () => clearInterval(lookInterval);
    }
  }, [state, currentMood.primary]);

  // Interacción cuando el usuario hace clic
  const handleInteraction = () => {
    receiveAttention('click');
    setShowNeedBubble(false);
  };

  // Respiración dinámica basada en emociones
  const getBreathingIntensity = () => {
    switch (currentMood.primary) {
      case 'excited': return 0.04;
      case 'sleepy': return 0.015;
      case 'sad': return 0.02;
      case 'happy': return 0.035;
      default: return 0.025;
    }
  };

  const breatheScale = 1 + Math.sin(breathe * 0.1) * getBreathingIntensity();

  // Expresiones emocionales avanzadas
  const getEmotionalExpression = () => {
    const baseExpressions = {
      happy: {
        leftEye: { scaleY: isBlinking ? 0.1 : 0.4, y: 3, x: 0 },
        rightEye: { scaleY: isBlinking ? 0.1 : 0.4, y: 3, x: 0 },
        mouth: { d: 'M 30 40 Q 50 58 70 40', fill: '#1e293b' },
        color: '#22c55e',
        glow: 'rgba(34, 197, 94, 0.3)',
        cheeks: true
      },
      excited: {
        leftEye: { scaleY: isBlinking ? 0.1 : 1.5, y: -4, x: 0 },
        rightEye: { scaleY: isBlinking ? 0.1 : 1.5, y: -4, x: 0 },
        mouth: { d: 'M 28 38 Q 50 60 72 38', fill: '#1e293b' },
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        sparkles: true
      },
      sad: {
        leftEye: { scaleY: isBlinking ? 0.1 : 0.8, y: 2, x: -1 },
        rightEye: { scaleY: isBlinking ? 0.1 : 0.8, y: 2, x: 1 },
        mouth: { d: 'M 30 50 Q 50 45 70 50', fill: 'none' },
        color: '#6366f1',
        glow: 'rgba(99, 102, 241, 0.2)',
        tears: true
      },
      lonely: {
        leftEye: { scaleY: isBlinking ? 0.1 : 1, y: 1, x: -2 },
        rightEye: { scaleY: isBlinking ? 0.1 : 1, y: 1, x: 2 },
        mouth: { d: 'M 30 47 Q 50 45 70 47', fill: 'none' },
        color: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.2)',
        heartbeat: true
      },
      sleepy: {
        leftEye: { scaleY: isBlinking ? 0.1 : 0.3, y: 4, x: 0 },
        rightEye: { scaleY: isBlinking ? 0.1 : 0.3, y: 4, x: 0 },
        mouth: { d: 'M 30 46 Q 50 48 70 46', fill: 'none' },
        color: '#64748b',
        glow: 'rgba(100, 116, 139, 0.2)',
        sleepBubbles: true
      },
      curious: {
        leftEye: { scaleY: isBlinking ? 0.1 : 1.2, y: -2, x: -1 },
        rightEye: { scaleY: isBlinking ? 0.1 : 1.2, y: -2, x: 1 },
        mouth: { d: 'M 30 45 Q 50 48 70 45', fill: 'none' },
        color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.3)',
        questionMarks: true
      },
      content: {
        leftEye: { scaleY: isBlinking ? 0.1 : 1, y: 0, x: 0 },
        rightEye: { scaleY: isBlinking ? 0.1 : 1, y: 0, x: 0 },
        mouth: { d: 'M 30 45 Q 50 50 70 45', fill: 'none' },
        color: '#4ade80',
        glow: 'rgba(74, 222, 128, 0.2)'
      }
    };

    return baseExpressions[currentMood.primary] || baseExpressions.content;
  };

  const expression = getEmotionalExpression();

  // Animación de boca al hablar
  const mouthTalkAnimation = isSpeaking ? {
    d: [
      'M 30 42 Q 50 55 70 42',
      'M 30 45 Q 50 50 70 45',
      'M 30 42 Q 50 55 70 42'
    ],
    transition: {
      duration: 0.3,
      repeat: Infinity
    }
  } : {
    d: expression.mouth.d
  };

  return (
    <div className="relative">
      {/* Burbuja de necesidades */}
      <AnimatePresence>
        {showNeedBubble && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20 z-10 max-w-xs"
          >
            <p className="text-sm text-gray-800 text-center">{needMessage}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white/20"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cuerpo del bot con vida */}
      <motion.div
        className="relative w-64 h-64 rounded-3xl overflow-hidden cursor-pointer"
        style={{ 
          backgroundColor: expression.color,
          boxShadow: `0 0 40px ${expression.glow}`
        }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : breatheScale,
          rotate: currentMood.primary === 'sleepy' ? [0, -1, 1, 0] : 0
        }}
        transition={{
          scale: { duration: isSpeaking ? 0.5 : 3, repeat: isSpeaking ? Infinity : 0 },
          rotate: { duration: 4, repeat: currentMood.primary === 'sleepy' ? Infinity : 0 }
        }}
        onClick={handleInteraction}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Brillo dinámico */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
          animate={{
            opacity: currentMood.primary === 'excited' ? [0.3, 0.5, 0.3] : 0.2
          }}
          transition={{
            duration: 2,
            repeat: currentMood.primary === 'excited' ? Infinity : 0
          }}
        />

        {/* Pantalla/Cara emocional */}
        <div className="absolute inset-8 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 10px ${expression.glow})` }}
          >
            {/* Mejillas sonrojadas */}
            {expression.cheeks && (
              <>
                <motion.ellipse
                  cx="20"
                  cy="45"
                  rx="6"
                  ry="4"
                  fill="#ff6b9d"
                  opacity="0.6"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.ellipse
                  cx="80"
                  cy="45"
                  rx="6"
                  ry="4"
                  fill="#ff6b9d"
                  opacity="0.6"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}

            {/* Ojo izquierdo */}
            <motion.ellipse
              cx="30"
              cy="35"
              rx="8"
              ry="10"
              fill="#fbbf24"
              animate={{
                ...expression.leftEye,
                x: (expression.leftEye.x || 0) + lookDirection.x,
                y: (expression.leftEye.y || 0) + lookDirection.y
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Ojo derecho */}
            <motion.ellipse
              cx="70"
              cy="35"
              rx="8"
              ry="10"
              fill="#fbbf24"
              animate={{
                ...expression.rightEye,
                x: (expression.rightEye.x || 0) + lookDirection.x,
                y: (expression.rightEye.y || 0) + lookDirection.y
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Lágrimas */}
            {expression.tears && (
              <>
                <motion.ellipse
                  cx="26"
                  cy="45"
                  rx="2"
                  ry="6"
                  fill="#60a5fa"
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, 10, 20]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.ellipse
                  cx="74"
                  cy="45"
                  rx="2"
                  ry="6"
                  fill="#60a5fa"
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, 10, 20]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
              </>
            )}

            {/* Boca emocional */}
            <motion.path
              d={expression.mouth.d}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              fill={expression.mouth.fill}
              animate={mouthTalkAnimation}
            />

            {/* Efectos especiales por emoción */}
            {expression.sparkles && (
              <>
                <motion.circle
                  cx="15"
                  cy="20"
                  r="2"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.circle
                  cx="85"
                  cy="25"
                  r="1.5"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
              </>
            )}

            {expression.sleepBubbles && (
              <>
                <motion.circle
                  cx="85"
                  cy="20"
                  r="3"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 1.5],
                    y: [0, -10, -20]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.circle
                  cx="90"
                  cy="15"
                  r="2"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 1.5],
                    y: [0, -10, -20]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 1
                  }}
                />
              </>
            )}
          </svg>
        </div>

        {/* Corazón latiendo para soledad */}
        {expression.heartbeat && (
          <motion.div
            className="absolute top-4 right-4"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            <Heart size={16} className="text-red-400 fill-current" />
          </motion.div>
        )}
      </motion.div>

      {/* Panel de estadísticas vitales */}
      <motion.div
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-2xl p-4 min-w-80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Battery size={14} className="text-green-400" />
            <div className="flex-1">
              <div className="flex justify-between text-white/80">
                <span>Energía</span>
                <span>{Math.round(vitalStats.energy)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${vitalStats.energy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" />
            <div className="flex-1">
              <div className="flex justify-between text-white/80">
                <span>Felicidad</span>
                <span>{Math.round(vitalStats.happiness)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-red-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${vitalStats.happiness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-blue-400" />
            <div className="flex-1">
              <div className="flex justify-between text-white/80">
                <span>Soledad</span>
                <span>{Math.round(vitalStats.loneliness)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${vitalStats.loneliness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Brain size={14} className="text-purple-400" />
            <div className="flex-1">
              <div className="flex justify-between text-white/80">
                <span>Curiosidad</span>
                <span>{Math.round(vitalStats.curiosity)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-purple-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${vitalStats.curiosity}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estado emocional actual */}
        <div className="mt-3 text-center">
          <div className="text-white/90 text-sm font-medium">
            {currentMood.reason}
          </div>
          <div className="text-white/60 text-xs mt-1">
            Estado: {currentMood.primary} • Intensidad: {Math.round(currentMood.intensity * 100)}%
          </div>
        </div>
      </motion.div>
    </div>
  );
}
