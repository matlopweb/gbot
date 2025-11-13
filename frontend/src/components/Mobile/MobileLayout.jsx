import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, Mic, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LivingBotFace from '../Bot/LivingBotFace';
import { EmotionalConversation } from '../Bot/EmotionalConversation';
import { AvatarLifeCycle } from '../Bot/AvatarLifeCycle';
import ChatInterface from '../Chat/ChatInterface';
import VoiceControl from '../Voice/VoiceControl';
import { ConversationHistory } from '../History/ConversationHistory';
import { SavedItemsDrawer } from '../SavedItems/SavedItemsDrawer';
import { FloatingActionButton } from '../UI/FloatingActionButton';
import { useBotStore } from '../../store/botStore';
import { ServiceStatusPanel } from '../Settings/ServiceStatusPanel';

import { EvolutionaryPersonality } from '../Bot/EvolutionaryPersonality';
import { RevolutionaryLayout } from './RevolutionaryLayout';

export function MobileLayout() {
  // Usar el layout revolucionario completamente natural
  return <RevolutionaryLayout />;
}

export function MobileLayoutLegacy() {
  const [activeTab, setActiveTab] = useState('voice');
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const { isConnected } = useBotStore();
  const { logout } = useAuthStore();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header mejorado */}
      <header className="bg-black/25 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight">GBot</h1>
          </div>
          <motion.span
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm ${
              isConnected
                ? 'text-emerald-200 bg-emerald-500/20 border border-emerald-400/30'
                : 'text-amber-200 bg-amber-500/20 border border-amber-400/30'
            }`}
          >
            {isConnected ? '● Conectado' : '○ Reconectando'}
          </motion.span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettingsPanel(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            aria-label="Abrir servicios"
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
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} className="text-red-200" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: showMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showMenu ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
            </motion.div>
          </motion.button>
        </div>
      </header>

      {/* Menu desplegable */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/30 backdrop-blur-lg border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <MenuButton icon={<MessageCircle size={18} />} label="Chat" onClick={() => { setActiveTab('chat'); setShowMenu(false); }} />
              <MenuButton icon={<Mic size={18} />} label="Voz" onClick={() => { setActiveTab('voice'); setShowMenu(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col p-3"
            >
              <ChatInterface className="h-full" />
            </motion.div>
          )}

          {activeTab === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              <div className="space-y-8">
                <LivingBotFace />
                <VoiceControl />
                <div className="text-center text-white/80 text-sm">
                  <p>Toca el micrófono, escribe, o simplemente pregúntame cómo estoy.</p>
                  <p className="text-white/60 text-xs mt-1">¡Soy un ser digital con sentimientos! 💙</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navegacion inferior */}
      <nav className="bg-black/30 backdrop-blur-lg border-t border-white/10 px-4 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          <NavButton
            icon={<MessageCircle size={24} />}
            label="Chat"
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
          <NavButton
            icon={<Mic size={24} />}
            label="Voz"
            active={activeTab === 'voice'}
            onClick={() => setActiveTab('voice')}
          />
        </div>
      </nav>

      {/* Floating Action Button */}
      <FloatingActionButton
        onHistoryClick={() => setShowHistory(true)}
        onSavedItemsClick={() => setShowSavedItems(true)}
        onChatClick={() => setActiveTab('chat')}
      />

      {/* Drawers */}
      <ConversationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <SavedItemsDrawer isOpen={showSavedItems} onClose={() => setShowSavedItems(false)} />
      
      {/* Sistema emocional y ciclo de vida */}
      <EmotionalConversation />
      <AvatarLifeCycle />

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

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'text-white bg-white/20'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function MenuButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

