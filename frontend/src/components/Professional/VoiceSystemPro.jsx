import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { Mic, MicOff, Volume2, Brain, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * Sistema de Voz Profesional
 * Implementación de clase mundial para conversaciones por voz
 */
export function VoiceSystemPro() {
  // Estados del sistema
  const [systemState, setSystemState] = useState('initializing');
  const [conversationState, setConversationState] = useState('idle');
  
  // Referencias
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Stores
  const { receiveAttention, createMemory, strengthenFriendship } = useAvatarLifeStore();
  const { send, isConnected } = useWebSocket();
  const { addMessage, messages } = useBotStore();

  // Función de logging profesional
  const log = useCallback((level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`💻 [VoiceSystemPro] ${level.toUpperCase()}: ${message}`, data);
  }, []);

  // Ejecutar diagnósticos del sistema
  const runDiagnostics = useCallback(async () => {
    log('info', 'Running system diagnostics...');
    
    const diagnostics = {
      speechRecognition: {
        supported: 'webkitSpeechRecognition' in window,
        available: false
      },
      speechSynthesis: {
        supported: 'speechSynthesis' in window,
        voicesLoaded: false,
        voiceCount: 0
      },
      webSocket: {
        connected: isConnected,
        status: isConnected ? 'connected' : 'disconnected'
      },
      microphone: {
        permission: 'unknown',
        available: false
      }
    };

    // Verificar reconocimiento de voz
    if (diagnostics.speechRecognition.supported) {
      try {
        const recognition = new webkitSpeechRecognition();
        diagnostics.speechRecognition.available = true;
      } catch (error) {
        log('warn', 'Speech recognition not available', error);
      }
    }

    // Verificar síntesis de voz
    if (diagnostics.speechSynthesis.supported) {
      const voices = speechSynthesis.getVoices();
      diagnostics.speechSynthesis.voiceCount = voices.length;
      diagnostics.speechSynthesis.voicesLoaded = voices.length > 0;
    }

    // Verificar micrófono
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        diagnostics.microphone.permission = 'granted';
        diagnostics.microphone.available = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        diagnostics.microphone.permission = error.name === 'NotAllowedError' ? 'denied' : 'prompt';
      }
    }

    log('info', 'Diagnostics completed', diagnostics);
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
      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          log('info', `Found ${voices.length} voices available`);
          const spanishVoices = voices.filter(v => v.lang.includes('es'));
          log('info', `Found ${spanishVoices.length} Spanish voices`);
          resolve(true);
        }
      };

      checkVoices();
      
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          checkVoices();
          speechSynthesis.onvoiceschanged = null;
        };
      }

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
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      log('info', 'Speech recognition started');
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
        log('info', 'Transcript received', { transcript: finalTranscript });
        handleUserSpeech(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      log('error', 'Speech recognition error', { error: event.error });
      setConversationState('idle');
      
      if (event.error === 'not-allowed') {
        alert('🎤 Necesito permisos de micrófono para funcionar. Por favor, permite el acceso y recarga la página.');
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
    if (!transcript || transcript.length < 2) {
      log('warn', 'Transcript too short, ignoring');
      return;
    }

    log('info', 'Processing user speech', { transcript });
    setConversationState('processing');

    try {
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

  // Seleccionar la mejor voz española disponible (Desktop)
  const getBestDesktopSpanishVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    
    // Prioridad de voces para desktop (mejor calidad)
    const voicePriority = [
      // Voces premium y de alta calidad
      (v) => v.lang.includes('es-ES') && (v.name.includes('Premium') || v.name.includes('Enhanced')),
      (v) => v.lang.includes('es-MX') && (v.name.includes('Premium') || v.name.includes('Enhanced')),
      
      // Voces nativas del sistema (mejor calidad en desktop)
      (v) => v.lang.includes('es-ES') && v.localService,
      (v) => v.lang.includes('es-MX') && v.localService,
      (v) => v.lang.includes('es-AR') && v.localService,
      
      // Voces específicas de alta calidad conocidas
      (v) => v.name.includes('Monica') || v.name.includes('Mónica'), // Voz española femenina
      (v) => v.name.includes('Jorge'), // Voz española masculina
      (v) => v.name.includes('Paulina'), // Voz mexicana femenina
      (v) => v.name.includes('Carlos'), // Voz mexicana masculina
      (v) => v.name.includes('Esperanza'), // Voz latina
      
      // Google voces (buena calidad en desktop)
      (v) => v.lang.includes('es-ES') && v.name.includes('Google'),
      (v) => v.lang.includes('es-MX') && v.name.includes('Google'),
      
      // Cualquier voz española disponible
      (v) => v.lang.includes('es-ES'),
      (v) => v.lang.includes('es-MX'),
      (v) => v.lang.includes('es-AR'),
      (v) => v.lang.includes('es')
    ];

    for (const matcher of voicePriority) {
      const voice = voices.find(matcher);
      if (voice) {
        log('info', `Selected desktop voice: ${voice.name} (${voice.lang})`, {
          localService: voice.localService,
          default: voice.default,
          voiceURI: voice.voiceURI
        });
        return voice;
      }
    }

    log('warn', 'No Spanish voice found for desktop, using default');
    return null;
  }, [log]);

  // Dividir texto en chunks inteligentes para desktop
  const splitTextIntoSentences = useCallback((text, maxLength = 180) => {
    // Dividir por oraciones completas para mejor fluidez
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if ((currentChunk + ' ' + trimmedSentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }, []);

  // Síntesis de voz mejorada para desktop con chunks y mejor calidad
  const speakResponse = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) {
      log('warn', 'Cannot speak: no text or synthesis not supported');
      return;
    }

    log('info', 'Speaking desktop response', { 
      textLength: text.length,
      preview: text.substring(0, 60) + '...' 
    });
    
    setConversationState('speaking');

    // Cancelar speech anterior completamente
    speechSynthesis.cancel();
    
    // Esperar un momento para asegurar cancelación
    setTimeout(() => {
      // Dividir texto en chunks para evitar cortes
      const chunks = splitTextIntoSentences(text, 160);
      log('info', `Desktop text split into ${chunks.length} chunks`);

      let currentChunkIndex = 0;
      let isCompleted = false;

      const speakChunk = () => {
        if (isCompleted || currentChunkIndex >= chunks.length) {
          if (!isCompleted) {
            log('info', 'All desktop chunks spoken successfully');
            setConversationState('idle');
            utteranceRef.current = null;
            isCompleted = true;
          }
          return;
        }

        const chunk = chunks[currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunk);
        
        // Configuración optimizada para desktop (más natural)
        utterance.lang = 'es-ES';
        utterance.rate = 1.0; // Velocidad natural para desktop
        utterance.pitch = 1.05; // Pitch ligeramente más natural
        utterance.volume = 0.95; // Volumen óptimo

        // Usar la mejor voz disponible
        const bestVoice = getBestDesktopSpanishVoice();
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.onstart = () => {
          log('info', `Speaking desktop chunk ${currentChunkIndex + 1}/${chunks.length}`, {
            chunkText: chunk.substring(0, 30) + '...'
          });
        };

        utterance.onend = () => {
          if (!isCompleted) {
            currentChunkIndex++;
            // Pausa muy breve entre chunks para naturalidad
            setTimeout(speakChunk, 50);
          }
        };

        utterance.onerror = (error) => {
          log('error', 'Desktop speech synthesis error', { 
            error: error.error,
            chunk: currentChunkIndex,
            chunkText: chunk.substring(0, 30) + '...'
          });
          
          // Intentar continuar con el siguiente chunk
          if (!isCompleted) {
            currentChunkIndex++;
            if (currentChunkIndex < chunks.length) {
              setTimeout(speakChunk, 100);
            } else {
              setConversationState('idle');
              utteranceRef.current = null;
              isCompleted = true;
            }
          }
        };

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      };

      // Iniciar la reproducción del primer chunk
      speakChunk();
    }, 100);
  }, [log, getBestDesktopSpanishVoice, splitTextIntoSentences]);

  // Iniciar escucha
  const startListening = useCallback(async () => {
    if (!isConnected) {
      log('warn', 'Cannot start listening: WebSocket is not connected yet');
      return;
    }

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
  }, [systemState, createSpeechRecognition, log, isConnected]);

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
      speakResponse(lastMessage.content);
    }
  }, [messages, conversationState, speakResponse]);

  // Inicialización del sistema
  useEffect(() => {
    initializeSystem();
    
    return () => {
      stopConversation();
    };
  }, [initializeSystem, stopConversation]);

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

    if (!isConnected) {
      return {
        color: 'from-indigo-500 to-indigo-700',
        pulse: true,
        icon: Loader,
        message: 'Conectando con GBot...',
        bgColor: 'bg-indigo-500'
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
          message: 'Presiona para hablar',
          bgColor: 'bg-indigo-600'
        };
    }
  };

  const currentState = getVisualState();
  const isActive = conversationState !== 'idle';
  const canInteract = systemState === 'ready' && !isActive && isConnected;

  const handleButtonPress = () => {
    if (canInteract) {
      startListening();
    } else if (isActive) {
      stopConversation();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botón principal */}
      <motion.button
        onClick={handleButtonPress}
        disabled={systemState === 'error' || !isConnected}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentState.color} 
          flex items-center justify-center shadow-2xl transition-all duration-300
          ${systemState !== 'error' && isConnected ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-75'}`}
        whileHover={systemState !== 'error' && isConnected ? { scale: 1.05 } : {}}
        whileTap={systemState !== 'error' && isConnected ? { scale: 0.95 } : {}}
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
    </div>
  );
}
