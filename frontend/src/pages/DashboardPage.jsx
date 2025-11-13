import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBotStore } from '../store/botStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchConversations } from '../services/conversationsApi';
import BotFace from '../components/Bot/BotFace';
import ChatInterface from '../components/Chat/ChatInterface';
import VoiceControl from '../components/Voice/VoiceControl';
import { ConversationHistory } from '../components/History/ConversationHistory';
import { SavedItemsButton } from '../components/SavedItems/SavedItemsButton';
import { MobileLayout } from '../components/Mobile/MobileLayout';
import { ServiceStatusPanel } from '../components/Settings/ServiceStatusPanel';
import { LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { logout, token } = useAuthStore();
  const { isConnected } = useWebSocket();
  const hydrateMessages = useBotStore(state => state.hydrateMessages);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (token && !hasHydrated.current) {
      hasHydrated.current = true;
      fetchConversations(token)
        .then((serverMessages) => {
          if (serverMessages.length > 0) {
            hydrateMessages(serverMessages);
          }
        })
        .catch((error) => console.error('Error syncing conversations:', error));
    }
  }, [token, hydrateMessages]);

  const handleLogout = () => {
    logout();
    toast.success('Sesion cerrada');
    window.location.href = '/';
  };

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold">GBot</h1>
              <span className="text-sm text-white/60">Tu asistente personal</span>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full border ${
                isConnected ? 'text-emerald-300 border-emerald-400/60' : 'text-amber-200 border-amber-400/40'
              }`}
            >
              {isConnected ? 'Conectado' : 'Sin conexion'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 glass rounded-lg hover:bg-white/20 transition-all"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 glass rounded-lg hover:bg-white/20 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <motion.div
          className="lg:w-1/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card h-full flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-6">
              <BotFace />
              <VoiceControl />
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Pulsa el micrófono o escribe en el chat.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-[72vh] lg:h-[620px]">
            <ChatInterface className="h-full" />
          </div>
        </motion.div>
      </div>

      <ConversationHistory />
      <SavedItemsButton />

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <ServiceStatusPanel onClose={() => setShowSettings(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

