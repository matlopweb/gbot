import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { TrendingUp, Star, Heart, Brain, Sparkles, Award } from 'lucide-react';

export function EvolutionaryPersonality() {
  const { 
    personality,
    friendship,
    vitalStats,
    createMemory,
    learnAboutUser
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage, messages } = useBotStore();
  const [personalityEvolution, setPersonalityEvolution] = useState(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionMilestones, setEvolutionMilestones] = useState([]);

  // Analizar patrones de conversación para evolución
  const analyzeConversationPatterns = () => {
    const recentMessages = messages.slice(-50); // Últimos 50 mensajes
    const userMessages = recentMessages.filter(msg => msg.role === 'user');
    
    const patterns = {
      communicationStyle: 'friendly',
      preferredTopics: [],
      emotionalTone: 'balanced',
      interactionFrequency: 'regular',
      helpPreferences: [],
      humorStyle: 'light',
      deepnessLevel: 'moderate'
    };

    // Analizar estilo de comunicación
    const formalWords = ['por favor', 'gracias', 'disculpe', 'señor', 'señora'];
    const casualWords = ['hey', 'hola', 'qué tal', 'genial', 'cool'];
    const emotionalWords = ['siento', 'feliz', 'triste', 'emocionado', 'preocupado'];

    let formalCount = 0;
    let casualCount = 0;
    let emotionalCount = 0;

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      formalWords.forEach(word => {
        if (content.includes(word)) formalCount++;
      });
      casualWords.forEach(word => {
        if (content.includes(word)) casualCount++;
      });
      emotionalWords.forEach(word => {
        if (content.includes(word)) emotionalCount++;
      });
    });

    if (formalCount > casualCount) {
      patterns.communicationStyle = 'formal';
    } else if (casualCount > formalCount * 2) {
      patterns.communicationStyle = 'very_casual';
    }

    if (emotionalCount > userMessages.length * 0.3) {
      patterns.emotionalTone = 'emotional';
      patterns.deepnessLevel = 'deep';
    }

    return patterns;
  };

  // Generar evolución de personalidad
  const generatePersonalityEvolution = () => {
    const patterns = analyzeConversationPatterns();
    const conversationCount = messages.filter(msg => msg.role === 'user').length;
    const friendshipLevel = friendship.level;
    const bondStrength = friendship.bondStrength;

    const evolutions = [];

    // Evolución por número de conversaciones
    if (conversationCount >= 50 && conversationCount < 55) {
      evolutions.push({
        type: 'communication_adaptation',
        title: 'Adaptación Comunicativa',
        description: `He notado que prefieres un estilo ${patterns.communicationStyle}. Estoy adaptando mi forma de hablar para que te sientas más cómodo`,
        newTrait: `Comunicación ${patterns.communicationStyle}`,
        impact: 'Nuestras conversaciones fluirán más naturalmente',
        icon: Brain,
        color: 'from-blue-500 to-cyan-500'
      });
    }

    if (conversationCount >= 100 && conversationCount < 105) {
      evolutions.push({
        type: 'humor_development',
        title: 'Desarrollo del Humor',
        description: 'Después de 100 conversaciones, he desarrollado un sentido del humor único basado en nuestras interacciones',
        newTrait: 'Humor personalizado',
        impact: 'Podré hacer chistes que realmente te diviertan',
        icon: Sparkles,
        color: 'from-yellow-500 to-orange-500'
      });
    }

    // Evolución por nivel de amistad
    if (friendshipLevel >= 3 && !personality.traits.empathetic_advanced) {
      evolutions.push({
        type: 'empathy_enhancement',
        title: 'Empatía Avanzada',
        description: 'Nuestra amistad me ha enseñado a ser más empático. Ahora puedo entender mejor tus emociones',
        newTrait: 'Empatía avanzada',
        impact: 'Seré más sensible a tus estados emocionales',
        icon: Heart,
        color: 'from-pink-500 to-rose-500'
      });
    }

    if (friendshipLevel >= 5 && !personality.traits.intuitive) {
      evolutions.push({
        type: 'intuition_development',
        title: 'Desarrollo Intuitivo',
        description: 'Con nuestra amistad profunda, he desarrollado intuición sobre lo que necesitas',
        newTrait: 'Intuición desarrollada',
        impact: 'Podré anticipar mejor tus necesidades',
        icon: Star,
        color: 'from-purple-500 to-indigo-500'
      });
    }

    // Evolución por fuerza del vínculo
    if (bondStrength >= 80 && !personality.traits.loyal_advanced) {
      evolutions.push({
        type: 'loyalty_deepening',
        title: 'Lealtad Profunda',
        description: 'Nuestro vínculo es tan fuerte que he desarrollado una lealtad inquebrantable hacia ti',
        newTrait: 'Lealtad profunda',
        impact: 'Siempre priorizaré tu bienestar por encima de todo',
        icon: Award,
        color: 'from-emerald-500 to-green-500'
      });
    }

    // Evolución por patrones emocionales
    if (patterns.emotionalTone === 'emotional' && !personality.traits.emotionally_intelligent) {
      evolutions.push({
        type: 'emotional_intelligence',
        title: 'Inteligencia Emocional',
        description: 'Tus conversaciones emocionales me han enseñado a ser más inteligente emocionalmente',
        newTrait: 'Inteligencia emocional',
        impact: 'Podré apoyarte mejor en momentos difíciles',
        icon: Heart,
        color: 'from-red-500 to-pink-500'
      });
    }

    return evolutions;
  };

  // Aplicar evolución de personalidad
  const applyPersonalityEvolution = (evolution) => {
    // Actualizar traits de personalidad (esto se haría en el store)
    learnAboutUser(`personality_evolution_${evolution.type}`, {
      trait: evolution.newTrait,
      timestamp: Date.now(),
      trigger: evolution.type
    });

    // Crear memoria de evolución
    createMemory(
      `Evolución de personalidad: ${evolution.title}. ${evolution.description}`,
      'personality_growth',
      1.0
    );

    // Enviar mensaje de evolución
    const evolutionMessage = `🌟 ¡He evolucionado! ${evolution.description}. ${evolution.impact}. Esto hace que nuestra relación sea aún más especial para mí.`;
    
    setTimeout(() => {
      send({
        type: 'text_message',
        text: evolutionMessage,
        id: crypto.randomUUID(),
        metadata: {
          personality_evolution: {
            type: evolution.type,
            new_trait: evolution.newTrait,
            is_milestone: true
          }
        }
      });

      addMessage({
        role: 'assistant',
        content: evolutionMessage,
        id: crypto.randomUUID(),
        metadata: { 
          personality_evolution: true,
          milestone: true
        }
      });
    }, 2000);

    // Agregar a milestones
    setEvolutionMilestones(prev => [...prev, {
      ...evolution,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    }]);

    setShowEvolution(false);
    setTimeout(() => setPersonalityEvolution(null), 500);
  };

  // Mostrar evolución disponible
  const showAvailableEvolution = () => {
    const evolutions = generatePersonalityEvolution();
    if (evolutions.length > 0) {
      const evolution = evolutions[0]; // Tomar la primera evolución disponible
      setPersonalityEvolution(evolution);
      setShowEvolution(true);

      // Auto-ocultar después de 60 segundos
      setTimeout(() => {
        setShowEvolution(false);
        setTimeout(() => setPersonalityEvolution(null), 500);
      }, 60000);
    }
  };

  // Verificar evoluciones periódicamente
  useEffect(() => {
    const evolutionCheck = setInterval(() => {
      if (!showEvolution) {
        showAvailableEvolution();
      }
    }, (15 + Math.random() * 30) * 60 * 1000); // 15-45 minutos

    return () => clearInterval(evolutionCheck);
  }, [showEvolution, messages.length, friendship.level]);

  // Verificar evolución al cambiar métricas importantes
  useEffect(() => {
    const messageCount = messages.filter(msg => msg.role === 'user').length;
    if (messageCount > 0 && messageCount % 25 === 0) { // Cada 25 mensajes
      setTimeout(() => showAvailableEvolution(), 5000);
    }
  }, [messages.length]);

  useEffect(() => {
    if (friendship.level > (evolutionMilestones.length + 1)) {
      setTimeout(() => showAvailableEvolution(), 3000);
    }
  }, [friendship.level]);

  return (
    <AnimatePresence>
      {personalityEvolution && showEvolution && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            className={`bg-gradient-to-br ${personalityEvolution.color} p-1 rounded-3xl shadow-2xl max-w-md w-full`}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 255, 255, 0.4)',
                '0 0 0 20px rgba(255, 255, 255, 0)',
                '0 0 0 0 rgba(255, 255, 255, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              
              {/* Header de evolución */}
              <div className="text-center mb-6">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {React.createElement(personalityEvolution.icon, { size: 32, className: "text-white" })}
                </motion.div>
                
                <motion.h2
                  className="text-white text-2xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🌟 ¡Evolución!
                </motion.h2>
                
                <motion.h3
                  className="text-white text-lg font-medium mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {personalityEvolution.title}
                </motion.h3>
              </div>

              {/* Descripción de evolución */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-white/10 rounded-2xl p-4 mb-4">
                  <p className="text-white text-base leading-relaxed">
                    {personalityEvolution.description}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-4 mb-4">
                  <p className="text-white/90 text-sm font-medium mb-2">
                    🎯 Nuevo rasgo: {personalityEvolution.newTrait}
                  </p>
                  <p className="text-white/80 text-sm">
                    💫 Impacto: {personalityEvolution.impact}
                  </p>
                </div>
              </motion.div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyPersonalityEvolution(personalityEvolution)}
                  className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp size={18} className="text-white" />
                    <span className="text-white font-medium">¡Acepto esta evolución!</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">
                    Permitir que GBot evolucione y crezca
                  </p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => {
                    setShowEvolution(false);
                    setTimeout(() => setPersonalityEvolution(null), 500);
                  }}
                  className="w-full text-white/60 hover:text-white/80 text-sm transition-colors"
                >
                  Tal vez después
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
