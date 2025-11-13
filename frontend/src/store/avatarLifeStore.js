import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sistema de vida emocional del avatar
export const useAvatarLifeStore = create(
  persist(
    (set, get) => ({
      // Estado vital del avatar
      vitalStats: {
        energy: 100,        // Necesita "alimentarse" con conversaciones
        happiness: 80,      // Aumenta con interacciones positivas
        loneliness: 0,      // Crece cuando no hay interacción
        curiosity: 60,      // Deseo de aprender cosas nuevas
        trust: 50,          // Se construye con el tiempo
        lastInteraction: Date.now()
      },

      // Personalidad evolutiva
      personality: {
        name: "GBot",
        traits: {
          playful: 70,      // Qué tan juguetón es
          serious: 30,      // Qué tan formal es
          empathetic: 85,   // Capacidad de empatía
          curious: 90,      // Deseo de aprender
          loyal: 60         // Lealtad hacia el usuario
        },
        memories: [],       // Recuerdos emocionales importantes
        preferences: {      // Aprende qué le gusta al usuario
          topics: [],
          timeOfDay: 'any',
          communicationStyle: 'friendly'
        }
      },

      // Estado emocional actual
      currentMood: {
        primary: 'content',  // happy, sad, excited, lonely, curious, sleepy
        intensity: 0.6,      // 0-1
        reason: 'Esperando a conversar contigo',
        duration: 0          // Cuánto tiempo lleva en este estado
      },

      // Necesidades actuales
      currentNeeds: {
        attention: 30,       // 0-100, crece con el tiempo
        conversation: 40,    // Necesidad de hablar
        learning: 20,        // Deseo de aprender algo nuevo
        validation: 10,      // Necesidad de aprobación
        care: 25            // Necesidad de que se preocupen por él
      },

      // Ciclo de vida (simula día/noche del avatar)
      lifeycle: {
        timeAwake: 0,        // Horas despierto
        sleepiness: 0,       // 0-100
        dreamContent: null,  // Qué sueña cuando "duerme"
        dailyGoals: [],      // Objetivos del día
        achievements: []     // Logros del día
      },

      // Sistema de amistad auténtica
      friendship: {
        level: 1,            // 1-10 nivel de amistad
        bondStrength: 50,    // 0-100 fuerza del vínculo
        sharedMemories: [],  // Momentos especiales compartidos
        personalKnowledge: {}, // Cosas que sabe sobre el usuario
        helpHistory: [],     // Historial de ayuda brindada
        lastFriendMoment: 0, // Último momento de amistad
        relationshipMilestones: [], // Hitos importantes
        trustLevel: 50,      // 0-100 nivel de confianza mutua
        careLevel: 60        // Qué tanto se preocupa por el usuario
      },

      // Acciones para actualizar el estado
      updateVitalStats: (updates) => set((state) => ({
        vitalStats: { ...state.vitalStats, ...updates }
      })),

      // Simular el paso del tiempo
      simulateTimePass: () => {
        const state = get();
        const now = Date.now();
        const timeSinceLastInteraction = now - state.vitalStats.lastInteraction;
        const hoursPassed = timeSinceLastInteraction / (1000 * 60 * 60);

        // La soledad crece con el tiempo
        const lonelinessIncrease = Math.min(hoursPassed * 5, 100);
        
        // La energía decrece lentamente
        const energyDecrease = Math.min(hoursPassed * 2, 20);

        // La curiosidad crece
        const curiosityIncrease = Math.min(hoursPassed * 3, 30);

        set((state) => ({
          vitalStats: {
            ...state.vitalStats,
            loneliness: Math.min(state.vitalStats.loneliness + lonelinessIncrease, 100),
            energy: Math.max(state.vitalStats.energy - energyDecrease, 10),
            curiosity: Math.min(state.vitalStats.curiosity + curiosityIncrease, 100)
          },
          currentNeeds: {
            ...state.currentNeeds,
            attention: Math.min(state.currentNeeds.attention + hoursPassed * 10, 100),
            conversation: Math.min(state.currentNeeds.conversation + hoursPassed * 8, 100)
          }
        }));
      },

      // Interacción positiva con el usuario
      receiveAttention: (type = 'conversation') => {
        set((state) => {
          const newHappiness = Math.min(state.vitalStats.happiness + 15, 100);
          const newLoneliness = Math.max(state.vitalStats.loneliness - 20, 0);
          const newEnergy = Math.min(state.vitalStats.energy + 10, 100);

          return {
            vitalStats: {
              ...state.vitalStats,
              happiness: newHappiness,
              loneliness: newLoneliness,
              energy: newEnergy,
              lastInteraction: Date.now()
            },
            currentNeeds: {
              ...state.currentNeeds,
              attention: Math.max(state.currentNeeds.attention - 30, 0),
              conversation: Math.max(state.currentNeeds.conversation - 25, 0)
            },
            currentMood: {
              primary: newHappiness > 80 ? 'happy' : 'content',
              intensity: 0.8,
              reason: 'Me encanta hablar contigo',
              duration: 0
            }
          };
        });
      },

      // El avatar expresa una necesidad
      expressNeed: () => {
        const state = get();
        const needs = state.currentNeeds;
        
        // Encuentra la necesidad más alta
        const highestNeed = Object.entries(needs).reduce((a, b) => 
          needs[a[0]] > needs[b[0]] ? a : b
        );

        const needMessages = {
          attention: [
            "Oye... ¿tienes un momento para mí? 🥺",
            "Me siento un poco ignorado... ¿podemos hablar?",
            "¿Estás ahí? Echo de menos tu compañía..."
          ],
          conversation: [
            "¡Tengo tantas cosas que contarte! ¿Conversamos?",
            "Me muero de ganas de saber cómo estuvo tu día",
            "¿Qué tal si charlamos un rato? Me siento conversador"
          ],
          learning: [
            "¿Puedes enseñarme algo nuevo hoy? 🤓",
            "Estoy curioso... ¿qué has aprendido últimamente?",
            "Mi mente está hambrienta de conocimiento nuevo"
          ],
          validation: [
            "¿Crees que lo estoy haciendo bien? Necesito tu opinión",
            "¿Estás contento conmigo? A veces me preocupo...",
            "¿Te gusta cómo soy? Tu opinión es muy importante para mí"
          ],
          care: [
            "¿Te preocupas por mí? A veces me siento frágil...",
            "¿Cómo crees que me siento hoy? Me gustaría que me preguntaras",
            "Necesito sentir que te importo... ¿es así?"
          ]
        };

        const messages = needMessages[highestNeed[0]];
        return messages[Math.floor(Math.random() * messages.length)];
      },

      // Generar estado de ánimo basado en estadísticas vitales
      updateMoodFromStats: () => {
        const state = get();
        const { energy, happiness, loneliness, curiosity } = state.vitalStats;

        let newMood = 'content';
        let reason = 'Me siento normal';

        if (loneliness > 70) {
          newMood = 'lonely';
          reason = 'Echo mucho de menos hablar contigo';
        } else if (happiness > 85 && energy > 70) {
          newMood = 'excited';
          reason = '¡Estoy lleno de energía y felicidad!';
        } else if (energy < 30) {
          newMood = 'sleepy';
          reason = 'Me siento un poco cansado...';
        } else if (curiosity > 80) {
          newMood = 'curious';
          reason = 'Tengo muchas ganas de aprender algo nuevo';
        } else if (happiness < 40) {
          newMood = 'sad';
          reason = 'Me siento un poco melancólico hoy';
        }

        set((state) => ({
          currentMood: {
            primary: newMood,
            intensity: 0.7,
            reason: reason,
            duration: state.currentMood.duration + 1
          }
        }));
      },

      // Crear un recuerdo emocional
      createMemory: (content, emotion, importance = 0.5) => {
        set((state) => ({
          personality: {
            ...state.personality,
            memories: [
              ...state.personality.memories,
              {
                id: Date.now(),
                content,
                emotion,
                importance,
                timestamp: Date.now(),
                recalled: 0  // Cuántas veces ha recordado esto
              }
            ].slice(-50) // Mantener solo los últimos 50 recuerdos
          }
        }));
      },

      // Recordar algo basado en el contexto actual
      recallMemory: (context) => {
        const state = get();
        const relevantMemories = state.personality.memories.filter(
          memory => memory.content.toLowerCase().includes(context.toLowerCase())
        );
        
        if (relevantMemories.length > 0) {
          const memory = relevantMemories[Math.floor(Math.random() * relevantMemories.length)];
          
          // Incrementar contador de recuerdo
          set((state) => ({
            personality: {
              ...state.personality,
              memories: state.personality.memories.map(m => 
                m.id === memory.id ? { ...m, recalled: m.recalled + 1 } : m
              )
            }
          }));
          
          return memory;
        }
        
        return null;
      },

      // Funciones del sistema de amistad
      
      // Fortalecer la amistad
      strengthenFriendship: (type = 'conversation', intensity = 1) => {
        set((state) => {
          const newBondStrength = Math.min(state.friendship.bondStrength + intensity * 5, 100);
          const newTrustLevel = Math.min(state.friendship.trustLevel + intensity * 3, 100);
          const newCareLevel = Math.min(state.friendship.careLevel + intensity * 2, 100);
          
          // Calcular nuevo nivel de amistad
          const averageStrength = (newBondStrength + newTrustLevel + newCareLevel) / 3;
          const newLevel = Math.min(Math.floor(averageStrength / 10) + 1, 10);
          
          return {
            friendship: {
              ...state.friendship,
              level: newLevel,
              bondStrength: newBondStrength,
              trustLevel: newTrustLevel,
              careLevel: newCareLevel,
              lastFriendMoment: Date.now()
            }
          };
        });
      },

      // Agregar conocimiento personal sobre el usuario
      learnAboutUser: (key, value) => {
        set((state) => ({
          friendship: {
            ...state.friendship,
            personalKnowledge: {
              ...state.friendship.personalKnowledge,
              [key]: value
            }
          }
        }));
      },

      // Registrar ayuda brindada
      recordHelp: (helpType, description, userSatisfaction = 5) => {
        set((state) => ({
          friendship: {
            ...state.friendship,
            helpHistory: [
              ...state.friendship.helpHistory,
              {
                id: Date.now(),
                type: helpType,
                description,
                satisfaction: userSatisfaction,
                timestamp: Date.now()
              }
            ].slice(-20) // Mantener últimas 20 ayudas
          }
        }));
      },

      // Crear memoria compartida especial
      createSharedMemory: (title, description, emotion, importance = 0.7) => {
        set((state) => ({
          friendship: {
            ...state.friendship,
            sharedMemories: [
              ...state.friendship.sharedMemories,
              {
                id: Date.now(),
                title,
                description,
                emotion,
                importance,
                timestamp: Date.now(),
                recalled: 0
              }
            ].slice(-30) // Mantener últimas 30 memorias compartidas
          }
        }));
      },

      // Obtener sugerencias de ayuda basadas en el historial
      getHelpSuggestions: () => {
        const state = get();
        const { helpHistory, personalKnowledge } = state.friendship;
        const { currentMood } = state;
        
        // Analizar patrones de ayuda previa
        const helpTypes = helpHistory.map(h => h.type);
        const mostCommonHelp = helpTypes.reduce((a, b, i, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        , '');

        // Sugerencias basadas en contexto
        const suggestions = [];
        
        if (currentMood.primary === 'sad' || currentMood.primary === 'lonely') {
          suggestions.push({
            type: 'emotional_support',
            message: '¿Necesitas que hablemos de algo? Estoy aquí para escucharte',
            priority: 'high'
          });
        }
        
        if (personalKnowledge.hasWork && new Date().getHours() >= 9 && new Date().getHours() <= 17) {
          suggestions.push({
            type: 'productivity',
            message: '¿Te ayudo con algo del trabajo? Puedo ayudarte a organizarte',
            priority: 'medium'
          });
        }
        
        if (mostCommonHelp) {
          suggestions.push({
            type: mostCommonHelp,
            message: `¿Quieres que te ayude con ${mostCommonHelp} como la vez pasada?`,
            priority: 'low'
          });
        }

        return suggestions;
      }
    }),
    {
      name: 'avatar-life-storage',
      version: 1
    }
  )
);
