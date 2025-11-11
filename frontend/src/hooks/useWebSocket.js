import { useEffect, useRef, useCallback } from 'react';
import { useBotStore } from '../store/botStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const { setWebSocket, setConnected, setState, addMessage, setCurrentTranscript } = useBotStore();
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setWebSocket(ws);
        reconnectAttemptsRef.current = 0;
        // Toast removido - conexión silenciosa
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Toast removido - error silencioso
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        setWebSocket(null);
        
        // Intentar reconectar
        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          // Toast removido - reconexión silenciosa
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      // Toast removido - error silencioso
    }
  }, [token, setConnected, setWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
    setWebSocket(null);
  }, [setConnected, setWebSocket]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  const playAudio = useCallback(async (base64Audio, format) => {
    try {
      // Activar estado de speaking
      const { setSpeaking } = useBotStore.getState();
      setSpeaking(true);
      
      // Convertir base64 a ArrayBuffer
      const binaryString = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Usar Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          console.log('Audio finished playing');
          setSpeaking(false);
          audioContext.close();
        };
        
        source.start(0);
        console.log('Audio started playing via Web Audio API');
        
      } catch (decodeError) {
        console.error('Error decoding audio:', decodeError);
        toast.error('Error al decodificar el audio');
        setSpeaking(false);
        audioContext.close();
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      const { setSpeaking } = useBotStore.getState();
      setSpeaking(false);
    }
  }, []);

  const handleMessage = (data) => {
    switch (data.type) {
      case 'connected':
        console.log('Session established:', data.sessionId);
        break;

      case 'state_change':
        setState(data.state);
        break;

      case 'audio_delta':
        // Manejar chunk de audio
        break;

      case 'text_delta':
        setCurrentTranscript(prev => prev + data.text);
        break;

      case 'transcription':
        // Mostrar transcripción del audio
        addMessage({
          role: 'user',
          content: data.text
        });
        break;

      case 'processing':
        // El bot está procesando el mensaje
        console.log('Processing:', data.text);
        break;

      case 'response':
        addMessage({
          role: 'assistant',
          content: data.text
        });
        setCurrentTranscript('');
        break;

      case 'audio_response':
        // Reproducir audio del bot
        playAudio(data.audio, data.format);
        break;

      case 'function_call':
        addMessage({
          role: 'system',
          content: `Ejecutando: ${data.function}`,
          metadata: data.arguments
        });
        break;

      case 'error':
        toast.error(data.message);
        break;

      case 'proactive_message':
        // Mensaje proactivo del bot
        addMessage({
          role: 'assistant',
          content: data.message,
          isProactive: true
        });
        
        // Cambiar emoción del bot
        if (data.emotion) {
          useBotStore.getState().setState(data.emotion);
        }
        
        // Reproducir con voz si está disponible
        if (data.message) {
          // Opcional: generar TTS para mensajes proactivos
        }
        break;

      case 'idle_animation':
        // Animación de idle
        if (data.emotion) {
          const currentState = useBotStore.getState().state;
          if (currentState === 'idle') {
            useBotStore.getState().setState(data.emotion);
            // Volver a idle después de la animación
            setTimeout(() => {
              useBotStore.getState().setState('idle');
            }, 2000);
          }
        }
        break;

      default:
        console.log('Unhandled message type:', data.type);
    }
  };

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    send,
    connect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
}
