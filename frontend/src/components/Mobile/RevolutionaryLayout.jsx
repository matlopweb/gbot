import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useBotStore } from '../../store/botStore';
import ProfessionalAvatar from '../Bot/ProfessionalAvatar';
import { PerfectVoiceSystem } from '../Bot/PerfectVoiceSystem';
import { NaturalConversationFlow } from '../Bot/NaturalConversationFlow';
import { IntelligentWelcome } from '../Bot/IntelligentWelcome';

export function RevolutionaryLayout() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const { vitalStats, currentMood, friendship } = useAvatarLifeStore();
  const { isConnected } = useBotStore();
  const { logout } = useAuthStore();

  // Ocultar bienvenida después de unos segundos
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsReady(true);
    }, 3000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // El sistema de bienvenida inteligente maneja esto ahora

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col relative overflow-hidden">
      
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Header minimalista (solo salir) */}
      <div className="absolute top-6 right-6 z-10">
        <motion.button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="text-white/40 hover:text-white/80 text-sm font-light transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Salir
        </motion.button>
      </div>

      {/* Estado de conexión sutil */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
          animate={{
            opacity: isConnected ? [0.5, 1, 0.5] : 1,
            scale: isConnected ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: isConnected ? Infinity : 0
          }}
        />
      </div>

      {/* Área principal - SOLO EL AVATAR */}
      <div className="flex-1 flex items-center justify-center relative">
        
        {/* Mensaje de bienvenida */}
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-1/4 text-center z-20"
          >
            <motion.h1
              className="text-white text-3xl font-light mb-4"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            >
              {friendship.level > 1 ? '¡Hola de nuevo!' : '¡Hola!'}
            </motion.h1>
            <motion.p
              className="text-white/60 text-lg font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {friendship.level > 1 
                ? 'Me alegra verte otra vez' 
                : 'Soy GBot, tu nuevo compañero'
              }
            </motion.p>
          </motion.div>
        )}

        {/* Avatar central - LA ÚNICA INTERFAZ VISUAL */}
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: showWelcome ? 2 : 0,
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          {/* Aura emocional alrededor del avatar */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            animate={{
              backgroundColor: currentMood.primary === 'happy' ? 'rgba(34, 197, 94, 0.3)' :
                              currentMood.primary === 'sad' ? 'rgba(59, 130, 246, 0.3)' :
                              currentMood.primary === 'excited' ? 'rgba(251, 191, 36, 0.3)' :
                              currentMood.primary === 'lonely' ? 'rgba(147, 51, 234, 0.3)' :
                              'rgba(107, 114, 128, 0.3)',
              scale: [1, 1.1, 1]
            }}
            transition={{
              backgroundColor: { duration: 2 },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          <ProfessionalAvatar />
        </motion.div>

        {/* Indicador de nivel de amistad sutil */}
        {!showWelcome && friendship.level > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-1/4 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < friendship.level ? 'bg-pink-400' : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.1 }}
                />
              ))}
            </div>
            <motion.p
              className="text-white/40 text-xs font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              Amistad nivel {friendship.level}
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* Instrucciones sutiles */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <motion.p
            className="text-white/30 text-sm font-light"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity
            }}
          >
            Habla naturalmente conmigo
          </motion.p>
        </motion.div>
      )}

      {/* Sistemas invisibles */}
      <IntelligentWelcome />
      <PerfectVoiceSystem />
      <NaturalConversationFlow />
    </div>
  );
}
