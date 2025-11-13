import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, Brain, AlertCircle, CheckCircle, Loader, Smartphone } from 'lucide-react';
import { MOBILE_CONFIG, getDeviceConfig, applyMobileOptimizations } from '../../utils/mobileConfig';

/**
 * Sistema de Voz Optimizado para Móviles
 * Maneja las limitaciones específicas de dispositivos móviles
 */
export function MobileVoiceSystem() {
  // Estados del sistema
  const [systemState, setSystemState] = useState('initializing');
  const [conversationState, setConversationState] = useState('idle');
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState('prompt');
  
  // Referencias
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);
  const touchStartRef = useRef(null);
  
  // Stores
  const { receiveAttention, createMemory, strengthenFriendship } = useAvatarLifeStore();
  const { send, isConnected } = useWebSocket();
  const { addMessage, messages } = useBotStore();

  // Detectar dispositivo móvil y aplicar optimizaciones
  useEffect(() => {
    const config = getDeviceConfig();
    setIsMobile(config.isMobile);
    
    if (config.isMobile) {
      applyMobileOptimizations();
      console.log('📱 Mobile device detected and optimized');
    }

    const handleResize = () => {
      const newConfig = getDeviceConfig();
      setIsMobile(newConfig.isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función de logging optimizada para móviles
  const log = useCallback((level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const prefix = isMobile ? '📱' : '💻';
    console.log(`${prefix} [MobileVoice] ${level.toUpperCase()}: ${message}`, data);
  }, [isMobile]);

  // Verificar permisos de micrófono
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        log('error', 'MediaDevices API not supported');
        return 'denied';
      }

      // En móviles, necesitamos interacción del usuario primero
      if (isMobile && !userInteracted) {
        log('warn', 'Mobile device requires user interaction first');
        return 'prompt';
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      log('info', 'Microphone permission granted');
      setMicrophonePermission('granted');
      return 'granted';
    } catch (error) {
      log('error', 'Microphone permission error', error);
      if (error.name === 'NotAllowedError') {
        setMicrophonePermission('denied');
        return 'denied';
      }
      return 'prompt';
    }
  }, [isMobile, userInteracted, log]);

  // Inicializar sistema optimizado para móviles
  const initializeSystem = useCallback(async () => {
    log('info', 'Initializing Mobile Voice System...');
    setSystemState('initializing');

    try {
      // Verificar APIs básicas
      const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
      const hasSpeechSynthesis = 'speechSynthesis' in window;
      
      if (!hasWebkitSpeech) {
        throw new Error('Speech Recognition not supported on this mobile browser');
      }

      if (!hasSpeechSynthesis) {
        throw new Error('Speech Synthesis not supported on this mobile browser');
      }

      // En móviles, esperar interacción del usuario
      if (isMobile && !userInteracted) {
        log('info', 'Waiting for user interaction on mobile device');
        setSystemState('waiting_interaction');
        return;
      }

      // Verificar permisos de micrófono
      const micPermission = await checkMicrophonePermission();
      if (micPermission === 'denied') {
        throw new Error('Microphone permission denied');
      }

      // Inicializar voces (crítico en móviles)
      await initializeMobileVoices();
      
      setSystemState('ready');
      log('info', 'Mobile Voice System initialized successfully');
      
    } catch (error) {
      log('error', 'Mobile system initialization failed', error);
      setSystemState('error');
    }
  }, [isMobile, userInteracted, checkMicrophonePermission, log]);

  // Inicializar voces específicamente para móviles
  const initializeMobileVoices = useCallback(() => {
    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        log('info', `Found ${voices.length} voices on mobile device`);
        
        if (voices.length > 0) {
          const spanishVoices = voices.filter(v => v.lang.includes('es'));
          log('info', `Found ${spanishVoices.length} Spanish voices`);
          resolve(true);
        }
      };

      // En móviles, las voces pueden tardar más en cargar
      checkVoices();
      
      speechSynthesis.onvoiceschanged = () => {
        checkVoices();
        speechSynthesis.onvoiceschanged = null;
      };

      // Timeout más largo para móviles
      setTimeout(() => {
        if (speechSynthesis.onvoiceschanged) {
          speechSynthesis.onvoiceschanged = null;
          log('warn', 'Voice loading timeout on mobile, proceeding anyway');
          resolve(true);
        }
      }, 5000); // 5 segundos para móviles
    });
  }, [log]);

  // Crear reconocimiento optimizado para móviles
  const createMobileSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      log('error', 'Speech recognition not supported on this mobile browser');
      return null;
    }

    const recognition = new webkitSpeechRecognition();
    
    // Configuración optimizada para móviles
    recognition.continuous = false; // Mejor para móviles
    recognition.interimResults = false; // Evita problemas en móviles
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      log('info', 'Mobile speech recognition started');
      setConversationState('listening');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        log('info', 'Mobile transcript received', { transcript: finalTranscript });
        handleMobileUserSpeech(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      log('error', 'Mobile speech recognition error', { error: event.error });
      setConversationState('idle');
      
      // Manejo específico de errores móviles
      if (event.error === 'not-allowed') {
        setMicrophonePermission('denied');
        alert('🎤 Necesito permisos de micrófono para funcionar. Por favor, permite el acceso y recarga la página.');
      } else if (event.error === 'network') {
        log('warn', 'Network error on mobile, will retry');
        setTimeout(() => {
          if (conversationState === 'listening') {
            startMobileListening();
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      log('info', 'Mobile speech recognition ended');
      if (conversationState === 'listening') {
        setConversationState('idle');
      }
    };

    return recognition;
  }, [conversationState, log]);

  // Manejar entrada de voz en móviles
  const handleMobileUserSpeech = useCallback(async (transcript) => {
    if (!transcript || transcript.length < 2) {
      log('warn', 'Mobile transcript too short, ignoring');
      return;
    }

    log('info', 'Processing mobile user speech', { transcript });
    setConversationState('processing');

    try {
      const userMessage = {
        role: 'user',
        content: transcript,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        metadata: { source: 'mobile_voice' }
      };

      addMessage(userMessage);

      // Enviar al backend
      send({
        type: 'text_message',
        text: transcript,
        id: userMessage.id,
        metadata: {
          voice_conversation: true,
          mobile_device: true,
          timestamp: Date.now()
        }
      });

      log('info', 'Mobile message sent to backend');

      // Actualizar estados del avatar
      receiveAttention('mobile_voice_conversation');
      strengthenFriendship('mobile_natural_conversation', 1.5);

      // Timeout más largo para móviles (conexión puede ser más lenta)
      timeoutRef.current = setTimeout(() => {
        if (conversationState === 'processing') {
          log('warn', 'Mobile processing timeout, returning to idle');
          setConversationState('idle');
          
          // Mostrar mensaje de error al usuario
          addMessage({
            role: 'assistant',
            content: 'Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?',
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            metadata: { 
              source: 'mobile_timeout',
              error: true 
            }
          });
        }
      }, 15000); // 15 segundos para móviles (reducido)

    } catch (error) {
      log('error', 'Failed to process mobile user speech', error);
      setConversationState('idle');
    }
  }, [send, addMessage, receiveAttention, strengthenFriendship, conversationState, log]);

  // Síntesis de voz optimizada para móviles
  const speakMobileResponse = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) {
      log('warn', 'Cannot speak on mobile: no text or synthesis not supported');
      return;
    }

    log('info', 'Speaking mobile response', { text: text.substring(0, 50) + '...' });
    setConversationState('speaking');

    // Cancelar speech anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configuración optimizada para móviles
    utterance.lang = 'es-ES';
    utterance.rate = 0.8; // Más lento para móviles
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Volumen máximo para móviles

    // Seleccionar mejor voz para móviles
    const voices = speechSynthesis.getVoices();
    const mobileSpanishVoice = voices.find(voice => 
      voice.lang.includes('es-ES') && !voice.name.includes('Google') // Evitar voces que pueden fallar en móviles
    ) || voices.find(voice => voice.lang.includes('es'));

    if (mobileSpanishVoice) {
      utterance.voice = mobileSpanishVoice;
      log('info', 'Using mobile Spanish voice', { voice: mobileSpanishVoice.name });
    }

    utterance.onstart = () => {
      log('info', 'Mobile speech synthesis started');
    };

    utterance.onend = () => {
      log('info', 'Mobile speech synthesis completed');
      setConversationState('idle');
      utteranceRef.current = null;
    };

    utterance.onerror = (error) => {
      log('error', 'Mobile speech synthesis error', error);
      setConversationState('idle');
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [log]);

  // Iniciar escucha en móviles
  const startMobileListening = useCallback(async () => {
    if (systemState !== 'ready') {
      log('warn', 'Cannot start mobile listening: system not ready');
      return;
    }

    // Marcar interacción del usuario
    if (!userInteracted) {
      setUserInteracted(true);
    }

    try {
      // Verificar permisos nuevamente
      const permission = await checkMicrophonePermission();
      if (permission !== 'granted') {
        alert('🎤 Necesito acceso al micrófono para escucharte. Por favor, permite el acceso cuando te lo solicite.');
        return;
      }

      // Crear y iniciar reconocimiento
      const recognition = createMobileSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        log('info', 'Started mobile listening for user input');
      }
    } catch (error) {
      log('error', 'Failed to start mobile listening', error);
      alert('❌ Error al acceder al micrófono. Verifica los permisos y vuelve a intentar.');
    }
  }, [systemState, userInteracted, checkMicrophonePermission, createMobileSpeechRecognition, log]);

  // Detener conversación
  const stopMobileConversation = useCallback(() => {
    log('info', 'Stopping mobile conversation');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setConversationState('idle');
  }, [log]);

  // Manejar interacción inicial en móviles
  const handleMobileInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      log('info', 'User interaction detected on mobile');
      
      if (systemState === 'waiting_interaction') {
        initializeSystem();
      }
    }
  }, [userInteracted, systemState, initializeSystem, log]);

  // Escuchar respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        conversationState === 'processing') {
      
      clearTimeout(timeoutRef.current);
      speakMobileResponse(lastMessage.content);
    }
  }, [messages, conversationState, speakMobileResponse]);

  // Inicialización del sistema
  useEffect(() => {
    initializeSystem();
    
    return () => {
      stopMobileConversation();
    };
  }, [initializeSystem, stopMobileConversation]);

  // Obtener estado visual
  const getVisualState = () => {
    if (systemState === 'initializing') {
      return {
        color: 'from-yellow-500 to-orange-500',
        pulse: true,
        icon: Loader,
        message: 'Inicializando para móvil...',
        bgColor: 'bg-yellow-500'
      };
    }

    if (systemState === 'waiting_interaction') {
      return {
        color: 'from-blue-500 to-cyan-500',
        pulse: true,
        icon: Smartphone,
        message: 'Toca para activar',
        bgColor: 'bg-blue-500'
      };
    }

    if (systemState === 'error') {
      return {
        color: 'from-red-500 to-red-600',
        pulse: false,
        icon: AlertCircle,
        message: 'Error del sistema',
        bgColor: 'bg-red-500'
      };
    }

    if (systemState !== 'ready') {
      return {
        color: 'from-gray-500 to-gray-600',
        pulse: false,
        icon: MicOff,
        message: 'Sistema no disponible',
        bgColor: 'bg-gray-500'
      };
    }

    switch (conversationState) {
      case 'listening':
        return {
          color: 'from-green-500 to-emerald-500',
          pulse: true,
          icon: Mic,
          message: 'Escuchando...',
          bgColor: 'bg-green-500'
        };
      case 'processing':
        return {
          color: 'from-purple-500 to-pink-500',
          pulse: true,
          icon: Brain,
          message: 'Procesando...',
          bgColor: 'bg-purple-500'
        };
      case 'speaking':
        return {
          color: 'from-blue-500 to-indigo-500',
          pulse: false,
          icon: Volume2,
          message: 'Hablando...',
          bgColor: 'bg-blue-500'
        };
      default:
        return {
          color: 'from-indigo-600 to-purple-600',
          pulse: false,
          icon: Mic,
          message: isMobile ? 'Toca para hablar' : 'Presiona para hablar',
          bgColor: 'bg-indigo-600'
        };
    }
  };

  const currentState = getVisualState();
  const isActive = conversationState !== 'idle';
  const canInteract = (systemState === 'ready' || systemState === 'waiting_interaction') && !isActive;

  const handleButtonPress = () => {
    if (systemState === 'waiting_interaction') {
      handleMobileInteraction();
    } else if (canInteract) {
      startMobileListening();
    } else if (isActive) {
      stopMobileConversation();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botón principal optimizado para móviles */}
      <motion.button
        onClick={handleButtonPress}
        onTouchStart={(e) => {
          touchStartRef.current = Date.now();
          handleMobileInteraction();
        }}
        disabled={systemState === 'error'}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentState.color} 
          flex items-center justify-center shadow-2xl transition-all duration-300
          ${systemState !== 'error' ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-75'}
          ${isMobile ? 'touch-manipulation' : ''}`}
        whileHover={systemState !== 'error' ? { scale: 1.05 } : {}}
        whileTap={systemState !== 'error' ? { scale: 0.95 } : {}}
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
        
        {/* Indicador móvil */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -left-1 w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
          >
            <Smartphone size={12} className="text-white" />
          </motion.div>
        )}

        {/* Indicador de sistema listo */}
        <AnimatePresence>
          {systemState === 'ready' && !isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            >
              <CheckCircle size={14} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mensaje de estado optimizado para móviles */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        className="absolute bottom-24 right-0 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm whitespace-nowrap border border-white/20"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            systemState === 'ready' ? 'bg-green-400' :
            systemState === 'waiting_interaction' ? 'bg-blue-400' :
            systemState === 'initializing' ? 'bg-yellow-400' :
            systemState === 'error' ? 'bg-red-400' :
            'bg-gray-400'
          }`} />
          {currentState.message}
          {isMobile && <span className="text-xs opacity-75">📱</span>}
        </div>
      </motion.div>

      {/* Instrucciones específicas para móviles */}
      {isMobile && systemState === 'waiting_interaction' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-32 right-0 bg-blue-600/90 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-xs border border-blue-400/30"
        >
          <div className="font-bold mb-1">📱 Dispositivo Móvil</div>
          <div>Toca el botón para activar el micrófono y comenzar a conversar</div>
        </motion.div>
      )}
    </div>
  );
}
