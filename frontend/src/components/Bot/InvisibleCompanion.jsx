import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export function InvisibleCompanion() {
  const { 
    vitalStats, 
    currentMood, 
    friendship,
    receiveAttention,
    createMemory,
    strengthenFriendship
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage, messages, isTyping } = useBotStore();
  
  // Estados para comunicación natural
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationFlow, setConversationFlow] = useState('idle'); // idle, listening, thinking, speaking
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [naturalContext, setNaturalContext] = useState(null);
  
  // Referencias para speech
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const conversationTimeoutRef = useRef(null);

  // Inicializar reconocimiento de voz continuo
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';
      
      recognition.onstart = () => {
        setIsListening(true);
        setConversationFlow('listening');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        if (event.results[event.results.length - 1].isFinal) {
          handleNaturalInput(transcript);
        }
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        setConversationFlow('idle');
      };
      
      recognition.onend = () => {
        // Reiniciar automáticamente para conversación continua
        if (conversationFlow !== 'idle') {
          setTimeout(() => {
            recognition.start();
          }, 1000);
        }
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Manejar entrada natural del usuario
  const handleNaturalInput = (input) => {
    setConversationFlow('thinking');
    setLastInteractionTime(Date.now());
    
    // Limpiar timeout de conversación anterior
    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
    }

    // Analizar contexto natural
    const context = analyzeNaturalContext(input);
    setNaturalContext(context);

    // Enviar al bot con contexto natural
    send({
      type: 'text_message',
      text: input,
      id: crypto.randomUUID(),
      metadata: {
        natural_conversation: {
          context: context,
          flow_state: conversationFlow,
          is_continuous: true,
          emotional_state: currentMood.primary,
          friendship_level: friendship.level
        }
      }
    });

    addMessage({
      role: 'user',
      content: input,
      id: crypto.randomUUID(),
      metadata: { natural_conversation: true }
    });

    receiveAttention('natural_conversation');
    strengthenFriendship('natural_conversation', 1.2);
  };

  // Analizar contexto natural de la conversación
  const analyzeNaturalContext = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Detectar tipo de conversación
    let conversationType = 'general';
    let emotionalTone = 'neutral';
    let needsResponse = true;
    let urgency = 'normal';

    // Tipos de conversación
    if (lowerInput.includes('ayuda') || lowerInput.includes('ayúdame')) {
      conversationType = 'help_request';
      urgency = 'high';
    } else if (lowerInput.includes('cómo te sientes') || lowerInput.includes('qué tal estás')) {
      conversationType = 'emotional_check';
    } else if (lowerInput.includes('cuéntame') || lowerInput.includes('háblame')) {
      conversationType = 'storytelling_request';
    } else if (lowerInput.includes('gracias') || lowerInput.includes('perfecto')) {
      conversationType = 'appreciation';
      urgency = 'low';
    } else if (lowerInput.includes('triste') || lowerInput.includes('mal')) {
      conversationType = 'emotional_support';
      emotionalTone = 'sad';
      urgency = 'high';
    } else if (lowerInput.includes('feliz') || lowerInput.includes('genial')) {
      conversationType = 'celebration';
      emotionalTone = 'happy';
    }

    return {
      type: conversationType,
      emotional_tone: emotionalTone,
      needs_response: needsResponse,
      urgency: urgency,
      timestamp: Date.now()
    };
  };

  // Hablar respuesta naturalmente
  const speakNaturally = (text) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier speech anterior
      speechSynthesis.cancel();
      
      setIsSpeaking(true);
      setConversationFlow('speaking');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Velocidad natural
      utterance.pitch = 1.1; // Tono amigable
      utterance.volume = 0.8;
      
      // Seleccionar voz femenina si está disponible
      const voices = speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.includes('es') && voice.name.includes('female')
      ) || voices.find(voice => voice.lang.includes('es'));
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setConversationFlow('idle');
        
        // Continuar escuchando después de hablar
        setTimeout(() => {
          if (recognitionRef.current && conversationFlow !== 'idle') {
            recognitionRef.current.start();
          }
        }, 500);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setConversationFlow('idle');
      };
      
      speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    }
  };

  // Escuchar respuestas del bot y hablarlas
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && conversationFlow === 'thinking') {
      // Hablar la respuesta automáticamente
      speakNaturally(lastMessage.content);
      
      // Crear memoria de conversación natural
      createMemory(
        `Conversación natural: "${lastMessage.content}"`,
        'natural_conversation',
        0.8
      );
    }
  }, [messages, conversationFlow]);

  // Iniciar conversación natural automáticamente
  const startNaturalConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setConversationFlow('listening');
    }
  };

  // Detener conversación
  const stopNaturalConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setConversationFlow('idle');
    setIsListening(false);
    setIsSpeaking(false);
  };

  // Generar conversaciones naturales proactivas
  const generateNaturalInitiatives = () => {
    const hour = new Date().getHours();
    const timeSinceLastInteraction = Date.now() - lastInteractionTime;
    const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);
    
    // Iniciativas naturales por tiempo
    if (minutesSinceLastInteraction > 30 && conversationFlow === 'idle') {
      const initiatives = [
        "Oye, ¿cómo vas por ahí?",
        "¿En qué andas pensando?",
        "¿Te ayudo con algo?",
        "¿Cómo te sientes ahora?",
        "¿Quieres que conversemos un rato?"
      ];
      
      const initiative = initiatives[Math.floor(Math.random() * initiatives.length)];
      
      setTimeout(() => {
        speakNaturally(initiative);
        
        // Agregar como mensaje del asistente
        addMessage({
          role: 'assistant',
          content: initiative,
          id: crypto.randomUUID(),
          metadata: { natural_initiative: true }
        });
        
        // Empezar a escuchar después de la iniciativa
        setTimeout(() => {
          startNaturalConversation();
        }, 2000);
      }, 1000);
    }
  };

  // Verificar iniciativas naturales periódicamente
  useEffect(() => {
    const initiativeInterval = setInterval(() => {
      if (conversationFlow === 'idle') {
        generateNaturalInitiatives();
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(initiativeInterval);
  }, [conversationFlow, lastInteractionTime]);

  // Obtener estado visual mínimo
  const getVisualState = () => {
    switch (conversationFlow) {
      case 'listening':
        return { 
          color: 'bg-blue-500', 
          pulse: true, 
          icon: Mic,
          message: 'Te escucho...' 
        };
      case 'thinking':
        return { 
          color: 'bg-purple-500', 
          pulse: true, 
          icon: Volume2,
          message: 'Pensando...' 
        };
      case 'speaking':
        return { 
          color: 'bg-green-500', 
          pulse: false, 
          icon: Volume2,
          message: 'Hablando...' 
        };
      default:
        return { 
          color: 'bg-gray-500', 
          pulse: false, 
          icon: isListening ? Mic : MicOff,
          message: 'Toca para hablar' 
        };
    }
  };

  const currentState = getVisualState();

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Indicador visual mínimo */}
      <motion.button
        onClick={conversationFlow === 'idle' ? startNaturalConversation : stopNaturalConversation}
        className={`w-16 h-16 rounded-full ${currentState.color} flex items-center justify-center shadow-2xl`}
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
        <currentState.icon size={24} className="text-white" />
      </motion.button>

      {/* Mensaje de estado sutil */}
      {conversationFlow !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 right-0 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs whitespace-nowrap"
        >
          {currentState.message}
        </motion.div>
      )}
    </div>
  );
}
