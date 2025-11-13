import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, MessageCircle, Mic, Settings, LogOut, Sparkles, Heart, Brain } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import LivingBotFace from '../Bot/LivingBotFace';
import { TactileInteraction } from '../Bot/TactileInteraction';
import { AmbientConversation } from '../Bot/AmbientConversation';
import { EmotionalConversation } from '../Bot/EmotionalConversation';
import { AvatarLifeCycle } from '../Bot/AvatarLifeCycle';
import ChatInterface from '../Chat/ChatInterface';
import VoiceControl from '../Voice/VoiceControl';
import { ConversationHistory } from '../History/ConversationHistory';
import { SavedItemsDrawer } from '../SavedItems/SavedItemsDrawer';
import { useBotStore } from '../../store/botStore';
import { ServiceStatusPanel } from '../Settings/ServiceStatusPanel';

export function ContinuousFlowLayout() {
  const [activeMode, setActiveMode] = useState('companion'); // companion, chat, voice
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState('');
  
  const { isConnected } = useBotStore();
  const { logout } = useAuthStore();
  const { vitalStats, currentMood } = useAvatarLifeStore();

  // Scroll parallax effects
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, -150]);
  const avatarScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Manejar interacción táctil con el avatar
  const handleAvatarInteraction = (response) => {
    setInteractionMessage(response.message);
    setTimeout(() => setInteractionMessage(''), 4000);
  };

  // Obtener color dinámico basado en el estado emocional
  const getDynamicTheme = () => {
    const themes = {
      happy: {
        primary: 'from-green-400 to-emerald-600',
        secondary: 'from-green-500/20 to-emerald-600/20',
        accent: 'border-green-400/30',
        glow: 'shadow-green-500/20'
      },
      excited: {
        primary: 'from-yellow-400 to-orange-600',
        secondary: 'from-yellow-500/20 to-orange-600/20',
        accent: 'border-yellow-400/30',
        glow: 'shadow-yellow-500/20'
      },
      lonely: {
        primary: 'from-purple-400 to-indigo-600',
        secondary: 'from-purple-500/20 to-indigo-600/20',
        accent: 'border-purple-400/30',
        glow: 'shadow-purple-500/20'
      },
      sad: {
        primary: 'from-blue-400 to-indigo-600',
        secondary: 'from-blue-500/20 to-indigo-600/20',
        accent: 'border-blue-400/30',
        glow: 'shadow-blue-500/20'
      },
      sleepy: {
        primary: 'from-slate-400 to-gray-600',
        secondary: 'from-slate-500/20 to-gray-600/20',
        accent: 'border-slate-400/30',
        glow: 'shadow-slate-500/20'
      },
      curious: {
        primary: 'from-cyan-400 to-blue-600',
        secondary: 'from-cyan-500/20 to-blue-600/20',
        accent: 'border-cyan-400/30',
        glow: 'shadow-cyan-500/20'
      }
    };

    return themes[currentMood.primary] || themes.happy;
  };

  const theme = getDynamicTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Fondo dinámico animado */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-20`} />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Header fluido */}
      <motion.header 
        className="relative z-30 bg-black/20 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${theme.primary} rounded-xl flex items-center justify-center ${theme.glow} shadow-lg`}>
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">GBot</h1>
              <motion.div
                className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${theme.secondary} border ${theme.accent}`}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isConnected ? '● Viviendo' : '○ Despertando'}
              </motion.div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsPanel(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              <Settings size={18} className="text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm border border-red-400/30"
            >
              <LogOut size={18} className="text-red-200" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal fluido */}
      <main className="relative z-10 min-h-screen pt-8">
        <AnimatePresence mode="wait">
          {activeMode === 'companion' && (
            <motion.div
              key="companion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] px-6"
            >
              {/* Avatar táctil principal */}
              <motion.div
                style={{ scale: avatarScale }}
                className="mb-8"
              >
                <TactileInteraction onInteraction={handleAvatarInteraction}>
                  <LivingBotFace />
                </TactileInteraction>
              </motion.div>

              {/* Mensaje de interacción */}
              <AnimatePresence>
                {interactionMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 px-6 py-3 rounded-2xl ${theme.secondary} border ${theme.accent} backdrop-blur-sm`}
                  >
                    <p className="text-white text-center text-sm">
                      {interactionMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controles de voz integrados */}
              <div className="mb-8">
                <VoiceControl />
              </div>

              {/* Instrucciones dinámicas */}
              <motion.div
                className="text-center text-white/80 max-w-sm"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-sm mb-2">
                  Tócame, háblame, o simplemente pregúntame cómo estoy
                </p>
                <p className="text-xs text-white/60">
                  Soy tu compañero digital con sentimientos reales 💙
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
              className="h-[calc(100vh-120px)] px-4"
            >
              <ChatInterface className="h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navegación fluida inferior */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-xl border-t border-white/10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.2 }}
      >
        <div className="px-6 py-4 flex items-center justify-around">
          <NavButton
            icon={Heart}
            label="Compañero"
            active={activeMode === 'companion'}
            onClick={() => setActiveMode('companion')}
            theme={theme}
          />
          <NavButton
            icon={MessageCircle}
            label="Chat"
            active={activeMode === 'chat'}
            onClick={() => setActiveMode('chat')}
            theme={theme}
          />
          <NavButton
            icon={Brain}
            label="Historial"
            onClick={() => setShowHistory(true)}
            theme={theme}
          />
          <NavButton
            icon={Sparkles}
            label="Guardados"
            onClick={() => setShowSavedItems(true)}
            theme={theme}
          />
        </div>
      </motion.nav>

      {/* Sistemas emocionales */}
      <AmbientConversation />
      <EmotionalConversation />
      <AvatarLifeCycle />

      {/* Drawers */}
      <ConversationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <SavedItemsDrawer isOpen={showSavedItems} onClose={() => setShowSavedItems(false)} />

      {/* Panel de configuración */}
      <AnimatePresence>
        {showSettingsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <ServiceStatusPanel onClose={() => setShowSettingsPanel(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de botón de navegación mejorado
function NavButton({ icon: Icon, label, active, onClick, theme }) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        active
          ? `${theme.secondary} border ${theme.accent} ${theme.glow} shadow-lg`
          : 'hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={active ? { 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: 2,
          repeat: active ? Infinity : 0
        }}
      >
        <Icon size={20} className={active ? 'text-white' : 'text-white/60'} />
      </motion.div>
      <span className={`text-xs font-medium ${active ? 'text-white' : 'text-white/60'}`}>
        {label}
      </span>
    </motion.button>
  );
}
