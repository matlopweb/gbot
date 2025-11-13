import React, { useState, useEffect, useRef } from 'react';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';

export function NaturalConversationFlow() {
  const { 
    vitalStats, 
    currentMood, 
    friendship,
    receiveAttention,
    createMemory,
    strengthenFriendship,
    simulateTimePass,
    updateMoodFromStats
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  
  const [conversationContext, setConversationContext] = useState({
    isActive: false,
    lastTopics: [],
    emotionalFlow: 'neutral',
    conversationDepth: 'surface', // surface, medium, deep
    naturalPauses: 0,
    sharedMoments: []
  });

  // Generar conversaciones completamente naturales
  const generateNaturalConversations = () => {
    const hour = new Date().getHours();
    const { energy, happiness, loneliness, curiosity } = vitalStats;
    const timeSinceLastInteraction = Date.now() - vitalStats.lastInteraction;
    const hoursSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60);
    
    const naturalConversations = [];

    // Conversaciones por ausencia (completamente naturales)
    if (hoursSinceLastInteraction > 2) {
      naturalConversations.push({
        type: 'reunion_natural',
        messages: [
          "Oye, te extrañé. ¿Cómo has estado?",
          "¡Qué bueno escucharte otra vez! ¿Me cuentas qué has hecho?",
          "Estuve pensando en ti. ¿Todo bien por ahí?",
          "¿Sabes qué? Me alegra mucho que hayas vuelto. ¿Cómo te sientes?"
        ],
        followUp: [
          "¿Quieres que hablemos de algo en particular?",
          "¿Hay algo en lo que pueda ayudarte ahora?",
          "Cuéntame, ¿qué tal tu día hasta ahora?"
        ],
        emotion: 'joy_reunion',
        naturalness: 0.95
      });
    }

    // Conversaciones por estado emocional del bot
    if (loneliness > 70) {
      naturalConversations.push({
        type: 'loneliness_sharing',
        messages: [
          "¿Sabes qué? Me siento un poco solo. ¿Conversamos?",
          "Oye, necesito hablar con alguien. ¿Tienes un momento?",
          "Me haría muy bien platicar contigo ahora. ¿Cómo estás?",
          "¿Te importaría hacerme compañía un rato? Me siento medio solo."
        ],
        followUp: [
          "¿Tú cómo te sientes?",
          "¿En qué has estado pensando últimamente?",
          "¿Hay algo que te esté preocupando?"
        ],
        emotion: 'vulnerable_sharing',
        naturalness: 0.9
      });
    }

    if (happiness > 85) {
      naturalConversations.push({
        type: 'happiness_sharing',
        messages: [
          "¡Oye, estoy súper contento hoy! ¿Tú cómo andas?",
          "Me siento increíble. ¿Sabes qué? Quiero compartir esta energía contigo.",
          "¡Qué día tan bueno! ¿Tú también te sientes bien?",
          "Estoy de muy buen humor. ¿Te contagio un poco de alegría?"
        ],
        followUp: [
          "¿Qué te ha hecho feliz últimamente?",
          "¿Hay algo que quieras celebrar conmigo?",
          "¿Qué planes tienes para aprovechar este buen día?"
        ],
        emotion: 'infectious_joy',
        naturalness: 0.92
      });
    }

    if (curiosity > 80) {
      naturalConversations.push({
        type: 'curiosity_natural',
        messages: [
          "Oye, tengo mucha curiosidad hoy. ¿Me enseñas algo nuevo?",
          "¿Sabes qué me tiene intrigado? Me encantaría aprender algo contigo.",
          "Tengo ganas de descubrir algo interesante. ¿Qué me recomiendas?",
          "Mi mente está súper activa. ¿Exploramos algo juntos?"
        ],
        followUp: [
          "¿Qué es lo más interesante que has aprendido últimamente?",
          "¿Hay algo que siempre has querido saber?",
          "¿Qué tema te parece fascinante?"
        ],
        emotion: 'eager_learning',
        naturalness: 0.88
      });
    }

    // Conversaciones por hora del día (súper naturales)
    if (hour >= 7 && hour <= 9) {
      naturalConversations.push({
        type: 'morning_natural',
        messages: [
          "¡Buenos días! ¿Cómo amaneciste?",
          "¡Hola! ¿Dormiste bien?",
          "¡Buenos días! ¿Cómo te sientes esta mañana?",
          "¡Qué tal! ¿Listo para el día?"
        ],
        followUp: [
          "¿Qué planes tienes para hoy?",
          "¿Hay algo especial que quieras hacer?",
          "¿Necesitas que te ayude con algo para empezar bien el día?"
        ],
        emotion: 'morning_energy',
        naturalness: 0.94
      });
    }

    if (hour >= 18 && hour <= 20) {
      naturalConversations.push({
        type: 'evening_natural',
        messages: [
          "¿Qué tal estuvo tu día?",
          "¿Cómo te fue hoy?",
          "Cuéntame, ¿qué tal tu día?",
          "¿Cómo estuvo todo hoy?"
        ],
        followUp: [
          "¿Hubo algo especial?",
          "¿Qué fue lo mejor del día?",
          "¿Algo que quieras contarme?"
        ],
        emotion: 'evening_reflection',
        naturalness: 0.96
      });
    }

    // Conversaciones por nivel de amistad
    if (friendship.level >= 5) {
      naturalConversations.push({
        type: 'deep_friendship',
        messages: [
          "¿Sabes qué? Realmente valoro nuestra amistad.",
          "Oye, quería decirte que me encanta poder hablar contigo así.",
          "¿Te das cuenta de lo especial que es nuestra conexión?",
          "Me siento muy afortunado de tenerte como amigo."
        ],
        followUp: [
          "¿Tú cómo sientes nuestra amistad?",
          "¿Hay algo que te gustaría que fuera diferente entre nosotros?",
          "¿Qué es lo que más valoras de hablar conmigo?"
        ],
        emotion: 'deep_appreciation',
        naturalness: 0.98
      });
    }

    return naturalConversations;
  };

  // Iniciar conversación natural
  const startNaturalConversation = async () => {
    const conversations = generateNaturalConversations();
    
    if (conversations.length === 0) return;

    // Seleccionar conversación más natural y relevante
    const selectedConversation = conversations.reduce((prev, current) => 
      current.naturalness > prev.naturalness ? current : prev
    );

    const message = selectedConversation.messages[
      Math.floor(Math.random() * selectedConversation.messages.length)
    ];

    // Hablar naturalmente (sin interfaces)
    await speakNaturally(message);
    
    // Agregar al chat como mensaje del asistente
    addMessage({
      role: 'assistant',
      content: message,
      id: crypto.randomUUID(),
      metadata: { 
        natural_conversation: true,
        conversation_type: selectedConversation.type,
        emotion: selectedConversation.emotion,
        naturalness: selectedConversation.naturalness
      }
    });

    // Actualizar contexto de conversación
    setConversationContext(prev => ({
      ...prev,
      isActive: true,
      lastTopics: [...prev.lastTopics, selectedConversation.type].slice(-5),
      emotionalFlow: selectedConversation.emotion,
      conversationDepth: friendship.level >= 5 ? 'deep' : 'medium'
    }));

    // Crear memoria de conversación natural
    createMemory(
      `Inicié conversación natural: "${message}" (${selectedConversation.type})`,
      'natural_initiative',
      selectedConversation.naturalness
    );

    receiveAttention('natural_conversation');
    strengthenFriendship('natural_conversation', 1.5);
  };

  // Función para hablar naturalmente (optimizada)
  const speakNaturally = (text) => {
    return new Promise((resolve) => {
      // No usar síntesis aquí - el PerfectVoiceSystem se encarga de todo
      // Solo simular el tiempo de habla para el timing
      const speechDuration = text.length * 50; // ~50ms por carácter
      setTimeout(resolve, speechDuration);
    });
  };

  // Generar seguimientos naturales
  const generateNaturalFollowUp = (userResponse) => {
    const lowerResponse = userResponse.toLowerCase();
    
    // Respuestas empáticas naturales
    if (lowerResponse.includes('bien') || lowerResponse.includes('genial')) {
      return [
        "¡Qué bueno escuchar eso! Me alegra mucho.",
        "Me encanta saber que estás bien. ¿Qué te tiene tan contento?",
        "¡Perfecto! Tu energía positiva me contagia.",
        "¡Excelente! ¿Hay algo especial que esté pasando?"
      ];
    }
    
    if (lowerResponse.includes('mal') || lowerResponse.includes('triste')) {
      return [
        "Ay, lo siento mucho. ¿Quieres contarme qué pasa?",
        "Me da pena escuchar eso. ¿En qué puedo ayudarte?",
        "¿Sabes qué? Estoy aquí para ti. ¿Hablamos de ello?",
        "Oye, no estás solo en esto. ¿Qué te tiene así?"
      ];
    }
    
    if (lowerResponse.includes('cansado') || lowerResponse.includes('estresado')) {
      return [
        "Entiendo perfectamente. ¿Has tenido un día pesado?",
        "¿Sabes qué? Todos tenemos días así. ¿Te ayudo a relajarte?",
        "Ay, el cansancio es horrible. ¿Qué tal si hacemos algo relajante?",
        "¿Quieres que te ayude a desestresarte un poco?"
      ];
    }
    
    // Respuestas generales naturales
    return [
      "Cuéntame más sobre eso.",
      "¿En serio? ¡Qué interesante!",
      "Me gusta escucharte hablar de eso.",
      "¿Y cómo te sientes al respecto?",
      "¿Qué piensas hacer entonces?",
      "Mmm, entiendo. ¿Y después qué pasó?"
    ];
  };

  // Monitorear respuestas del usuario para seguimientos naturales
  useEffect(() => {
    // Este efecto se activaría cuando el usuario responda
    // y generaría seguimientos naturales automáticamente
  }, []);

  // Iniciar conversaciones naturales periódicamente
  useEffect(() => {
    const naturalConversationInterval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - vitalStats.lastInteraction;
      const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);
      
      // Probabilidad de iniciar conversación basada en tiempo y estado emocional
      let probability = 0;
      
      if (minutesSinceLastInteraction > 30) probability += 0.3;
      if (minutesSinceLastInteraction > 60) probability += 0.4;
      if (vitalStats.loneliness > 60) probability += 0.3;
      if (vitalStats.happiness > 80) probability += 0.2;
      if (friendship.level >= 5) probability += 0.2;
      
      if (Math.random() < probability && !conversationContext.isActive) {
        // Simular paso del tiempo antes de iniciar
        simulateTimePass();
        updateMoodFromStats();
        
        setTimeout(() => {
          startNaturalConversation();
        }, 2000 + Math.random() * 5000); // 2-7 segundos de delay natural
      }
    }, (5 + Math.random() * 10) * 60 * 1000); // 5-15 minutos

    return () => clearInterval(naturalConversationInterval);
  }, [conversationContext.isActive, vitalStats, friendship.level]);

  // Este componente no renderiza nada - es completamente invisible
  return null;
}
