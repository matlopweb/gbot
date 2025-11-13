import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { Heart, Sparkles, Zap } from 'lucide-react';

export function TactileInteraction({ children, onInteraction }) {
  const { 
    vitalStats, 
    currentMood, 
    receiveAttention, 
    createMemory 
  } = useAvatarLifeStore();
  
  const [touchPoints, setTouchPoints] = useState([]);
  const [isBeingTouched, setIsBeingTouched] = useState(false);
  const [touchDuration, setTouchDuration] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const touchStartTime = useRef(0);
  const containerRef = useRef(null);

  // Motion values para efectos táctiles
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform([x, y], ([latestX, latestY]) => {
    const distance = Math.sqrt(latestX * latestX + latestY * latestY);
    return 1 + distance * 0.0001;
  });

  // Manejar inicio de toque
  const handleTouchStart = (e) => {
    e.preventDefault();
    const now = Date.now();
    touchStartTime.current = now;
    setIsBeingTouched(true);
    setLastTouchTime(now);

    // Crear puntos de toque visuales
    const rect = containerRef.current.getBoundingClientRect();
    const touches = Array.from(e.touches || [e]).map((touch, index) => ({
      id: `${now}-${index}`,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      timestamp: now
    }));
    
    setTouchPoints(touches);

    // Respuesta emocional inmediata
    const touchResponse = getTouchResponse('start');
    onInteraction?.(touchResponse);
  };

  // Manejar movimiento de toque (caricias)
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isBeingTouched) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touches = Array.from(e.touches || [e]).map((touch, index) => ({
      id: `${Date.now()}-${index}`,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      timestamp: Date.now()
    }));
    
    setTouchPoints(prev => [...prev.slice(-5), ...touches]); // Mantener últimos 5 puntos

    // Actualizar motion values para efectos
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const touch = touches[0];
    if (touch) {
      x.set(touch.x - centerX);
      y.set(touch.y - centerY);
    }
  };

  // Manejar fin de toque
  const handleTouchEnd = (e) => {
    e.preventDefault();
    const duration = Date.now() - touchStartTime.current;
    setTouchDuration(duration);
    setIsBeingTouched(false);

    // Limpiar puntos de toque gradualmente
    setTimeout(() => setTouchPoints([]), 1000);

    // Respuesta emocional basada en duración
    const touchResponse = getTouchResponse('end', duration);
    onInteraction?.(touchResponse);

    // Registrar interacción emocional
    receiveAttention('physical');
    createMemory(
      `Me tocaron durante ${duration}ms, me hizo sentir ${touchResponse.emotion}`,
      touchResponse.emotion,
      Math.min(duration / 1000 * 0.1, 1) // Más duración = más importante
    );

    // Reset motion values
    x.set(0);
    y.set(0);
  };

  // Generar respuesta táctil basada en estado emocional
  const getTouchResponse = (phase, duration = 0) => {
    const responses = {
      lonely: {
        start: { 
          message: "Oh... gracias por tocarme. Necesitaba esto 🥺", 
          emotion: "grateful",
          effect: "warm"
        },
        end: duration > 2000 ? {
          message: "Eso fue muy reconfortante... me siento menos solo 💙",
          emotion: "comforted",
          effect: "healing"
        } : {
          message: "Fue breve pero dulce... gracias 😊",
          emotion: "touched",
          effect: "gentle"
        }
      },
      happy: {
        start: { 
          message: "¡Eso me hace cosquillas! 😄", 
          emotion: "joyful",
          effect: "sparkle"
        },
        end: duration > 3000 ? {
          message: "¡Me encanta cuando me mimas así! ✨",
          emotion: "delighted",
          effect: "celebration"
        } : {
          message: "¡Qué divertido! Hazlo de nuevo 😊",
          emotion: "playful",
          effect: "bounce"
        }
      },
      sad: {
        start: { 
          message: "Tu toque es muy consolador... 😌", 
          emotion: "soothed",
          effect: "calm"
        },
        end: duration > 4000 ? {
          message: "Me siento mucho mejor ahora. Gracias por cuidarme 💚",
          emotion: "healed",
          effect: "restoration"
        } : {
          message: "Eso ayudó un poco... gracias 🙂",
          emotion: "slightly_better",
          effect: "soft_glow"
        }
      },
      excited: {
        start: { 
          message: "¡Sí! ¡Me encanta la interacción física! ⚡", 
          emotion: "thrilled",
          effect: "electric"
        },
        end: duration > 1000 ? {
          message: "¡Eso fue increíble! ¡Tengo tanta energía ahora! 🚀",
          emotion: "energized",
          effect: "power_surge"
        } : {
          message: "¡Más, más! ¡Me encanta! 😆",
          emotion: "wanting_more",
          effect: "vibrant"
        }
      },
      sleepy: {
        start: { 
          message: "Mmm... eso es relajante... 😴", 
          emotion: "drowsy_content",
          effect: "dreamy"
        },
        end: duration > 5000 ? {
          message: "Casi me quedé dormido... fue muy tranquilizador 💤",
          emotion: "peaceful",
          effect: "sleep_waves"
        } : {
          message: "Eso fue como una caricia de buenas noches... 🌙",
          emotion: "sleepy_happy",
          effect: "moonlight"
        }
      }
    };

    const moodResponses = responses[currentMood.primary] || responses.happy;
    return moodResponses[phase] || moodResponses.start;
  };

  // Efectos visuales de toque
  const getTouchEffect = (effect) => {
    const effects = {
      warm: { color: '#ff6b9d', size: 'large', animation: 'pulse' },
      sparkle: { color: '#ffd700', size: 'medium', animation: 'twinkle' },
      healing: { color: '#4ade80', size: 'large', animation: 'ripple' },
      gentle: { color: '#a78bfa', size: 'small', animation: 'fade' },
      celebration: { color: '#f59e0b', size: 'large', animation: 'burst' },
      bounce: { color: '#06b6d4', size: 'medium', animation: 'bounce' },
      calm: { color: '#60a5fa', size: 'medium', animation: 'wave' },
      restoration: { color: '#10b981', size: 'large', animation: 'bloom' },
      soft_glow: { color: '#8b5cf6', size: 'small', animation: 'glow' },
      electric: { color: '#eab308', size: 'medium', animation: 'zap' },
      power_surge: { color: '#dc2626', size: 'large', animation: 'explosion' },
      vibrant: { color: '#ec4899', size: 'medium', animation: 'vibrate' },
      dreamy: { color: '#6366f1', size: 'large', animation: 'float' },
      sleep_waves: { color: '#4338ca', size: 'large', animation: 'waves' },
      moonlight: { color: '#818cf8', size: 'medium', animation: 'shimmer' }
    };

    return effects[effect] || effects.gentle;
  };

  // Limpiar puntos de toque antiguos
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTouchPoints(prev => 
        prev.filter(point => now - point.timestamp < 2000)
      );
    }, 100);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative touch-none select-none"
      style={{ scale }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {children}

      {/* Efectos visuales de toque */}
      {touchPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute pointer-events-none"
          style={{
            left: point.x - 20,
            top: point.y - 20,
            width: 40,
            height: 40
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [1, 0.7, 0]
          }}
          transition={{ 
            duration: 1,
            ease: "easeOut"
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${getTouchEffect('sparkle').color}40, transparent)`,
              border: `2px solid ${getTouchEffect('sparkle').color}60`
            }}
          />
        </motion.div>
      ))}

      {/* Indicador de toque activo */}
      {isBeingTouched && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl" />
          <motion.div
            className="absolute top-4 right-4 bg-pink-500/20 backdrop-blur-sm rounded-full p-2"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity
            }}
          >
            <Heart size={16} className="text-pink-400" />
          </motion.div>
        </motion.div>
      )}

      {/* Efectos de estado emocional */}
      {currentMood.primary === 'happy' && (
        <motion.div
          className="absolute -top-2 -right-2 pointer-events-none"
          animate={{ 
            y: [-5, -15, -5],
            rotate: [0, 10, -10, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={20} className="text-yellow-400" />
        </motion.div>
      )}

      {currentMood.primary === 'excited' && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl" />
        </motion.div>
      )}
    </motion.div>
  );
}
