import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, Mic, Settings } from 'lucide-react';
import BotFace from '../Bot/BotFace';
import ChatInterface from '../Chat/ChatInterface';
import VoiceControl from '../Voice/VoiceControl';
import { InfoWidgets } from '../Widgets/InfoWidgets';
import { ConversationHistory } from '../History/ConversationHistory';
import { useBotStore } from '../../store/botStore';

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState('voice');
  const [showMenu, setShowMenu] = useState(false);
  const { isConnected, messages } = useBotStore();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-lg">GBot</h1>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              isConnected
                ? 'text-emerald-300 border-emerald-400/60'
                : 'text-amber-200 border-amber-400/50'
            }`}
          >
            {isConnected ? 'Conectado' : 'Reconectando'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showMenu ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
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
              <MenuButton icon={<Settings size={18} />} label="Widgets" onClick={() => { setActiveTab('widgets'); setShowMenu(false); }} />
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
              className="h-full"
            >
              <ChatInterface />
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
                <BotFace />
                <VoiceControl />
                <div className="text-center text-white/80 text-sm">
                  <p>Toca el microfono para hablar</p>
                  <p className="text-xs mt-2 text-white/60">
                    {messages.length} mensajes en esta conversacion
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'widgets' && (
            <motion.div
              key="widgets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4"
            >
              <InfoWidgets />
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
          <NavButton
            icon={<Settings size={24} />}
            label="Info"
            active={activeTab === 'widgets'}
            onClick={() => setActiveTab('widgets')}
          />
        </div>
      </nav>

      <ConversationHistory />
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

