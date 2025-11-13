import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, Brain } from 'lucide-react';

export function PerfectVoiceSystem() {
  const { 
    vitalStats, 
    currentMood, 
    friendship,
    receiveAttention,
    createMemory,
    strengthenFriendship
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage, messages } = useBotStore();
  
  // Estados del sistema de voz perfecto
  const [conversationState, setConversationState] = useState('idle'); // idle, listening, processing, speaking
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState(null);
  const [speechBuffer, setSpeechBuffer] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [conversationActive, setConversationActive] = useState(false);
  
  // Referencias para el sistema de voz
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const processingTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const conversationBufferRef = useRef([]);

  // Configuración avanzada del reconocimiento de voz
  const initializeVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    const recognition = new webkitSpeechRecognition();
    
    // Configuración óptima para conversación natural
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;
    
    // Configuraciones avanzadas para mejor precisión
    if (recognition.serviceURI) {
      recognition.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
    }

    let finalTranscript = '';
    let interimTranscript = '';
    let lastResultTime = Date.now();

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setConversationState('listening');
      finalTranscript = '';
      interimTranscript = '';
    };

    recognition.onresult = (event) => {
      finalTranscript = '';
      interimTranscript = '';
      lastResultTime = Date.now();

      // Procesar todos los resultados
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Actualizar buffer de speech
      const currentTranscript = finalTranscript || interimTranscript;
      setSpeechBuffer(currentTranscript);

      // Si tenemos un resultado final, procesarlo
      if (finalTranscript.trim()) {
        handleSpeechInput(finalTranscript.trim());
        finalTranscript = '';
      }

      // Detectar pausa en el habla para auto-procesar
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if (interimTranscript.trim() && !finalTranscript.trim()) {
          console.log('🔄 Auto-processing interim result due to silence');
          handleSpeechInput(interimTranscript.trim());
          interimTranscript = '';
        }
      }, 2000); // 2 segundos de silencio
    };

    recognition.onerror = (event) => {
      console.error('🚨 Speech recognition error:', event.error);
      
      // Manejar errores específicos
      switch (event.error) {
        case 'network':
          console.log('🌐 Network error, retrying...');
          setTimeout(() => restartRecognition(), 2000);
          break;
        case 'not-allowed':
          console.log('🚫 Microphone access denied');
          setConversationState('idle');
          break;
        case 'no-speech':
          console.log('🔇 No speech detected, continuing...');
          // No hacer nada, es normal
          break;
        default:
          setTimeout(() => restartRecognition(), 1000);
      }
    };

    recognition.onend = () => {
      console.log('🏁 Speech recognition ended');
      
      // Reiniciar automáticamente si la conversación está activa
      if (conversationActive && conversationState !== 'speaking') {
        setTimeout(() => {
          if (conversationActive) {
            restartRecognition();
          }
        }, 500);
      } else {
        setConversationState('idle');
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [conversationActive, conversationState]);

  // Función para reiniciar reconocimiento de forma inteligente
  const restartRecognition = useCallback(() => {
    if (recognitionRef.current && conversationActive && conversationState !== 'speaking') {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log('🔄 Recognition already running or starting');
      }
    }
  }, [conversationActive, conversationState]);

  // Configurar síntesis de voz perfecta
  const initializeVoiceSynthesis = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return false;
    }

    // Esperar a que las voces se carguen
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      // Buscar la mejor voz en español
      const preferredVoices = [
        // Voces de Google (mejor calidad)
        voices.find(v => v.name.includes('Google español') && v.name.includes('female')),
        voices.find(v => v.name.includes('Google') && v.lang.includes('es') && v.name.includes('female')),
        voices.find(v => v.name.includes('Google') && v.lang.includes('es')),
        
        // Voces de Microsoft
        voices.find(v => v.name.includes('Microsoft') && v.lang.includes('es') && v.name.includes('female')),
        voices.find(v => v.name.includes('Microsoft') && v.lang.includes('es')),
        
        // Voces del sistema
        voices.find(v => v.lang.includes('es-ES') && v.name.includes('female')),
        voices.find(v => v.lang.includes('es-ES')),
        voices.find(v => v.lang.includes('es'))
      ];

      const selectedVoice = preferredVoices.find(v => v) || voices[0];
      
      if (selectedVoice) {
        setVoiceConfig({
          voice: selectedVoice,
          rate: 0.9,
          pitch: 1.0,
          volume: 0.9
        });
        console.log('🎵 Selected voice:', selectedVoice.name);
        return true;
      }
      return false;
    };

    // Intentar cargar voces inmediatamente
    if (loadVoices()) {
      return true;
    }

    // Si no hay voces, esperar al evento
    speechSynthesis.onvoiceschanged = loadVoices;
    
    // Timeout de seguridad
    setTimeout(() => {
      if (!voiceConfig) {
        loadVoices();
      }
    }, 1000);

    return true;
  }, [voiceConfig]);

  // Manejar entrada de voz del usuario
  const handleSpeechInput = useCallback((transcript) => {
    if (!transcript || transcript.length < 2) return;

    console.log('🗣️ User said:', transcript);
    
    // Detener reconocimiento temporalmente
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setConversationState('processing');
    setSpeechBuffer('');
    lastSpeechTimeRef.current = Date.now();

    // Limpiar timeouts
    clearTimeout(silenceTimeoutRef.current);
    clearTimeout(processingTimeoutRef.current);

    // Agregar al buffer de conversación
    conversationBufferRef.current.push({
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    });

    // Enviar al bot con contexto mejorado
    const contextualMessage = {
      type: 'text_message',
      text: transcript,
      id: crypto.randomUUID(),
      metadata: {
        voice_conversation: {
          is_natural: true,
          conversation_flow: conversationState,
          emotional_context: currentMood.primary,
          friendship_level: friendship.level,
          conversation_history: conversationBufferRef.current.slice(-5)
        }
      }
    };

    send(contextualMessage);

    addMessage({
      role: 'user',
      content: transcript,
      id: crypto.randomUUID(),
      metadata: { voice_input: true }
    });

    // Actualizar estados
    receiveAttention('voice_conversation');
    strengthenFriendship('natural_conversation', 1.3);

    // Timeout de seguridad para respuesta
    processingTimeoutRef.current = setTimeout(() => {
      if (conversationState === 'processing') {
        console.log('⏰ Processing timeout, resuming listening');
        setConversationState('listening');
        restartRecognition();
      }
    }, 10000); // 10 segundos máximo de procesamiento

  }, [conversationState, currentMood.primary, friendship.level, send, addMessage, receiveAttention, strengthenFriendship, restartRecognition]);

  // Hablar respuesta del bot
  const speakBotResponse = useCallback((text) => {
    if (!voiceConfig || !text) return Promise.resolve();

    return new Promise((resolve) => {
      // Cancelar cualquier speech anterior
      speechSynthesis.cancel();
      
      setConversationState('speaking');
      
      // Crear utterance con configuración perfecta
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voiceConfig.voice;
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = voiceConfig.volume;
      utterance.lang = 'es-ES';

      // Agregar al buffer de conversación
      conversationBufferRef.current.push({
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      });

      utterance.onstart = () => {
        console.log('🔊 Bot speaking:', text);
        setConversationState('speaking');
      };

      utterance.onend = () => {
        console.log('✅ Bot finished speaking');
        setConversationState('idle');
        
        // Crear memoria de la conversación
        createMemory(
          `Conversación de voz: Usuario: "${conversationBufferRef.current[conversationBufferRef.current.length - 2]?.content}" | Bot: "${text}"`,
          'voice_conversation',
          0.9
        );

        // Reanudar escucha después de hablar
        setTimeout(() => {
          if (conversationActive) {
            setConversationState('listening');
            restartRecognition();
          }
        }, 1000);
        
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('🚨 Speech synthesis error:', error);
        setConversationState('idle');
        resolve();
      };

      // Hablar
      speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    });
  }, [voiceConfig, conversationActive, createMemory, restartRecognition]);

  // Escuchar respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        conversationState === 'processing' &&
        conversationActive) {
      
      clearTimeout(processingTimeoutRef.current);
      speakBotResponse(lastMessage.content);
    }
  }, [messages, conversationState, conversationActive, speakBotResponse]);

  // Inicializar sistema de voz
  useEffect(() => {
    const initializeSystem = async () => {
      console.log('🚀 Initializing perfect voice system...');
      
      const recognitionReady = initializeVoiceRecognition();
      const synthesisReady = initializeVoiceSynthesis();
      
      if (recognitionReady && synthesisReady) {
        setIsSystemReady(true);
        console.log('✅ Perfect voice system ready');
      } else {
        console.error('❌ Voice system initialization failed');
      }
    };

    initializeSystem();

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      clearTimeout(silenceTimeoutRef.current);
      clearTimeout(processingTimeoutRef.current);
    };
  }, [initializeVoiceRecognition, initializeVoiceSynthesis]);

  // Iniciar conversación
  const startConversation = useCallback(() => {
    if (!isSystemReady) {
      console.error('❌ Voice system not ready');
      return;
    }

    setConversationActive(true);
    setConversationState('listening');
    
    // Iniciar reconocimiento
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log('🎤 Conversation started');
      } catch (error) {
        console.error('❌ Failed to start recognition:', error);
      }
    }
  }, [isSystemReady]);

  // Detener conversación
  const stopConversation = useCallback(() => {
    setConversationActive(false);
    setConversationState('idle');
    
    // Detener reconocimiento
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Detener síntesis
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Limpiar timeouts
    clearTimeout(silenceTimeoutRef.current);
    clearTimeout(processingTimeoutRef.current);
    
    console.log('🛑 Conversation stopped');
  }, []);

  // Obtener estado visual
  const getVisualState = () => {
    switch (conversationState) {
      case 'listening':
        return { 
          color: 'from-blue-500 to-cyan-500', 
          pulse: true, 
          icon: Mic,
          message: 'Te escucho...',
          glow: 'shadow-blue-500/50'
        };
      case 'processing':
        return { 
          color: 'from-purple-500 to-pink-500', 
          pulse: true, 
          icon: Brain,
          message: 'Procesando...',
          glow: 'shadow-purple-500/50'
        };
      case 'speaking':
        return { 
          color: 'from-green-500 to-emerald-500', 
          pulse: false, 
          icon: Volume2,
          message: 'Hablando...',
          glow: 'shadow-green-500/50'
        };
      default:
        return { 
          color: 'from-gray-600 to-gray-700', 
          pulse: false, 
          icon: conversationActive ? Mic : MicOff,
          message: isSystemReady ? 'Toca para hablar' : 'Inicializando...',
          glow: 'shadow-gray-500/30'
        };
    }
  };

  const currentState = getVisualState();

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botón principal de conversación */}
      <motion.button
        onClick={conversationActive ? stopConversation : startConversation}
        disabled={!isSystemReady}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentState.color} flex items-center justify-center shadow-2xl ${currentState.glow} transition-all duration-300`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: currentState.pulse 
            ? [
                '0 0 0 0 rgba(59, 130, 246, 0.7)',
                '0 0 0 20px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0.7)'
              ]
            : `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
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
        {conversationActive && (
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
      {(conversationActive || !isSystemReady) && (
        <motion.div
          initial={{ opacity: 0, y: 10, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10, x: 20 }}
          className="absolute bottom-24 right-0 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm whitespace-nowrap border border-white/20"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              conversationState === 'listening' ? 'bg-blue-400' :
              conversationState === 'processing' ? 'bg-purple-400' :
              conversationState === 'speaking' ? 'bg-green-400' :
              'bg-gray-400'
            }`} />
            {currentState.message}
          </div>
          
          {/* Buffer de speech en tiempo real */}
          {speechBuffer && conversationState === 'listening' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-white/70 max-w-48 truncate"
            >
              "{speechBuffer}..."
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Indicador de sistema listo */}
      {isSystemReady && !conversationActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
        />
      )}
    </div>
  );
}
