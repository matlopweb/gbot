import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useBotStore } from '../../store/botStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import ProfessionalAvatar from '../Bot/ProfessionalAvatar';
import { TactileInteraction } from '../Bot/TactileInteraction';
import { SimpleResponse } from '../Bot/SimpleResponse';

export function JobsLayout() {
  const [interactionState, setInteractionState] = useState('waiting'); // waiting, listening, thinking, responding
  const [currentMessage, setCurrentMessage] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  
  const { vitalStats, currentMood, receiveAttention } = useAvatarLifeStore();
  const { isConnected, addMessage, messages, isTyping } = useBotStore();
  const { send } = useWebSocket();
  const { logout } = useAuthStore();

  // Escuchar respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && interactionState === 'thinking') {
      setInteractionState('responding');
      setShowResponse(true);
    }
  }, [messages, interactionState]);

  // PRINCIPIO JOBS: Una sola acción principal - HABLAR
  const handleMainInteraction = () => {
    if (interactionState === 'waiting') {
      startListening();
    } else if (interactionState === 'listening') {
      stopListening();
    }
  };

  // Iniciar escucha (voz o texto)
  const startListening = () => {
    setInteractionState('listening');
    
    // Integrar reconocimiento de voz nativo
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';
      
      recognition.onstart = () => {
        setInteractionState('listening');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };
      
      recognition.onerror = () => {
        setInteractionState('waiting');
      };
      
      recognition.start();
    } else {
      // Fallback a input de texto
      const message = prompt('¿Qué quieres decirme?');
      if (message) {
        handleUserMessage(message);
      } else {
        setInteractionState('waiting');
      }
    }
  };

  // Detener escucha
  const stopListening = () => {
    setInteractionState('waiting');
  };

  // Manejar mensaje del usuario
  const handleUserMessage = (message) => {
    setInteractionState('thinking');
    setCurrentMessage(message);
    
    // Agregar mensaje del usuario
    addMessage({
      role: 'user',
      content: message,
      id: crypto.randomUUID()
    });

    // Enviar al bot
    send({
      type: 'text_message',
      text: message,
      id: crypto.randomUUID(),
      metadata: {
        emotional_context: {
          mood: currentMood.primary,
          needs: vitalStats,
          interaction_type: 'voice_primary'
        }
      }
    });

    // La respuesta real se maneja en el useEffect que escucha messages

    // Registrar atención
    receiveAttention('conversation');
  };

  // Manejar interacción táctil
  const handleTactileInteraction = (response) => {
    // Feedback táctil simple
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Obtener estado visual simple
  const getSimpleState = () => {
    if (!isConnected) return { color: 'bg-gray-500', pulse: false, message: 'Conectando...' };
    
    switch (interactionState) {
      case 'listening':
        return { 
          color: 'bg-blue-500', 
          pulse: true, 
          message: 'Te escucho...' 
        };
      case 'thinking':
        return { 
          color: 'bg-purple-500', 
          pulse: true, 
          message: 'Pensando...' 
        };
      case 'responding':
        return { 
          color: 'bg-green-500', 
          pulse: false, 
          message: 'Respondiendo...' 
        };
      default:
        return { 
          color: 'bg-emerald-500', 
          pulse: false, 
          message: 'Tócame o háblame' 
        };
    }
  };

  const currentState = getSimpleState();

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header minimalista */}
      <div className="flex justify-between items-center p-6 bg-black">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${currentState.color} ${currentState.pulse ? 'animate-pulse' : ''}`} />
          <span className="text-white text-sm font-light">GBot</span>
        </div>
        
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="text-white/60 hover:text-white text-sm font-light"
        >
          Salir
        </button>
      </div>

      {/* Área principal - TODO EL FOCO AQUÍ */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        
        {/* Avatar central - LA ÚNICA COSA IMPORTANTE */}
        <motion.div
          className="mb-12"
          animate={{
            scale: interactionState === 'listening' ? 1.05 : 1,
            y: interactionState === 'thinking' ? -10 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <TactileInteraction onInteraction={handleTactileInteraction}>
            <ProfessionalAvatar />
          </TactileInteraction>
        </motion.div>

        {/* Mensaje de estado - CLARO Y SIMPLE */}
        <motion.div
          className="text-center mb-12"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white text-lg font-light mb-2">
            {currentState.message}
          </p>
          <p className="text-white/50 text-sm">
            {interactionState === 'waiting' && 'Una conversación, infinitas posibilidades'}
            {interactionState === 'listening' && 'Habla con naturalidad...'}
            {interactionState === 'thinking' && 'Procesando tus palabras...'}
            {interactionState === 'responding' && 'Preparando mi respuesta...'}
          </p>
        </motion.div>

        {/* Botón principal - UNA SOLA ACCIÓN */}
        <motion.button
          onClick={handleMainInteraction}
          className={`w-24 h-24 rounded-full ${currentState.color} flex items-center justify-center shadow-2xl`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: currentState.pulse 
              ? ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 20px rgba(59, 130, 246, 0)']
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: currentState.pulse ? Infinity : 0
            }
          }}
        >
          <motion.div
            animate={{
              rotate: interactionState === 'thinking' ? 360 : 0
            }}
            transition={{
              duration: 2,
              repeat: interactionState === 'thinking' ? Infinity : 0,
              ease: "linear"
            }}
          >
            {interactionState === 'waiting' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 1L21 5V9C21 16 12 23 12 23S3 16 3 9V5L12 1Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.8"/>
              </svg>
            )}
            {interactionState === 'listening' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
                <path d="M19 10V12C19 15.9 15.9 19 12 19C8.1 19 5 15.9 5 12V10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
            {(interactionState === 'thinking' || interactionState === 'responding') && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            )}
          </motion.div>
        </motion.button>

        {/* Respuesta del bot - SIMPLE Y ELEGANTE */}
        <div className="mt-8 w-full max-w-sm">
          <SimpleResponse 
            isVisible={showResponse}
            onComplete={() => {
              setInteractionState('waiting');
              setShowResponse(false);
              setCurrentMessage('');
            }}
          />
        </div>
      </div>

      {/* Footer minimalista - SOLO LO ESENCIAL */}
      <div className="p-6 text-center">
        <p className="text-white/30 text-xs font-light">
          Diseñado para la simplicidad • Construido para la conexión
        </p>
      </div>
    </div>
  );
}
