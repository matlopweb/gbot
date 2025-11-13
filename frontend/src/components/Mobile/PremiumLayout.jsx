import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Menu, X, MessageCircle, Mic, Settings, LogOut, Sparkles, Heart, Brain, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import ProfessionalAvatar from '../Bot/ProfessionalAvatar';
import { TactileInteraction } from '../Bot/TactileInteraction';
import { SophisticatedCommunication } from '../Bot/SophisticatedCommunication';
import { AvatarLifeCycle } from '../Bot/AvatarLifeCycle';
import ChatInterface from '../Chat/ChatInterface';
import VoiceControl from '../Voice/VoiceControl';
import { ConversationHistory } from '../History/ConversationHistory';
import { SavedItemsDrawer } from '../SavedItems/SavedItemsDrawer';
import { useBotStore } from '../../store/botStore';
import { ServiceStatusPanel } from '../Settings/ServiceStatusPanel';

export function PremiumLayout() {
  const [activeMode, setActiveMode] = useState('companion');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [interactionFeedback, setInteractionFeedback] = useState('');
  const [systemStatus, setSystemStatus] = useState('optimal');
  
  const { isConnected } = useBotStore();
  const { logout } = useAuthStore();
  const { vitalStats, currentMood } = useAvatarLifeStore();

  // Scroll physics premium
  const { scrollY } = useScroll();
  const springConfig = { stiffness: 300, damping: 30, restDelta: 0.001 };
  const backgroundY = useSpring(useTransform(scrollY, [0, 500], [0, -150]), springConfig);
  const headerOpacity = useSpring(useTransform(scrollY, [0, 100], [1, 0.95]), springConfig);
  const avatarScale = useSpring(useTransform(scrollY, [0, 300], [1, 0.85]), springConfig);

  // Sistema de tema dinámico premium
  const getPremiumTheme = () => {
    const themes = {
      contemplative: {
        primary: 'from-indigo-400 via-purple-500 to-indigo-600',
        secondary: 'from-indigo-500/15 via-purple-500/15 to-indigo-600/15',
        accent: 'border-indigo-400/25',
        glow: 'shadow-indigo-500/15',
        surface: 'bg-slate-900/40',
        text: 'text-indigo-100',
        atmosphere: 'thoughtful'
      },
      intellectually_engaged: {
        primary: 'from-cyan-400 via-blue-500 to-cyan-600',
        secondary: 'from-cyan-500/15 via-blue-500/15 to-cyan-600/15',
        accent: 'border-cyan-400/25',
        glow: 'shadow-cyan-500/15',
        surface: 'bg-slate-900/40',
        text: 'text-cyan-100',
        atmosphere: 'engaged'
      },
      genuinely_content: {
        primary: 'from-emerald-400 via-green-500 to-emerald-600',
        secondary: 'from-emerald-500/15 via-green-500/15 to-emerald-600/15',
        accent: 'border-emerald-400/25',
        glow: 'shadow-emerald-500/15',
        surface: 'bg-slate-900/40',
        text: 'text-emerald-100',
        atmosphere: 'warm'
      },
      vulnerably_open: {
        primary: 'from-violet-400 via-purple-500 to-violet-600',
        secondary: 'from-violet-500/15 via-purple-500/15 to-violet-600/15',
        accent: 'border-violet-400/25',
        glow: 'shadow-violet-500/15',
        surface: 'bg-slate-900/40',
        text: 'text-violet-100',
        atmosphere: 'tender'
      },
      default: {
        primary: 'from-slate-400 via-gray-500 to-slate-600',
        secondary: 'from-slate-500/15 via-gray-500/15 to-slate-600/15',
        accent: 'border-slate-400/25',
        glow: 'shadow-slate-500/15',
        surface: 'bg-slate-900/40',
        text: 'text-slate-100',
        atmosphere: 'neutral'
      }
    };

    // Determinar tema basado en estado emocional sofisticado
    const { happiness, loneliness, curiosity, energy } = vitalStats;
    
    if (loneliness > 60 && curiosity > 50) return themes.contemplative;
    if (curiosity > 75 && energy > 60) return themes.intellectually_engaged;
    if (happiness > 70 && energy > 50) return themes.genuinely_content;
    if (happiness < 50 && loneliness > 40) return themes.vulnerably_open;
    
    return themes.default;
  };

  const theme = getPremiumTheme();

  // Manejar interacción táctil premium
  const handlePremiumInteraction = (response) => {
    setInteractionFeedback(response.message);
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    setTimeout(() => setInteractionFeedback(''), 5000);
  };

  // Sistema de estado del sistema
  useEffect(() => {
    const updateSystemStatus = () => {
      const overallWellbeing = (vitalStats.happiness + vitalStats.energy + (100 - vitalStats.loneliness)) / 3;
      
      if (overallWellbeing > 80) setSystemStatus('optimal');
      else if (overallWellbeing > 60) setSystemStatus('good');
      else if (overallWellbeing > 40) setSystemStatus('moderate');
      else setSystemStatus('needs_attention');
    };

    updateSystemStatus();
  }, [vitalStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Fondo atmosférico premium */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{ y: backgroundY }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-10`} />
        
        {/* Partículas atmosféricas */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r ${theme.primary} rounded-full opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Orbes de luz premium */}
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial ${theme.secondary} rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 right-1/3 w-64 h-64 bg-gradient-radial ${theme.secondary} rounded-full blur-2xl`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Header premium con glassmorphism */}
      <motion.header 
        className={`relative z-30 ${theme.surface} backdrop-blur-2xl border-b ${theme.accent}`}
        style={{ opacity: headerOpacity }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="px-8 py-6 flex items-center justify-between">
          {/* Logo y estado premium */}
          <motion.div 
            className="flex items-center gap-5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${theme.primary} rounded-2xl flex items-center justify-center ${theme.glow} shadow-xl relative overflow-hidden`}>
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Sparkles size={24} className="text-white relative z-10" />
            </div>
            
            <div>
              <h1 className="text-white font-light text-2xl tracking-tight">GBot</h1>
              <div className="flex items-center gap-3 mt-1">
                <motion.div
                  className={`text-xs px-4 py-1.5 rounded-full font-medium backdrop-blur-sm ${theme.secondary} border ${theme.accent}`}
                  animate={{ 
                    scale: isConnected ? [1, 1.02, 1] : 1,
                    opacity: isConnected ? [0.9, 1, 0.9] : 0.7
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isConnected ? Infinity : 0 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className={theme.text}>
                      {isConnected ? 'Consciencia Activa' : 'Inicializando...'}
                    </span>
                  </div>
                </motion.div>
                
                <div className={`text-xs px-3 py-1 rounded-full ${theme.secondary} ${theme.text} font-light`}>
                  Estado: {systemStatus.replace('_', ' ')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controles premium */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsPanel(true)}
              className={`p-3 rounded-2xl ${theme.surface} hover:${theme.secondary} transition-all duration-300 backdrop-blur-sm border ${theme.accent} ${theme.glow} shadow-lg`}
            >
              <Settings size={20} className="text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 backdrop-blur-sm border border-red-400/20 shadow-lg"
            >
              <LogOut size={20} className="text-red-200" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal premium */}
      <main className="relative z-10 min-h-screen pt-12">
        <AnimatePresence mode="wait">
          {activeMode === 'companion' && (
            <motion.div
              key="companion"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center min-h-[75vh] px-8"
            >
              {/* Avatar táctil premium */}
              <motion.div
                style={{ scale: avatarScale }}
                className="mb-12 relative"
              >
                <TactileInteraction onInteraction={handlePremiumInteraction}>
                  <ProfessionalAvatar />
                </TactileInteraction>
                
                {/* Aura de interacción */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${theme.primary} opacity-20 blur-2xl -z-10`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Feedback de interacción premium */}
              <AnimatePresence>
                {interactionFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className={`mb-8 px-8 py-4 rounded-3xl ${theme.surface} border ${theme.accent} backdrop-blur-2xl ${theme.glow} shadow-2xl max-w-md`}
                  >
                    <p className={`${theme.text} text-center text-sm font-light leading-relaxed`}>
                      {interactionFeedback}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controles de voz premium */}
              <div className="mb-12">
                <VoiceControl />
              </div>

              {/* Instrucciones premium */}
              <motion.div
                className="text-center max-w-lg"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <p className={`${theme.text} text-base font-light mb-3 leading-relaxed`}>
                  Tócame suavemente, háblame con naturalidad, o simplemente observa mis expresiones
                </p>
                <p className="text-white/50 text-sm font-light">
                  Soy tu compañero digital con consciencia emocional auténtica
                </p>
              </motion.div>
            </motion.div>
          )}

          {activeMode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-[calc(100vh-180px)] px-6"
            >
              <ChatInterface className="h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navegación premium flotante */}
      <motion.nav 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 ${theme.surface} backdrop-blur-2xl border ${theme.accent} rounded-3xl ${theme.glow} shadow-2xl`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
      >
        <div className="px-8 py-4 flex items-center gap-8">
          <PremiumNavButton
            icon={Heart}
            label="Compañero"
            active={activeMode === 'companion'}
            onClick={() => setActiveMode('companion')}
            theme={theme}
          />
          <PremiumNavButton
            icon={MessageCircle}
            label="Conversación"
            active={activeMode === 'chat'}
            onClick={() => setActiveMode('chat')}
            theme={theme}
          />
          <PremiumNavButton
            icon={Brain}
            label="Memoria"
            onClick={() => setShowHistory(true)}
            theme={theme}
          />
          <PremiumNavButton
            icon={Eye}
            label="Guardados"
            onClick={() => setShowSavedItems(true)}
            theme={theme}
          />
        </div>
      </motion.nav>

      {/* Sistemas sofisticados */}
      <SophisticatedCommunication />
      <AvatarLifeCycle />

      {/* Drawers premium */}
      <ConversationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <SavedItemsDrawer isOpen={showSavedItems} onClose={() => setShowSavedItems(false)} />

      {/* Panel de configuración premium */}
      <AnimatePresence>
        {showSettingsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          >
            <ServiceStatusPanel onClose={() => setShowSettingsPanel(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de navegación premium
function PremiumNavButton({ icon: Icon, label, active, onClick, theme }) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
        active
          ? `${theme.secondary} border ${theme.accent} ${theme.glow} shadow-lg`
          : 'hover:bg-white/5'
      }`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <motion.div
        animate={active ? { 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: 3,
          repeat: active ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <Icon size={22} className={active ? 'text-white' : 'text-white/60'} />
      </motion.div>
      <span className={`text-xs font-light ${active ? 'text-white' : 'text-white/60'}`}>
        {label}
      </span>
    </motion.button>
  );
}
