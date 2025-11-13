import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, Brain } from 'lucide-react';

export function SimpleVoiceSystem() {
  const { 
    receiveAttention,
    createMemory,
    strengthenFriendship
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage, messages } = useBotStore();
  
  // Estados simples
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Referencias
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Inicialización simple y directa
  useEffect(() => {
    console.log('🚀 Initializing simple voice system...');
    
    // Marcar como listo inmediatamente
    const initTimer = setTimeout(() => {
      setIsReady(true);
      console.log('✅ Simple voice system ready');
    }, 1000);

    return () => clearTimeout(initTimer);
  }, []);

  // Inicializar reconocimiento cuando sea necesario
  const createRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported');
      return null;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Más simple
    recognition.interimResults = false; // Solo resultados finales
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Listening started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🗣️ User said:', transcript);
      handleUserInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      console.log('🏁 Recognition ended');
      setIsListening(false);
    };

    return recognition;
  }, []);

  // Manejar entrada del usuario
  const handleUserInput = useCallback((transcript) => {
    if (!transcript || transcript.length < 2) return;

    setIsListening(false);
    setIsProcessing(true);

    // Agregar mensaje del usuario
    addMessage({
      role: 'user',
      content: transcript,
      id: crypto.randomUUID(),
      metadata: { voice_input: true }
    });

    // Enviar al bot
    send({
      type: 'text_message',
      text: transcript,
      id: crypto.randomUUID(),
      metadata: {
        voice_conversation: true
      }
    });

    // Actualizar estados
    receiveAttention('voice_conversation');
    strengthenFriendship('natural_conversation', 1.0);

    // Timeout de seguridad
    timeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 10000);

  }, [send, addMessage, receiveAttention, strengthenFriendship]);

  // Hablar respuesta del bot
  const speakResponse = useCallback((text) => {
    if (!text) return;

    console.log('🔊 Speaking:', text);
    setIsProcessing(false);
    setIsSpeaking(true);

    // Verificar soporte
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported');
      setIsSpeaking(false);
      return;
    }

    // Cancelar speech anterior
    speechSynthesis.cancel();

    // Función para hablar con reintentos
    const attemptSpeech = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Buscar voz en español con más opciones
      const voices = speechSynthesis.getVoices();
      console.log('🎵 Available voices:', voices.length);
      
      const spanishVoice = voices.find(voice => 
        voice.lang.includes('es-ES') || 
        voice.lang.includes('es-MX') || 
        voice.lang.includes('es')
      );
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        console.log('🎵 Using voice:', spanishVoice.name);
      } else {
        console.log('⚠️ No Spanish voice found, using default');
      }

      utterance.onstart = () => {
        console.log('🎵 Speech started');
      };

      utterance.onend = () => {
        console.log('✅ Finished speaking');
        setIsSpeaking(false);
      };

      utterance.onerror = (error) => {
        console.error('❌ Speech error:', error);
        setIsSpeaking(false);
      };

      try {
        speechSynthesis.speak(utterance);
        console.log('🎵 Speech synthesis started');
      } catch (error) {
        console.error('❌ Failed to start speech:', error);
        setIsSpeaking(false);
      }
    };

    // Si no hay voces cargadas, esperar y reintentar
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ Waiting for voices to load...');
      speechSynthesis.onvoiceschanged = () => {
        console.log('🎵 Voices loaded, attempting speech');
        attemptSpeech();
        speechSynthesis.onvoiceschanged = null;
      };
      
      // Timeout de seguridad
      setTimeout(() => {
        if (speechSynthesis.onvoiceschanged) {
          console.log('⏰ Voice loading timeout, attempting anyway');
          speechSynthesis.onvoiceschanged = null;
          attemptSpeech();
        }
      }, 2000);
    } else {
      attemptSpeech();
    }
  }, []);

  // Escuchar respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        isProcessing) {
      
      clearTimeout(timeoutRef.current);
      speakResponse(lastMessage.content);
    }
  }, [messages, isProcessing, speakResponse]);

  // Iniciar conversación
  const startListening = useCallback(async () => {
    if (!isReady) return;

    try {
      // Solicitar permisos de micrófono
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Crear y iniciar reconocimiento
      const recognition = createRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      alert('🎤 Necesito acceso al micrófono para escucharte. Por favor, permite el acceso y vuelve a intentar.');
    }
  }, [isReady, createRecognition]);

  // Detener conversación
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    clearTimeout(timeoutRef.current);
  }, []);

  // Obtener estado visual
  const getVisualState = () => {
    if (!isReady) {
      return {
        color: 'from-yellow-500 to-orange-500',
        pulse: true,
        icon: Brain,
        message: 'Inicializando...'
      };
    }

    if (isSpeaking) {
      return {
        color: 'from-green-500 to-emerald-500',
        pulse: false,
        icon: Volume2,
        message: 'Hablando...'
      };
    }

    if (isProcessing) {
      return {
        color: 'from-purple-500 to-pink-500',
        pulse: true,
        icon: Brain,
        message: 'Procesando...'
      };
    }

    if (isListening) {
      return {
        color: 'from-blue-500 to-cyan-500',
        pulse: true,
        icon: Mic,
        message: 'Te escucho...'
      };
    }

    return {
      color: 'from-indigo-600 to-purple-600',
      pulse: false,
      icon: MicOff,
      message: 'Toca para hablar'
    };
  };

  const currentState = getVisualState();
  const isActive = isListening || isProcessing || isSpeaking;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botón principal */}
      <motion.button
        onClick={isActive ? stopListening : startListening}
        disabled={!isReady}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentState.color} flex items-center justify-center shadow-2xl transition-all duration-300`}
        whileHover={{ scale: isReady ? 1.05 : 1 }}
        whileTap={{ scale: isReady ? 0.95 : 1 }}
        animate={{
          boxShadow: currentState.pulse 
            ? [
                '0 0 0 0 rgba(59, 130, 246, 0.7)',
                '0 0 0 20px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0.7)'
              ]
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        transition={{
          boxShadow: {
            duration: 1.5,
            repeat: currentState.pulse ? Infinity : 0,
            ease: "easeInOut"
          }
        }}
      >
        <currentState.icon size={28} className="text-white drop-shadow-lg" />
        
        {/* Indicador de actividad */}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </motion.button>

      {/* Mensaje de estado */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        className="absolute bottom-24 right-0 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm whitespace-nowrap border border-white/20"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            !isReady ? 'bg-yellow-400' :
            isSpeaking ? 'bg-green-400' :
            isProcessing ? 'bg-purple-400' :
            isListening ? 'bg-blue-400' :
            'bg-gray-400'
          }`} />
          {currentState.message}
        </div>
      </motion.div>

      {/* Indicador de sistema listo */}
      {isReady && !isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
        />
      )}
    </div>
  );
}
