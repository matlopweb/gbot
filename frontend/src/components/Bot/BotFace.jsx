import { motion } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useState, useEffect } from 'react';

export default function BotFace() {
  const { state, isSpeaking } = useBotStore();
  const [breathe, setBreathe] = useState(0);
  const [lookDirection, setLookDirection] = useState({ x: 0, y: 0 });

  // Efecto de respiración sutil
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathe(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(breatheInterval);
  }, []);

  // Movimientos aleatorios de mirada cuando está idle
  useEffect(() => {
    if (state === 'idle') {
      const lookInterval = setInterval(() => {
        const randomX = (Math.random() - 0.5) * 4;
        const randomY = (Math.random() - 0.5) * 2;
        setLookDirection({ x: randomX, y: randomY });
        
        // Volver al centro después de un momento
        setTimeout(() => {
          setLookDirection({ x: 0, y: 0 });
        }, 1000);
      }, 5000 + Math.random() * 5000); // Entre 5-10 segundos

      return () => clearInterval(lookInterval);
    }
  }, [state]);

  const breatheScale = 1 + Math.sin(breathe * 0.1) * 0.02; // Respiración muy sutil

  // Expresiones según el estado
  const expressions = {
    idle: {
      leftEye: { scaleY: 1, y: 0, x: 0 },
      rightEye: { scaleY: 1, y: 0, x: 0 },
      mouth: { d: 'M 30 45 Q 50 50 70 45', fill: 'none' }, // Neutral
      color: '#4ade80',
      emoji: '😊'
    },
    listening: {
      leftEye: { scaleY: 1.3, y: -3, x: -1 },
      rightEye: { scaleY: 1.3, y: -3, x: 1 },
      mouth: { d: 'M 30 45 Q 50 48 70 45', fill: 'none' }, // Atento
      color: '#60a5fa',
      emoji: '👂'
    },
    thinking: {
      leftEye: { scaleY: 0.5, y: 3, x: -2 },
      rightEye: { scaleY: 0.5, y: 3, x: 2 },
      mouth: { d: 'M 30 48 Q 50 46 70 48', fill: 'none' }, // Pensativo
      color: '#a78bfa',
      emoji: '🤔'
    },
    speaking: {
      leftEye: { scaleY: 1.1, y: -1, x: 0 },
      rightEye: { scaleY: 1.1, y: -1, x: 0 },
      mouth: { d: 'M 30 42 Q 50 55 70 42', fill: '#1e293b' }, // Sonrisa abierta
      color: '#4ade80',
      emoji: '💬'
    },
    working: {
      leftEye: { scaleY: 0.7, y: 2, x: 0 },
      rightEye: { scaleY: 0.7, y: 2, x: 0 },
      mouth: { d: 'M 30 45 L 70 45', fill: 'none' }, // Concentrado
      color: '#fb923c',
      emoji: '⚙️'
    },
    happy: {
      leftEye: { scaleY: 0.4, y: 3, x: 0 },
      rightEye: { scaleY: 0.4, y: 3, x: 0 },
      mouth: { d: 'M 30 40 Q 50 58 70 40', fill: '#1e293b' }, // Muy feliz
      color: '#22c55e',
      emoji: '😄'
    },
    excited: {
      leftEye: { scaleY: 1.5, y: -4, x: 0 },
      rightEye: { scaleY: 1.5, y: -4, x: 0 },
      mouth: { d: 'M 28 38 Q 50 60 72 38', fill: '#1e293b' }, // Emocionado
      color: '#f59e0b',
      emoji: '🤩'
    },
    confused: {
      leftEye: { scaleY: 1, y: 0, x: -3 },
      rightEye: { scaleY: 0.6, y: 2, x: 3 },
      mouth: { d: 'M 30 48 Q 40 45 50 48 Q 60 45 70 48', fill: 'none' }, // Confundido
      color: '#8b5cf6',
      emoji: '😕'
    }
  };

  const currentExpression = expressions[state] || expressions.idle;

  // Animación de parpadeo
  const blinkAnimation = {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.2,
      repeat: Infinity,
      repeatDelay: 3
    }
  };

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
    d: currentExpression.mouth.d
  };

  return (
    <div className="relative">
      {/* Cuerpo del bot */}
      <motion.div
        className="relative w-64 h-64 rounded-3xl overflow-hidden"
        style={{ backgroundColor: currentExpression.color }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : breatheScale,
          rotate: state === 'thinking' ? [0, -2, 2, 0] : 0
        }}
        transition={{
          scale: { duration: isSpeaking ? 0.5 : 3, repeat: isSpeaking ? Infinity : 0 },
          rotate: { duration: 2, repeat: state === 'thinking' ? Infinity : 0 }
        }}
      >
        {/* Brillo/Reflejo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Pantalla/Cara */}
        <div className="absolute inset-8 bg-slate-800 rounded-2xl flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
          >
            {/* Ojo izquierdo */}
            <motion.ellipse
              cx="30"
              cy="35"
              rx="8"
              ry="10"
              fill="#fbbf24"
              animate={{
                ...currentExpression.leftEye,
                x: (currentExpression.leftEye.x || 0) + lookDirection.x,
                y: (currentExpression.leftEye.y || 0) + lookDirection.y,
                ...blinkAnimation
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
                ...currentExpression.rightEye,
                x: (currentExpression.rightEye.x || 0) + lookDirection.x,
                y: (currentExpression.rightEye.y || 0) + lookDirection.y,
                ...blinkAnimation
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Boca */}
            <motion.path
              d={currentExpression.mouth.d}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              fill={currentExpression.mouth.fill}
              animate={mouthTalkAnimation}
            />

            {/* Detalles adicionales según estado */}
            {state === 'thinking' && (
              <>
                {/* Puntos de pensamiento */}
                <motion.circle
                  cx="85"
                  cy="20"
                  r="2"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -5, -10]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.circle
                  cx="90"
                  cy="15"
                  r="3"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -5, -10]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                />
              </>
            )}

            {state === 'listening' && (
              <>
                {/* Ondas de sonido */}
                <motion.path
                  d="M 10 50 Q 5 50 5 45"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  fill="none"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    strokeWidth: [2, 3, 2]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                />
                <motion.path
                  d="M 90 50 Q 95 50 95 45"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  fill="none"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    strokeWidth: [2, 3, 2]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
              </>
            )}
          </svg>
        </div>

        {/* Brazos */}
        <motion.div
          className="absolute -left-8 top-24 w-16 h-6 bg-slate-700 rounded-full"
          animate={{
            rotate: state === 'working' ? [0, -10, 0] : 0
          }}
          transition={{
            duration: 0.5,
            repeat: state === 'working' ? Infinity : 0
          }}
        />
        <motion.div
          className="absolute -right-8 top-24 w-16 h-6 bg-slate-700 rounded-full"
          animate={{
            rotate: state === 'working' ? [0, 10, 0] : 0
          }}
          transition={{
            duration: 0.5,
            repeat: state === 'working' ? Infinity : 0
          }}
        />
      </motion.div>

      {/* Sombra */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/20 rounded-full blur-xl" />

      {/* Indicador de estado */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: currentExpression.color + '40', color: currentExpression.color }}
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        {currentExpression.emoji} {' '}
        {state === 'idle' && 'En espera'}
        {state === 'listening' && 'Escuchando...'}
        {state === 'thinking' && 'Pensando...'}
        {state === 'speaking' && 'Hablando...'}
        {state === 'working' && 'Trabajando...'}
        {state === 'happy' && '¡Feliz!'}
        {state === 'excited' && '¡Emocionado!'}
        {state === 'confused' && 'Confundido'}
      </motion.div>
    </div>
  );
}
