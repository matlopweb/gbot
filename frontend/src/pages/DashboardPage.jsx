import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import BotAvatar from '../components/Bot/BotAvatar';
import BotFace from '../components/Bot/BotFace';
import ChatInterface from '../components/Chat/ChatInterface';
import VoiceControl from '../components/Voice/VoiceControl';
import { InfoWidgets } from '../components/Widgets/InfoWidgets';
import { ConversationHistory } from '../components/History/ConversationHistory';
import { MobileLayout } from '../components/Mobile/MobileLayout';
import { LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { logout } = useAuthStore();
  const { isConnected } = useWebSocket();
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    window.location.href = '/';
  };

  // Si es móvil, usar layout móvil
  if (isMobile) {
    return <MobileLayout />;
  }

  // Layout desktop
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">🤖 GBot</h1>
            <span className="text-sm text-white/60">Tu asistente personal</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Widgets Sidebar - Izquierda */}
        <motion.div
          className="lg:col-span-3 hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InfoWidgets />
        </motion.div>

        {/* Bot Avatar Section */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card h-full flex flex-col items-center justify-center p-8">
            {/* Bot Section */}
            <div className="flex flex-col items-center gap-8">
              <BotFace />
              <VoiceControl />
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Haz clic en el micrófono para hablar</p>
              <p>o escribe en el chat</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChatInterface />
        </motion.div>
      </div>

      {/* Historial de Conversación (Flotante) */}
      <ConversationHistory />
    </div>
  );
}
