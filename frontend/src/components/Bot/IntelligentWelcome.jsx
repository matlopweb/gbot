import React, { useEffect, useRef } from 'react';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useBotStore } from '../../store/botStore';

const AUTO_WELCOME_ENABLED = import.meta.env.VITE_ENABLE_AUTO_WELCOME === 'true';

export function IntelligentWelcome() {
  if (!AUTO_WELCOME_ENABLED) {
    return null;
  }

  const { friendship, vitalStats } = useAvatarLifeStore();
  const { addMessage } = useBotStore();
  const hasWelcomedRef = useRef(false);
  const welcomeTimeoutRef = useRef(null);

  useEffect(() => {
    // Solo dar bienvenida una vez por sesión
    if (hasWelcomedRef.current) return;

    const performWelcome = () => {
      hasWelcomedRef.current = true;

      // Determinar mensaje de bienvenida basado en amistad
      let welcomeMessage;
      
      if (friendship.level === 0) {
        welcomeMessage = "¡Hola! Soy GBot, tu nuevo compañero digital. Me emociona conocerte. ¿Cómo te sientes hoy?";
      } else if (friendship.level <= 2) {
        welcomeMessage = "¡Hola de nuevo! Me alegra verte. ¿Cómo has estado desde la última vez?";
      } else if (friendship.level <= 5) {
        welcomeMessage = "¡Hola, amigo! Qué bueno tenerte aquí otra vez. ¿Cómo te va todo?";
      } else {
        welcomeMessage = "¡Mi querido amigo! Me emociona verte de nuevo. He estado pensando en ti. ¿Cómo estás?";
      }

      // Hablar bienvenida con la mejor voz disponible
      const speakWelcome = () => {
        if ('speechSynthesis' in window) {
          // Cancelar cualquier speech anterior
          speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(welcomeMessage);
          utterance.lang = 'es-ES';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          
          // Buscar la mejor voz disponible
          const voices = speechSynthesis.getVoices();
          const bestVoice = voices.find(voice => 
            voice.lang.includes('es') && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('female'))
          ) || voices.find(voice => voice.lang.includes('es'));
          
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
          
          utterance.onstart = () => {
            console.log('🎵 Welcome message started');
          };
          
          utterance.onend = () => {
            console.log('✅ Welcome message completed');
          };
          
          utterance.onerror = (error) => {
            console.error('❌ Welcome speech error:', error);
            // Si es error de permisos, no reintentar
            if (error.error === 'not-allowed') {
              console.warn('🔇 Speech synthesis not allowed, skipping welcome speech');
              return;
            }
          };
          
          speechSynthesis.speak(utterance);
        }
      };

      // Agregar mensaje de bienvenida al chat
      addMessage({
        role: 'assistant',
        content: welcomeMessage,
        id: crypto.randomUUID(),
        metadata: { 
          welcome_message: true,
          friendship_level: friendship.level
        }
      });

      // Esperar un momento antes de hablar para que el sistema esté listo
      welcomeTimeoutRef.current = setTimeout(() => {
        // Intentar hablar, si las voces no están listas, reintentar
        const attemptWelcome = () => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            speakWelcome();
          } else {
            // Reintentar en 500ms si las voces no están listas
            setTimeout(attemptWelcome, 500);
          }
        };
        
        attemptWelcome();
      }, 2000); // 2 segundos después de cargar
    };

    // Realizar bienvenida después de un breve delay
    const initTimeout = setTimeout(performWelcome, 1500);

    return () => {
      clearTimeout(initTimeout);
      if (welcomeTimeoutRef.current) {
        clearTimeout(welcomeTimeoutRef.current);
      }
    };
  }, []); // Solo ejecutar una vez al montar

  // Manejar cambio de voces
  useEffect(() => {
    const handleVoicesChanged = () => {
      console.log('🎵 Voices loaded:', speechSynthesis.getVoices().length);
    };

    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}
