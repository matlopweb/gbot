import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Bot, Calendar, CheckSquare, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/google`);
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error('Error al iniciar sesión');
      console.error(error);
    }
  };

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot size={80} className="text-blue-400" />
          </motion.div>
          
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            GBot
          </h1>
          
          <p className="text-2xl text-gray-300 mb-8">
            Tu asistente personal con IA
          </p>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Interactúa con un asistente inteligente que te ayuda a gestionar tu calendario,
            tareas y mucho más, todo con voz natural y personalidad propia.
          </p>

          <motion.button
            onClick={handleLogin}
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={24} />
              Comenzar con Google
            </span>
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <FeatureCard
            icon={<Mic size={40} />}
            title="Voz Natural"
            description="Habla con GBot como si fuera una persona real. Reconocimiento y síntesis de voz en tiempo real."
          />
          
          <FeatureCard
            icon={<Calendar size={40} />}
            title="Gestión de Calendario"
            description="Crea, modifica y consulta eventos en tu Google Calendar con comandos de voz."
          />
          
          <FeatureCard
            icon={<CheckSquare size={40} />}
            title="Tareas Inteligentes"
            description="Administra tus tareas de Google Tasks. GBot te recuerda y ayuda a priorizar."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      className="card text-center"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-blue-400 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}
