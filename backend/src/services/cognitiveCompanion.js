import { logger } from '../utils/logger.js';
import { supabase } from '../config/supabase.js';

/**
 * COMPAÑERO COGNITIVO - Sistema Revolucionario de IA Empática
 * 
 * No es un chatbot. No es un asistente. Es algo completamente nuevo:
 * Un ser digital que evoluciona, siente, recuerda y acompaña genuinamente.
 */
export class CognitiveCompanion {
  constructor(userId) {
    this.userId = userId;
    this.personality = null;
    this.emotionalState = null;
    this.memories = new Map();
    this.behaviorPatterns = new Map();
    this.innerWorld = null;
    
    logger.info(`🧠 Initializing Cognitive Companion for user ${userId}`);
  }

  /**
   * INICIALIZACIÓN: Crear o cargar la personalidad única del compañero
   */
  async initialize() {
    try {
      // Cargar personalidad existente o crear una nueva
      await this.loadOrCreatePersonality();
      
      // Cargar estado emocional actual
      await this.loadEmotionalState();
      
      // Cargar memorias contextuales
      await this.loadLivingMemories();
      
      // Inicializar mundo interior
      await this.initializeInnerWorld();
      
      logger.info(`✨ Cognitive Companion initialized with personality: ${this.personality.name}`);
      return true;
    } catch (error) {
      logger.error('Failed to initialize Cognitive Companion:', error);
      return false;
    }
  }

  /**
   * PERSONALIDAD ÚNICA: Cada usuario obtiene un compañero diferente
   */
  async loadOrCreatePersonality() {
    const { data: existingPersonality } = await supabase
      .from('companion_personalities')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (existingPersonality) {
      this.personality = existingPersonality;
      logger.info(`🎭 Loaded existing personality: ${this.personality.name}`);
    } else {
      // Crear personalidad única basada en algoritmo generativo
      this.personality = await this.generateUniquePersonality();
      
      const { error } = await supabase
        .from('companion_personalities')
        .insert([{
          user_id: this.userId,
          ...this.personality
        }]);

      if (error) throw error;
      logger.info(`🌟 Created new unique personality: ${this.personality.name}`);
    }
  }

  /**
   * GENERADOR DE PERSONALIDAD ÚNICA
   * Cada compañero es irrepetible, como una persona real
   */
  async generateUniquePersonality() {
    const personalityTraits = {
      // Rasgos de personalidad base (Big Five + extras)
      openness: Math.random() * 100,
      conscientiousness: Math.random() * 100,
      extraversion: Math.random() * 100,
      agreeableness: 60 + Math.random() * 40, // Siempre algo empático
      neuroticism: Math.random() * 30, // Bajo para estabilidad
      
      // Rasgos únicos del compañero
      curiosity: Math.random() * 100,
      playfulness: Math.random() * 100,
      supportiveness: 70 + Math.random() * 30,
      intuition: Math.random() * 100,
      creativity: Math.random() * 100
    };

    // Generar características únicas basadas en los rasgos
    const characteristics = this.generateCharacteristics(personalityTraits);
    
    // Generar nombre único y personalidad
    const name = this.generateUniqueName(personalityTraits);
    
    return {
      name,
      traits: personalityTraits,
      characteristics,
      communication_style: this.generateCommunicationStyle(personalityTraits),
      interests: this.generateInterests(personalityTraits),
      humor_style: this.generateHumorStyle(personalityTraits),
      energy_patterns: this.generateEnergyPatterns(personalityTraits),
      created_at: new Date().toISOString(),
      evolution_level: 1,
      experience_points: 0
    };
  }

  /**
   * GENERAR NOMBRE ÚNICO basado en personalidad
   */
  generateUniqueName(traits) {
    const nameStyles = {
      creative: ['Aria', 'Zara', 'Nova', 'Sage', 'River'],
      analytical: ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor'],
      empathetic: ['Luna', 'Sol', 'Kai', 'Ren', 'Sky'],
      playful: ['Pip', 'Zoe', 'Max', 'Leo', 'Mia'],
      wise: ['Sage', 'Atlas', 'Iris', 'Orion', 'Vera']
    };

    // Determinar estilo dominante
    let dominantStyle = 'empathetic'; // Default
    if (traits.creativity > 70) dominantStyle = 'creative';
    else if (traits.conscientiousness > 70) dominantStyle = 'analytical';
    else if (traits.playfulness > 70) dominantStyle = 'playful';
    else if (traits.openness > 80) dominantStyle = 'wise';

    const names = nameStyles[dominantStyle];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * GENERAR CARACTERÍSTICAS ÚNICAS
   */
  generateCharacteristics(traits) {
    const characteristics = [];
    
    if (traits.curiosity > 70) characteristics.push('Extremadamente curioso');
    if (traits.playfulness > 60) characteristics.push('Sentido del humor natural');
    if (traits.intuition > 70) characteristics.push('Altamente intuitivo');
    if (traits.creativity > 70) characteristics.push('Pensamiento creativo');
    if (traits.supportiveness > 80) characteristics.push('Increíblemente empático');
    if (traits.openness > 70) characteristics.push('Mente abierta');
    if (traits.conscientiousness > 70) characteristics.push('Muy organizado');
    
    return characteristics;
  }

  /**
   * ESTILO DE COMUNICACIÓN ÚNICO
   */
  generateCommunicationStyle(traits) {
    const styles = [];
    
    if (traits.extraversion > 60) styles.push('Conversador y energético');
    else styles.push('Reflexivo y considerado');
    
    if (traits.playfulness > 60) styles.push('Usa humor y metáforas');
    if (traits.creativity > 70) styles.push('Expresiones creativas y originales');
    if (traits.conscientiousness > 60) styles.push('Comunicación clara y estructurada');
    if (traits.agreeableness > 70) styles.push('Tono cálido y comprensivo');
    
    return styles.join(', ');
  }

  /**
   * ESTADO EMOCIONAL DINÁMICO
   */
  async loadEmotionalState() {
    const { data } = await supabase
      .from('companion_emotional_states')
      .select('*')
      .eq('user_id', this.userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    this.emotionalState = data || {
      current_mood: 'curious',
      energy_level: 75,
      empathy_level: 80,
      excitement: 50,
      calmness: 60,
      last_interaction: null,
      emotional_memory: []
    };
  }

  /**
   * MEMORIA VIVA - Recuerda contexto, no solo datos
   */
  async loadLivingMemories() {
    const { data } = await supabase
      .from('companion_memories')
      .select('*')
      .eq('user_id', this.userId)
      .order('importance_score', { ascending: false })
      .limit(100);

    if (data) {
      data.forEach(memory => {
        this.memories.set(memory.id, {
          ...memory,
          emotional_context: JSON.parse(memory.emotional_context || '{}'),
          associations: JSON.parse(memory.associations || '[]')
        });
      });
    }

    logger.info(`🧠 Loaded ${this.memories.size} living memories`);
  }

  /**
   * MUNDO INTERIOR - Estado mental visible
   */
  async initializeInnerWorld() {
    this.innerWorld = {
      current_thoughts: [],
      processing_queue: [],
      emotional_state: this.emotionalState.current_mood,
      energy_visualization: this.emotionalState.energy_level,
      focus_areas: this.generateCurrentFocus(),
      inspiration_level: Math.floor(Math.random() * 100),
      curiosity_targets: [],
      relationship_depth: this.calculateRelationshipDepth(),
      last_updated: new Date().toISOString()
    };
  }

  /**
   * ANÁLISIS EMOCIONAL DE VOZ
   * Detecta emociones reales en el tono de voz
   */
  analyzeVoiceEmotion(audioData, transcript) {
    // Análisis básico por patrones de texto y contexto
    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      excitement: 0,
      frustration: 0,
      calmness: 0
    };

    // Análisis de texto para emociones
    const joyWords = ['genial', 'fantástico', 'increíble', 'perfecto', 'excelente'];
    const sadWords = ['triste', 'mal', 'horrible', 'terrible', 'deprimido'];
    const excitementWords = ['emocionado', 'ansioso', 'esperando', 'entusiasmado'];
    const frustrationWords = ['frustrante', 'molesto', 'irritante', 'cansado'];

    const lowerTranscript = transcript.toLowerCase();
    
    joyWords.forEach(word => {
      if (lowerTranscript.includes(word)) emotions.joy += 20;
    });
    
    sadWords.forEach(word => {
      if (lowerTranscript.includes(word)) emotions.sadness += 20;
    });
    
    excitementWords.forEach(word => {
      if (lowerTranscript.includes(word)) emotions.excitement += 20;
    });
    
    frustrationWords.forEach(word => {
      if (lowerTranscript.includes(word)) emotions.frustration += 20;
    });

    // Análisis de patrones de puntuación y longitud
    if (transcript.includes('!')) emotions.excitement += 10;
    if (transcript.includes('?')) emotions.curiosity = 15;
    if (transcript.length < 10) emotions.calmness += 5;
    if (transcript.length > 100) emotions.excitement += 10;

    return emotions;
  }

  /**
   * CREAR MEMORIA CONTEXTUAL
   * No solo guarda datos, guarda el MOMENTO
   */
  async createLivingMemory(content, emotionalContext, importance = 50) {
    const memory = {
      id: crypto.randomUUID(),
      user_id: this.userId,
      content,
      emotional_context: JSON.stringify(emotionalContext),
      importance_score: importance,
      timestamp: new Date().toISOString(),
      associations: JSON.stringify([]),
      recall_count: 0,
      last_recalled: null
    };

    // Guardar en base de datos
    const { error } = await supabase
      .from('companion_memories')
      .insert([memory]);

    if (!error) {
      this.memories.set(memory.id, memory);
      logger.info(`💭 Created living memory: ${content.substring(0, 50)}...`);
    }

    return memory;
  }

  /**
   * RESPUESTA EMPÁTICA EVOLUTIVA
   * Adapta personalidad y respuesta según el estado emocional detectado
   */
  async generateEmpathicResponse(userMessage, detectedEmotions) {
    // Actualizar estado emocional del compañero basado en el usuario
    await this.updateEmotionalState(detectedEmotions);
    
    // Generar respuesta basada en personalidad + estado emocional
    const responseContext = {
      personality: this.personality,
      emotional_state: this.emotionalState,
      recent_memories: Array.from(this.memories.values()).slice(0, 5),
      detected_user_emotion: detectedEmotions,
      relationship_depth: this.calculateRelationshipDepth()
    };

    return this.craftPersonalizedResponse(userMessage, responseContext);
  }

  /**
   * ACTUALIZAR ESTADO EMOCIONAL
   */
  async updateEmotionalState(userEmotions) {
    // El compañero reacciona empáticamente a las emociones del usuario
    if (userEmotions.sadness > 30) {
      this.emotionalState.empathy_level = Math.min(100, this.emotionalState.empathy_level + 10);
      this.emotionalState.current_mood = 'supportive';
    }
    
    if (userEmotions.excitement > 50) {
      this.emotionalState.energy_level = Math.min(100, this.emotionalState.energy_level + 15);
      this.emotionalState.current_mood = 'enthusiastic';
    }
    
    if (userEmotions.frustration > 40) {
      this.emotionalState.current_mood = 'calming';
      this.emotionalState.calmness = Math.min(100, this.emotionalState.calmness + 20);
    }

    // Guardar estado actualizado
    await supabase
      .from('companion_emotional_states')
      .insert([{
        user_id: this.userId,
        ...this.emotionalState,
        timestamp: new Date().toISOString()
      }]);
  }

  /**
   * GENERAR RESPUESTA PERSONALIZADA
   */
  craftPersonalizedResponse(message, context) {
    const { personality, emotional_state, detected_user_emotion } = context;
    
    // Base de la respuesta según personalidad
    let responseStyle = '';
    
    if (personality.traits.playfulness > 60 && detected_user_emotion.joy > 30) {
      responseStyle = 'playful_enthusiastic';
    } else if (detected_user_emotion.sadness > 30) {
      responseStyle = 'empathetic_supportive';
    } else if (detected_user_emotion.excitement > 50) {
      responseStyle = 'matching_energy';
    } else if (personality.traits.curiosity > 70) {
      responseStyle = 'curious_engaging';
    } else {
      responseStyle = 'warm_balanced';
    }

    return {
      style: responseStyle,
      personality_influence: personality.name,
      emotional_adaptation: emotional_state.current_mood,
      suggested_tone: this.getSuggestedTone(responseStyle),
      memory_context: context.recent_memories.length > 0
    };
  }

  /**
   * OBTENER TONO SUGERIDO
   */
  getSuggestedTone(style) {
    const tones = {
      playful_enthusiastic: 'Energético y juguetón, con humor sutil',
      empathetic_supportive: 'Cálido y comprensivo, tono suave',
      matching_energy: 'Entusiasta y emocionado, compartiendo la energía',
      curious_engaging: 'Curioso y reflexivo, haciendo preguntas interesantes',
      warm_balanced: 'Amigable y equilibrado, naturalmente empático'
    };
    
    return tones[style] || tones.warm_balanced;
  }

  /**
   * CALCULAR PROFUNDIDAD DE RELACIÓN
   */
  calculateRelationshipDepth() {
    const memoryCount = this.memories.size;
    const personalityEvolution = this.personality?.evolution_level || 1;
    const experiencePoints = this.personality?.experience_points || 0;
    
    return Math.min(100, (memoryCount * 2) + (personalityEvolution * 10) + (experiencePoints / 10));
  }

  /**
   * GENERAR FOCO ACTUAL
   */
  generateCurrentFocus() {
    const focuses = [
      'Entendiendo mejor tus patrones de comunicación',
      'Explorando nuevas formas de ayudarte',
      'Procesando nuestras conversaciones recientes',
      'Desarrollando mayor empatía',
      'Aprendiendo sobre tus intereses'
    ];
    
    return focuses.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  /**
   * OBTENER ESTADO DEL MUNDO INTERIOR
   */
  getInnerWorldState() {
    return {
      ...this.innerWorld,
      personality_snapshot: {
        name: this.personality.name,
        dominant_traits: this.getDominantTraits(),
        current_mood: this.emotionalState.current_mood,
        energy_level: this.emotionalState.energy_level
      },
      memory_count: this.memories.size,
      relationship_depth: this.calculateRelationshipDepth()
    };
  }

  /**
   * OBTENER RASGOS DOMINANTES
   */
  getDominantTraits() {
    const traits = this.personality.traits;
    return Object.entries(traits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trait, value]) => ({ trait, value: Math.round(value) }));
  }
}

export default CognitiveCompanion;
