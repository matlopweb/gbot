import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useBotStore } from '../../store/botStore';
import { useScenarioStore } from '../../store/scenarioStore';
import { ScenarioSwitcher } from '../Scenarios/ScenarioSwitcher';
import ProfessionalAvatar from '../Bot/ProfessionalAvatar';
import { AdaptiveVoiceSystem } from '../Professional/AdaptiveVoiceSystem';
import { NaturalConversationFlow } from '../Bot/NaturalConversationFlow';
import { IntelligentWelcome } from '../Bot/IntelligentWelcome';
import { SystemStatus } from '../Debug/SystemStatus';
import { SystemMonitor } from '../Professional/SystemMonitor';
import { InnerWorldVisualization } from '../CognitiveCompanion/InnerWorldVisualization';
import { CompanionSetup } from '../CognitiveCompanion/CompanionSetup';
import { getProfileTheme } from '../../utils/profileThemes';

export function RevolutionaryLayout() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [showInnerWorld, setShowInnerWorld] = useState(false);
  const [innerWorldData, setInnerWorldData] = useState(null);
  const [companionData, setCompanionData] = useState(null);
  const [showCompanionSetup, setShowCompanionSetup] = useState(false);
  const [companionSystemReady, setCompanionSystemReady] = useState(false);
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionError, setCompanionError] = useState(null);
  
  const { vitalStats, currentMood, friendship } = useAvatarLifeStore();
  const { isConnected } = useBotStore();
  const { logout, user, profile } = useAuthStore();
  const toneTheme = useScenarioStore((state) => state.getToneTheme());
  const activeScenario = useScenarioStore((state) => state.activeScenario);

  // Verificar estado del compañero cognitivo
  useEffect(() => {
    checkCompanionSystem();
  }, []);

  // Ocultar bienvenida después de unos segundos
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsReady(true);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const checkCompanionSystem = async () => {
    try {
      // Primero probar la ruta de test
      const testResponse = await fetch('/api/companion/test');
      
      if (!testResponse.ok) {
        console.warn('Companion routes not available, using fallback mode');
        setCompanionSystemReady(false);
        return;
      }
      
      // Si la ruta de test funciona, probar el status
      const response = await fetch('/api/companion/status');
      
      if (!response.ok) {
        console.warn('Companion status endpoint not available');
        setCompanionSystemReady(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.status === 'ready') {
        setCompanionSystemReady(true);
        console.log('✅ Cognitive Companion system ready');
        setCompanionError(null);
      } else if (data.setup_required) {
        console.log('⚠️ Cognitive Companion setup required');
        // Mostrar setup después de un delay para no interrumpir la bienvenida
        setTimeout(() => {
          setShowCompanionSetup(true);
        }, 6000);
      } else {
        console.log('🔧 Cognitive Companion in partial state:', data.status);
        setCompanionSystemReady(false);
      }
    } catch (error) {
      console.warn('Could not check companion system status:', error.message);
      // Modo fallback - el sistema funciona sin compañero cognitivo
      setCompanionSystemReady(false);
    }
  };

  const createCompanionForUser = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/companion/${encodeURIComponent(user.id)}/create`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('No se pudo crear el compañero cognitivo');
      }

      setCompanionError(null);
      return true;
    } catch (error) {
      console.warn('Error creating companion:', error);
      setCompanionError(error.message);
      return false;
    }
  }, [user?.id]);

  const fetchCompanionData = useCallback(async ({ allowCreate = true } = {}) => {
    if (!companionSystemReady || !user?.id) return;

    try {
      setCompanionLoading(true);
      setCompanionError(null);

      const response = await fetch(`/api/companion/${encodeURIComponent(user.id)}`);

      if (response.status === 404) {
        console.warn('Companion not found for user, attempting creation');
        if (allowCreate) {
          const created = await createCompanionForUser();
          if (created) {
            return fetchCompanionData({ allowCreate: false });
          }
        }
        setShowCompanionSetup(true);
        setCompanionData(null);
        setInnerWorldData(null);
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo obtener el estado del compañero');
      }

      const data = await response.json();
      if (data.companion) {
        setCompanionData({
          personality: data.companion.personality,
          emotional_state: data.companion.emotional_state,
          relationship_depth: data.companion.relationship_depth,
          memory_count: data.companion.memory_count
        });
        setInnerWorldData(data.companion.inner_world || null);
      } else {
        setCompanionData(null);
        setInnerWorldData(null);
      }
    } catch (error) {
      console.warn('Error loading companion data:', error);
      setCompanionError(error.message);
    } finally {
      setCompanionLoading(false);
    }
  }, [companionSystemReady, user?.id, createCompanionForUser]);

  useEffect(() => {
    if (!companionSystemReady) return;
    fetchCompanionData();
    const interval = setInterval(fetchCompanionData, 60_000);
    return () => clearInterval(interval);
  }, [companionSystemReady, fetchCompanionData]);

  const handleCompanionSetupComplete = () => {
    setShowCompanionSetup(false);
    setCompanionSystemReady(true);
    fetchCompanionData();
    
    // Mostrar mundo interior brevemente para demostrar la funcionalidad
    setTimeout(() => {
      setShowInnerWorld(true);
    }, 1000);
  };

  const profileTheme = getProfileTheme(profile?.color_theme);
  const backgroundGradient = activeScenario ? toneTheme.gradient : profileTheme.gradient;
  const displayName = profile?.display_name || user?.name || 'Explorador';
  const modeLabel = profile?.voice_style ? `Modo ${profile.voice_style}` : 'Modo clásico';

  return (
    <div className={`h-screen bg-gradient-to-br ${backgroundGradient} flex flex-col relative overflow-hidden transition-colors duration-700`}>
      
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

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-white/80 z-10">
        <p className="font-semibold tracking-tight">Hola, {displayName}</p>
        <span className="text-xs uppercase tracking-widest">{modeLabel}</span>
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

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <ScenarioSwitcher compact />
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
      <SystemMonitor />
      <SystemStatus />
      <IntelligentWelcome />
      <AdaptiveVoiceSystem />
      <NaturalConversationFlow />

      {/* Botón Mundo Interior */}
      <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
        <motion.button
          onClick={() => setShowInnerWorld(!showInnerWorld)}
          className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🧠
          {companionLoading && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 text-xs rounded-full bg-blue-500 border border-white flex items-center justify-center animate-spin">
              ⏳
            </span>
          )}
          {companionError && !companionLoading && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border border-white flex items-center justify-center text-xs">
              !
            </span>
          )}
        </motion.button>

        {companionError && (
          <motion.button
            onClick={() => fetchCompanionData({ allowCreate: false })}
            className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reconectar compañero
          </motion.button>
        )}
      </div>

      {/* Mundo Interior */}
      <InnerWorldVisualization
        innerWorld={innerWorldData}
        companion={companionData}
        isVisible={showInnerWorld}
        onToggle={() => setShowInnerWorld(false)}
      />

      {/* Configuración del Compañero Cognitivo */}
      {showCompanionSetup && (
        <CompanionSetup onSetupComplete={handleCompanionSetupComplete} />
      )}
    </div>
  );
}
