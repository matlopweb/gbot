import { useEffect, useRef, useCallback } from 'react';
import { useBotStore } from '../store/botStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const WS_LOCK_KEY = '__GBOT_WS_LOCK__';
const WS_AUTO_KEY = '__GBOT_WS_AUTO__';
const WS_GLOBAL_KEY = '__GBOT_WS_INSTANCE__';

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const lastConnectAtRef = useRef(0);
  const lastAssistantRef = useRef({ text: '', ts: 0 });
  const pendingQueueRef = useRef([]);
  
  const { setWebSocket, setConnected, setState, addMessage, setCurrentTranscript, isConnected } = useBotStore();
  const { token } = useAuthStore();

  const releaseLock = () => {
    if (typeof window !== 'undefined') {
      window[WS_LOCK_KEY] = false;
    }
  };

  const connect = useCallback(() => {
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    // Reutilizar instancia global si existe
    if (typeof window !== 'undefined' && window[WS_GLOBAL_KEY]) {
      const gws = window[WS_GLOBAL_KEY];
      if (gws.readyState === WebSocket.OPEN || gws.readyState === WebSocket.CONNECTING) {
        console.info('Adopting global WebSocket instance');
        wsRef.current = gws;
        setWebSocket(gws);
        setConnected(gws.readyState === WebSocket.OPEN);
        return;
      }
    }

    // Evitar conectar si ya está OPEN o CONNECTING localmente
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.info('WebSocket already connected');
      return;
    }

    // Evitar conexiones paralelas entre múltiples montajes
    if (typeof window !== 'undefined') {
      if (window[WS_LOCK_KEY]) {
        console.info('WS lock present, skipping connect');
        return;
      }
      window[WS_LOCK_KEY] = true;
    }

    // Cooldown anti reconexiones agresivas
    const now = Date.now();
    const cooldown = 3000;
    if (now - lastConnectAtRef.current < cooldown) {
      console.info('Skipping connect due to cooldown');
      releaseLock();
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      if (typeof window !== 'undefined') window[WS_GLOBAL_KEY] = ws;

      ws.onopen = () => {
        console.info('WebSocket connected');
        setConnected(true);
        setWebSocket(ws);
        reconnectAttemptsRef.current = 0;
        lastConnectAtRef.current = Date.now();
        releaseLock();
        // Toast removido - conexión silenciosa

        if (pendingQueueRef.current.length > 0) {
          pendingQueueRef.current.forEach((queued) => {
            try {
              ws.send(JSON.stringify(queued));
            } catch (queueError) {
              console.error('Error sending queued message:', queueError);
            }
          });
          pendingQueueRef.current = [];
        }
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
        releaseLock();
        // Toast removido - error silencioso
      };

      ws.onclose = () => {
        console.info('WebSocket disconnected');
        setConnected(false);
        setWebSocket(null);
        if (typeof window !== 'undefined' && window[WS_GLOBAL_KEY] === ws) {
          window[WS_GLOBAL_KEY] = null;
        }
        releaseLock();
        
        // Reintentos controlados (máx 3) para recuperar desconexiones eventuales
        if (reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 8000);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      // Toast removido - error silencioso
    }
  }, [token, setConnected, setWebSocket, releaseLock]);

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
      console.info('📤 Sending message:', data.type);
      wsRef.current.send(JSON.stringify(data));
      return;
    }

    console.warn('⚠️ WebSocket not connected, queuing message and attempting reconnect');
    pendingQueueRef.current.push(data);
    
    // Esperar un poco antes de reconectar para evitar spam
    setTimeout(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    }, 500);
  }, [connect]);

  const playAudio = useCallback(async (base64Audio) => {
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
        // Si se está grabando, baja volumen para evitar feedback
        const { isRecording } = useBotStore.getState();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = isRecording ? 0.2 : 1.0;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.onended = () => {
          console.info('Audio finished playing');
          setSpeaking(false);
          audioContext.close();
        };
        
        source.start(0);
        console.info('Audio started playing via Web Audio API');
        
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
        console.info('Session established:', data.sessionId);
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
        console.info('Processing:', data.text);
        break;

      case 'response': {
        console.info('📨 Received response:', data.text);
        
        // Evitar duplicados consecutivos y similares en ventana corta
        const lastMessage = useBotStore.getState().messages[useBotStore.getState().messages.length - 1];
        const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const incoming = normalize(data.text);
        const prevAssistant = normalize(lastAssistantRef.current.text);
        const withinWindow = Date.now() - lastAssistantRef.current.ts < 5000;
        const verySimilar = incoming && prevAssistant && (incoming === prevAssistant || incoming.includes(prevAssistant) || prevAssistant.includes(incoming));

        console.info('🔍 Dedup check:', {
          lastMessage: lastMessage?.content,
          withinWindow,
          verySimilar,
          incoming: incoming.substring(0, 50),
          prevAssistant: prevAssistant.substring(0, 50)
        });

        if (
          (!lastMessage || lastMessage.content !== data.text || lastMessage.role !== 'assistant') &&
          !(withinWindow && verySimilar)
        ) {
          console.info('✅ Adding response message to chat');
          addMessage({ role: 'assistant', content: data.text });
          lastAssistantRef.current = { text: data.text, ts: Date.now() };
        } else {
          console.info('❌ Response blocked by deduplication logic');
        }
        setCurrentTranscript('');
        break;
      }

      case 'audio_response':
        // Reproducir audio del bot
        playAudio(data.audio);
        break;

      case 'token_refreshed':
        console.info('✅ Token refreshed successfully');
        break;

      case 'notice':
        // Mostrar como toast en lugar de mensaje de chat
        toast(data.message, { icon: 'ℹ️' });
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

      case 'notice':
        if (data?.message) {
          toast(data.message, { icon: 'i' });
        }
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
        console.info('Unhandled message type:', data.type);
    }
  };

  useEffect(() => {
    if (token) {
      if (typeof window === 'undefined' || !window[WS_AUTO_KEY]) {
        connect();
        if (typeof window !== 'undefined') window[WS_AUTO_KEY] = true;
      } else {
        console.info('WS auto-connect already performed');
      }
    }
    // No desconectar en unmount para evitar ciclos de reconexión cuando hay múltiples montajes
    return () => {};
  }, [token, connect]);

  useEffect(() => {
    if (token && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      send({
        type: 'refresh_token',
        token
      });
    }
  }, [token, send]);

  return {
    send,
    connect,
    disconnect,
    isConnected
  };
}





