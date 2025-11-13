import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, Brain, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * Sistema de Voz Profesional - Clase Mundial
 * Maneja reconocimiento de voz, síntesis y comunicación WebSocket
 * con diagnósticos completos y recuperación automática de errores
 */
export function VoiceSystemPro() {
  // Estados del sistema
  const [systemState, setSystemState] = useState('initializing'); // initializing, ready, error, disabled
  const [conversationState, setConversationState] = useState('idle'); // idle, listening, processing, speaking
  const [diagnostics, setDiagnostics] = useState({});
  const [errorLog, setErrorLog] = useState([]);
  
  // Referencias
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);
  const diagnosticIntervalRef = useRef(null);
  
  // Stores
  const { receiveAttention, createMemory, strengthenFriendship } = useAvatarLifeStore();
  const { send, isConnected } = useWebSocket();
  const { addMessage, messages } = useBotStore();

  // Función de logging profesional
  const log = useCallback((level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    
    console.log(`[VoiceSystemPro] ${level.toUpperCase()}: ${message}`, data);
    
    if (level === 'error') {
      setErrorLog(prev => [...prev.slice(-9), logEntry]); // Mantener últimos 10 errores
    }
  }, []);

  // Diagnóstico completo del sistema
  const runDiagnostics = useCallback(async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine
      },
      webSocket: {
        connected: isConnected,
        url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      },
      speechRecognition: {
        supported: 'webkitSpeechRecognition' in window,
        available: false,
        error: null
      },
      speechSynthesis: {
        supported: 'speechSynthesis' in window,
        voicesLoaded: false,
        voicesCount: 0,
        spanishVoices: 0,
        error: null
      },
      mediaDevices: {
        supported: 'mediaDevices' in navigator,
        microphoneAccess: false,
        error: null
      }
    };

    // Test Speech Recognition
    try {
      if ('webkitSpeechRecognition' in window) {
        const testRecognition = new webkitSpeechRecognition();
        diagnostics.speechRecognition.available = true;
      }
    } catch (error) {
      diagnostics.speechRecognition.error = error.message;
      log('error', 'Speech Recognition test failed', error);
    }

    // Test Speech Synthesis
    try {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        diagnostics.speechSynthesis.voicesLoaded = voices.length > 0;
        diagnostics.speechSynthesis.voicesCount = voices.length;
        diagnostics.speechSynthesis.spanishVoices = voices.filter(v => v.lang.includes('es')).length;
      }
    } catch (error) {
      diagnostics.speechSynthesis.error = error.message;
      log('error', 'Speech Synthesis test failed', error);
    }

    // Test Microphone Access
    try {
      if ('mediaDevices' in navigator) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        diagnostics.mediaDevices.microphoneAccess = true;
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      diagnostics.mediaDevices.error = error.message;
      log('warn', 'Microphone access test failed', error);
    }

    setDiagnostics(diagnostics);
    return diagnostics;
  }, [isConnected, log]);

  // Inicialización del sistema
  const initializeSystem = useCallback(async () => {
    log('info', 'Initializing Professional Voice System...');
    setSystemState('initializing');

    try {
      // Ejecutar diagnósticos
      const diagnostics = await runDiagnostics();
      
      // Verificar requisitos mínimos (WebSocket puede conectarse después)
      const hasMinimumRequirements = 
        diagnostics.speechRecognition.supported &&
        diagnostics.speechSynthesis.supported;

      if (!hasMinimumRequirements) {
        throw new Error('Speech APIs not supported in this browser');
      }

      // WebSocket se conectará automáticamente, no es requisito para inicialización
      if (!diagnostics.webSocket.connected) {
        log('warn', 'WebSocket not connected yet, but system can initialize');
      }

      // Inicializar Speech Synthesis con retry
      await initializeSpeechSynthesis();
      
      setSystemState('ready');
      log('info', 'Professional Voice System initialized successfully');
      
    } catch (error) {
      log('error', 'System initialization failed', error);
      setSystemState('error');
    }
  }, [runDiagnostics, log]);

  // Inicializar síntesis de voz
  const initializeSpeechSynthesis = useCallback(() => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(false);
        return;
      }

      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          log('info', `Speech synthesis ready with ${voices.length} voices`);
          resolve(true);
        } else {
          log('warn', 'No voices available yet, waiting...');
        }
      };

      // Verificar voces inmediatamente
      checkVoices();

      // Escuchar evento de carga de voces
      speechSynthesis.onvoiceschanged = () => {
        checkVoices();
        speechSynthesis.onvoiceschanged = null;
      };

      // Timeout de seguridad
      setTimeout(() => {
        if (speechSynthesis.onvoiceschanged) {
          speechSynthesis.onvoiceschanged = null;
          log('warn', 'Voice loading timeout, proceeding anyway');
          resolve(true);
        }
      }, 3000);
    });
  }, [log]);

  // Crear reconocimiento de voz
  const createSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      log('error', 'Speech recognition not supported');
      return null;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      log('info', 'Speech recognition started');
      setConversationState('listening');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        log('info', 'Final transcript received', { transcript: finalTranscript });
        handleUserSpeech(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      log('error', 'Speech recognition error', { error: event.error });
      setConversationState('idle');
      
      // Auto-retry en ciertos errores
      if (event.error === 'network' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (conversationState === 'listening') {
            startListening();
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      log('info', 'Speech recognition ended');
      if (conversationState === 'listening') {
        setConversationState('idle');
      }
    };

    return recognition;
  }, [conversationState, log]);

  // Manejar entrada de voz del usuario
  const handleUserSpeech = useCallback(async (transcript) => {
    if (!transcript || transcript.trim().length < 2) {
      log('warn', 'Transcript too short, ignoring');
      return;
    }

    log('info', 'Processing user speech', { transcript });
    setConversationState('processing');

    try {
      // Agregar mensaje del usuario
      const userMessage = {
        role: 'user',
        content: transcript.trim(),
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        metadata: { source: 'voice' }
      };

      addMessage(userMessage);

      // Enviar al backend (con retry automático si no está conectado)
      if (isConnected) {
        send({
          type: 'text_message',
          text: transcript.trim(),
          id: userMessage.id,
          metadata: {
            voice_conversation: true,
            timestamp: Date.now()
          }
        });

        log('info', 'Message sent to backend');
      } else {
        log('warn', 'WebSocket not connected, message will be queued');
        // El hook useWebSocket maneja automáticamente la cola y reconexión
        send({
          type: 'text_message',
          text: transcript.trim(),
          id: userMessage.id,
          metadata: {
            voice_conversation: true,
            timestamp: Date.now()
          }
        });
      }

      // Actualizar estados del avatar
      receiveAttention('voice_conversation');
      strengthenFriendship('natural_conversation', 1.5);

      // Timeout de seguridad
      timeoutRef.current = setTimeout(() => {
        if (conversationState === 'processing') {
          log('warn', 'Processing timeout, returning to idle');
          setConversationState('idle');
          
          // Mostrar mensaje de error al usuario
          addMessage({
            role: 'assistant',
            content: 'Disculpa, tuve un problema procesando tu mensaje. ¿Puedes repetir lo que dijiste?',
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            metadata: { 
              source: 'timeout_error',
              error: true 
            }
          });
        }
      }, 15000);

    } catch (error) {
      log('error', 'Failed to process user speech', error);
      setConversationState('idle');
    }
  }, [isConnected, send, addMessage, receiveAttention, strengthenFriendship, conversationState, log]);

  // Síntesis de voz para respuestas del bot
  const speakBotResponse = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) {
      log('warn', 'Cannot speak: no text or synthesis not supported');
      return;
    }

    log('info', 'Speaking bot response', { text: text.substring(0, 50) + '...' });
    setConversationState('speaking');

    // Cancelar speech anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Seleccionar mejor voz disponible
    const voices = speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.includes('es-ES') || 
      voice.lang.includes('es-MX') || 
      voice.lang.includes('es')
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
      log('info', 'Using Spanish voice', { voice: spanishVoice.name });
    }

    utterance.onstart = () => {
      log('info', 'Speech synthesis started');
    };

    utterance.onend = () => {
      log('info', 'Speech synthesis completed');
      setConversationState('idle');
      utteranceRef.current = null;
    };

    utterance.onerror = (error) => {
      log('error', 'Speech synthesis error', error);
      setConversationState('idle');
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [log]);

  // Iniciar escucha
  const startListening = useCallback(async () => {
    if (systemState !== 'ready') {
      log('warn', 'Cannot start listening: system not ready');
      return;
    }

    try {
      // Solicitar permisos de micrófono
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Crear y iniciar reconocimiento
      const recognition = createSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        log('info', 'Started listening for user input');
      }
    } catch (error) {
      log('error', 'Failed to start listening', error);
      alert('🎤 Necesito acceso al micrófono para escucharte. Por favor, permite el acceso y vuelve a intentar.');
    }
  }, [systemState, createSpeechRecognition, log]);

  // Detener conversación
  const stopConversation = useCallback(() => {
    log('info', 'Stopping conversation');
    
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

  // Escuchar respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && 
        lastMessage.role === 'assistant' && 
        conversationState === 'processing') {
      
      clearTimeout(timeoutRef.current);
      speakBotResponse(lastMessage.content);
    }
  }, [messages, conversationState, speakBotResponse]);

  // Inicialización del sistema
  useEffect(() => {
    initializeSystem();
    
    // Diagnósticos periódicos
    diagnosticIntervalRef.current = setInterval(runDiagnostics, 30000);
    
    return () => {
      stopConversation();
      if (diagnosticIntervalRef.current) {
        clearInterval(diagnosticIntervalRef.current);
      }
    };
  }, [initializeSystem, runDiagnostics, stopConversation]);

  // Obtener estado visual
  const getVisualState = () => {
    if (systemState === 'initializing') {
      return {
        color: 'from-yellow-500 to-orange-500',
        pulse: true,
        icon: Loader,
        message: 'Inicializando sistema...',
        bgColor: 'bg-yellow-500'
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
          color: 'from-blue-500 to-cyan-500',
          pulse: true,
          icon: Mic,
          message: 'Te escucho...',
          bgColor: 'bg-blue-500'
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
          color: 'from-green-500 to-emerald-500',
          pulse: false,
          icon: Volume2,
          message: 'Hablando...',
          bgColor: 'bg-green-500'
        };
      default:
        return {
          color: 'from-indigo-600 to-purple-600',
          pulse: false,
          icon: Mic,
          message: 'Toca para hablar',
          bgColor: 'bg-indigo-600'
        };
    }
  };

  const currentState = getVisualState();
  const isActive = conversationState !== 'idle';
  const canInteract = systemState === 'ready' && !isActive;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botón principal */}
      <motion.button
        onClick={canInteract ? startListening : stopConversation}
        disabled={systemState !== 'ready'}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentState.color} 
          flex items-center justify-center shadow-2xl transition-all duration-300
          ${systemState === 'ready' ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-75'}`}
        whileHover={systemState === 'ready' ? { scale: 1.05 } : {}}
        whileTap={systemState === 'ready' ? { scale: 0.95 } : {}}
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

        {/* Indicador de actividad */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={`absolute -top-1 -right-1 w-6 h-6 ${currentState.bgColor} rounded-full flex items-center justify-center border-2 border-white`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mensaje de estado */}
      <motion.div
        initial={{ opacity: 0, y: 10, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        className="absolute bottom-24 right-0 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm whitespace-nowrap border border-white/20"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            systemState === 'ready' ? 'bg-green-400' :
            systemState === 'initializing' ? 'bg-yellow-400' :
            systemState === 'error' ? 'bg-red-400' :
            'bg-gray-400'
          }`} />
          {currentState.message}
        </div>
      </motion.div>

      {/* Diagnósticos (solo en desarrollo) */}
      {import.meta.env.DEV && diagnostics.timestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-32 right-0 bg-black/95 backdrop-blur-sm rounded-lg p-3 text-xs text-white border border-white/20 max-w-xs"
        >
          <div className="font-bold mb-2">System Status</div>
          <div className="space-y-1">
            <div>WS: {diagnostics.webSocket?.connected ? '✅' : '❌'}</div>
            <div>Mic: {diagnostics.mediaDevices?.microphoneAccess ? '✅' : '❌'}</div>
            <div>Voices: {diagnostics.speechSynthesis?.voicesCount || 0} ({diagnostics.speechSynthesis?.spanishVoices || 0} ES)</div>
            {errorLog.length > 0 && (
              <div className="text-red-400 text-xs">
                Last Error: {errorLog[errorLog.length - 1]?.message}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
