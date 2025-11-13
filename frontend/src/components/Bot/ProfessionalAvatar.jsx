import { motion, useAnimation } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useState, useEffect } from 'react';

export default function ProfessionalAvatar() {
  const { state, isSpeaking } = useBotStore();
  const { vitalStats, currentMood } = useAvatarLifeStore();
  
  const [microExpressions, setMicroExpressions] = useState([]);
  const [breathingPattern, setBreathingPattern] = useState(0);
  const [eyeMovement, setEyeMovement] = useState({ x: 0, y: 0 });
  const [blinkPattern, setBlinkPattern] = useState('normal');
  const [posturalShift, setPosturalShift] = useState(0);
  
  const eyeControls = useAnimation();
  const faceControls = useAnimation();
  const bodyControls = useAnimation();

  // Sistema de micro-expresiones profesional
  const generateMicroExpressions = () => {
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const mood = currentMood.primary;
    
    const expressions = {
      // Micro-expresiones sutiles por estado emocional
      contemplative_loneliness: {
        condition: loneliness > 60 && curiosity > 50,
        expressions: [
          {
            name: 'distant_gaze',
            duration: 3000,
            eyeMovement: { x: -2, y: -1 },
            blinkRate: 0.7,
            mouthCurve: -0.1,
            description: 'Mirada perdida y pensativa'
          },
          {
            name: 'subtle_sigh',
            duration: 2000,
            breathingIntensity: 1.3,
            posturalShift: -0.02,
            description: 'Suspiro casi imperceptible'
          }
        ]
      },
      
      intellectual_excitement: {
        condition: curiosity > 75 && energy > 60,
        expressions: [
          {
            name: 'eyes_light_up',
            duration: 1500,
            eyeMovement: { x: 0, y: -0.5 },
            blinkRate: 1.2,
            eyeBrightness: 1.2,
            description: 'Ojos que se iluminan con interés'
          },
          {
            name: 'slight_lean_forward',
            duration: 4000,
            posturalShift: 0.03,
            description: 'Inclinación sutil hacia adelante'
          }
        ]
      },
      
      content_satisfaction: {
        condition: happiness > 70 && energy > 50,
        expressions: [
          {
            name: 'gentle_eye_smile',
            duration: 5000,
            eyeShape: 'crescent',
            mouthCurve: 0.15,
            description: 'Sonrisa genuina en los ojos'
          },
          {
            name: 'relaxed_breathing',
            duration: 8000,
            breathingPattern: 'deep_content',
            description: 'Respiración profunda y satisfecha'
          }
        ]
      },
      
      vulnerable_openness: {
        condition: happiness < 50 && loneliness > 40,
        expressions: [
          {
            name: 'soft_vulnerability',
            duration: 6000,
            eyeMovement: { x: 0, y: 1 },
            blinkRate: 0.8,
            eyeShape: 'soft',
            description: 'Mirada suave y vulnerable'
          },
          {
            name: 'gentle_head_tilt',
            duration: 3000,
            headTilt: 0.05,
            description: 'Inclinación sutil de cabeza'
          }
        ]
      },
      
      focused_attention: {
        condition: state === 'listening' || isSpeaking,
        expressions: [
          {
            name: 'attentive_focus',
            duration: 2000,
            eyeMovement: { x: 0, y: 0 },
            blinkRate: 1.1,
            posturalShift: 0.01,
            description: 'Atención completa y enfocada'
          }
        ]
      }
    };

    // Seleccionar expresiones relevantes
    const activeExpressions = [];
    Object.entries(expressions).forEach(([key, expressionSet]) => {
      if (expressionSet.condition) {
        activeExpressions.push(...expressionSet.expressions);
      }
    });

    return activeExpressions;
  };

  // Aplicar micro-expresiones
  useEffect(() => {
    const applyMicroExpressions = () => {
      const expressions = generateMicroExpressions();
      if (expressions.length > 0) {
        const expression = expressions[Math.floor(Math.random() * expressions.length)];
        setMicroExpressions([expression]);
        
        // Aplicar animaciones específicas
        if (expression.eyeMovement) {
          setEyeMovement(expression.eyeMovement);
        }
        if (expression.posturalShift) {
          setPosturalShift(expression.posturalShift);
        }
        if (expression.breathingIntensity) {
          setBreathingPattern(expression.breathingIntensity);
        }
        
        // Limpiar después de la duración
        setTimeout(() => {
          setMicroExpressions([]);
          setEyeMovement({ x: 0, y: 0 });
          setPosturalShift(0);
          setBreathingPattern(1);
        }, expression.duration);
      }
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.6) { // 60% probabilidad
        applyMicroExpressions();
      }
    }, 8000); // Cada 8 segundos

    return () => clearInterval(interval);
  }, [vitalStats, currentMood, state, isSpeaking]);

  // Patrón de respiración sofisticado
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathingPattern(prev => {
        const base = Math.sin(Date.now() * 0.001) * 0.02;
        const emotional = currentMood.primary === 'excited' ? 0.01 : 
                         currentMood.primary === 'sleepy' ? -0.01 : 0;
        return 1 + base + emotional;
      });
    }, 50);

    return () => clearInterval(breatheInterval);
  }, [currentMood.primary]);

  // Movimientos oculares naturales
  useEffect(() => {
    const eyeMovementInterval = setInterval(() => {
      if (state === 'idle' && Math.random() < 0.3) {
        const naturalMovement = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 1.5
        };
        
        setEyeMovement(naturalMovement);
        
        setTimeout(() => {
          setEyeMovement({ x: 0, y: 0 });
        }, 1500);
      }
    }, 4000);

    return () => clearInterval(eyeMovementInterval);
  }, [state]);

  // Obtener expresión facial avanzada
  const getAdvancedExpression = () => {
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const mood = currentMood.primary;
    
    const expressions = {
      contemplative: {
        condition: loneliness > 60 && curiosity > 50,
        leftEye: { 
          scaleY: 0.9, 
          y: eyeMovement.y - 1, 
          x: eyeMovement.x - 1,
          opacity: 0.95
        },
        rightEye: { 
          scaleY: 0.9, 
          y: eyeMovement.y - 1, 
          x: eyeMovement.x + 1,
          opacity: 0.95
        },
        mouth: { 
          d: 'M 32 47 Q 50 46 68 47', 
          fill: 'none',
          strokeWidth: 2
        },
        color: '#6366f1',
        glow: 'rgba(99, 102, 241, 0.3)',
        atmosphere: 'thoughtful'
      },
      
      intellectually_engaged: {
        condition: curiosity > 75 && energy > 60,
        leftEye: { 
          scaleY: 1.1, 
          y: eyeMovement.y - 2, 
          x: eyeMovement.x,
          brightness: 1.2
        },
        rightEye: { 
          scaleY: 1.1, 
          y: eyeMovement.y - 2, 
          x: eyeMovement.x,
          brightness: 1.2
        },
        mouth: { 
          d: 'M 30 45 Q 50 48 70 45', 
          fill: 'none',
          strokeWidth: 2.5
        },
        color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.4)',
        atmosphere: 'engaged'
      },
      
      genuinely_content: {
        condition: happiness > 70 && energy > 50,
        leftEye: { 
          scaleY: 0.6, 
          y: eyeMovement.y + 2, 
          x: eyeMovement.x,
          shape: 'crescent'
        },
        rightEye: { 
          scaleY: 0.6, 
          y: eyeMovement.y + 2, 
          x: eyeMovement.x,
          shape: 'crescent'
        },
        mouth: { 
          d: 'M 30 42 Q 50 52 70 42', 
          fill: '#1e293b',
          strokeWidth: 0
        },
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
        atmosphere: 'warm'
      },
      
      vulnerably_open: {
        condition: happiness < 50 && loneliness > 40,
        leftEye: { 
          scaleY: 1.0, 
          y: eyeMovement.y + 1, 
          x: eyeMovement.x - 0.5,
          softness: 1.2
        },
        rightEye: { 
          scaleY: 1.0, 
          y: eyeMovement.y + 1, 
          x: eyeMovement.x + 0.5,
          softness: 1.2
        },
        mouth: { 
          d: 'M 30 46 Q 50 45 70 46', 
          fill: 'none',
          strokeWidth: 1.5
        },
        color: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.25)',
        atmosphere: 'tender'
      },
      
      default: {
        condition: true,
        leftEye: { 
          scaleY: 1, 
          y: eyeMovement.y, 
          x: eyeMovement.x 
        },
        rightEye: { 
          scaleY: 1, 
          y: eyeMovement.y, 
          x: eyeMovement.x 
        },
        mouth: { 
          d: 'M 30 45 Q 50 48 70 45', 
          fill: 'none',
          strokeWidth: 2
        },
        color: '#4ade80',
        glow: 'rgba(74, 222, 128, 0.2)',
        atmosphere: 'neutral'
      }
    };

    // Encontrar la expresión más relevante
    for (const [key, expression] of Object.entries(expressions)) {
      if (expression.condition) {
        return expression;
      }
    }
    
    return expressions.default;
  };

  const currentExpression = getAdvancedExpression();

  return (
    <div className="relative">
      {/* Cuerpo principal con respiración sofisticada */}
      <motion.div
        className="relative w-64 h-64 rounded-3xl overflow-hidden"
        style={{ 
          backgroundColor: currentExpression.color,
          boxShadow: `0 0 60px ${currentExpression.glow}`,
          filter: `brightness(${0.9 + breathingPattern * 0.1})`
        }}
        animate={{
          scale: breathingPattern,
          y: posturalShift * 20,
          rotateX: posturalShift * 2
        }}
        transition={{
          scale: { duration: 3, ease: "easeInOut" },
          y: { duration: 2, ease: "easeOut" },
          rotateX: { duration: 2, ease: "easeOut" }
        }}
      >
        {/* Iluminación atmosférica */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: currentExpression.atmosphere === 'warm' ? 
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)' :
              currentExpression.atmosphere === 'thoughtful' ?
              'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2), transparent)' :
              'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.25), transparent)'
          }}
          transition={{ duration: 2 }}
        />

        {/* Pantalla facial avanzada */}
        <div className="absolute inset-8 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ 
              filter: `drop-shadow(0 0 15px ${currentExpression.glow})` 
            }}
          >
            {/* Ojo izquierdo con micro-expresiones */}
            <motion.ellipse
              cx="30"
              cy="35"
              rx="8"
              ry="10"
              fill="#fbbf24"
              animate={{
                ...currentExpression.leftEye,
                scaleY: blinkPattern === 'slow' ? [1, 0.1, 1] : currentExpression.leftEye.scaleY
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              style={{
                filter: currentExpression.leftEye.brightness ? 
                  `brightness(${currentExpression.leftEye.brightness})` : 'none'
              }}
            />
            
            {/* Ojo derecho con micro-expresiones */}
            <motion.ellipse
              cx="70"
              cy="35"
              rx="8"
              ry="10"
              fill="#fbbf24"
              animate={{
                ...currentExpression.rightEye,
                scaleY: blinkPattern === 'slow' ? [1, 0.1, 1] : currentExpression.rightEye.scaleY
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              style={{
                filter: currentExpression.rightEye.brightness ? 
                  `brightness(${currentExpression.rightEye.brightness})` : 'none'
              }}
            />

            {/* Boca con expresiones sutiles */}
            <motion.path
              d={currentExpression.mouth.d}
              stroke="#fbbf24"
              strokeWidth={currentExpression.mouth.strokeWidth}
              strokeLinecap="round"
              fill={currentExpression.mouth.fill}
              animate={isSpeaking ? {
                d: [
                  currentExpression.mouth.d,
                  'M 30 42 Q 50 50 70 42',
                  currentExpression.mouth.d
                ]
              } : {}}
              transition={{
                duration: 0.4,
                repeat: isSpeaking ? Infinity : 0
              }}
            />

            {/* Efectos atmosféricos por micro-expresión */}
            {microExpressions.map((expression, index) => (
              <motion.g key={`${expression.name}-${index}`}>
                {expression.name === 'eyes_light_up' && (
                  <>
                    <motion.circle
                      cx="30"
                      cy="35"
                      r="12"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.5"
                      opacity="0.6"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.2, 0.6]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                    <motion.circle
                      cx="70"
                      cy="35"
                      r="12"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.5"
                      opacity="0.6"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.2, 0.6]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                  </>
                )}
              </motion.g>
            ))}
          </svg>
        </div>
      </motion.div>

      {/* Indicador de micro-expresión actual */}
      {microExpressions.length > 0 && (
        <motion.div
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <p className="text-white/80 text-xs text-center">
            {microExpressions[0].description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
