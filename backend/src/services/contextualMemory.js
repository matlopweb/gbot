import { logger } from '../utils/logger.js';

/**
 * Sistema de Memoria Contextual con IA
 * Aprende y recuerda información sobre el usuario
 */
export class ContextualMemory {
  constructor(userId) {
    this.userId = userId;
    
    // Memoria estructurada
    this.memory = {
      // Información personal
      personal: {
        name: null,
        role: null, // Ej: "desarrollador", "estudiante"
        interests: [], // ["React", "IA", "música"]
        timezone: 'America/Argentina/Buenos_Aires'
      },
      
      // Preferencias de trabajo
      workPreferences: {
        preferredMeetingTimes: [], // ["09:00", "10:00"]
        workHoursStart: 9,
        workHoursEnd: 18,
        breakPreferences: {
          frequency: 120, // minutos
          duration: 15 // minutos
        },
        focusHours: [] // Horas de concentración profunda
      },
      
      // Patrones detectados
      patterns: {
        recurringMeetings: [], // { day: 'martes', time: '10:00', topic: 'standup' }
        taskPatterns: [], // { type: 'revisar código', frequency: 'diario' }
        peakProductivity: [], // Horas más productivas
        commonProjects: [] // Proyectos frecuentes
      },
      
      // Contexto de conversaciones
      conversationContext: {
        recentTopics: [], // Últimos 10 temas discutidos
        ongoingProjects: [], // Proyectos actuales
        pendingQuestions: [], // Preguntas sin responder
        lastInteraction: null
      },
      
      // Aprendizaje continuo
      learning: {
        currentCourses: [], // Cursos en progreso
        skills: [], // Habilidades y nivel
        studySchedule: [], // Horarios de estudio
        learningGoals: [] // Objetivos de aprendizaje
      },
      
      // Relaciones y contactos
      relationships: {
        frequentContacts: [], // Personas con las que interactúa
        teamMembers: [],
        importantDates: [] // Cumpleaños, aniversarios
      },
      
      // Historial de interacciones
      interactions: {
        totalMessages: 0,
        tasksCreated: 0,
        eventsCreated: 0,
        questionsAnswered: 0,
        lastActive: null
      }
    };
    
    // Cargar memoria desde almacenamiento
    this.loadMemory();
  }

  /**
   * Carga la memoria desde almacenamiento persistente
   */
  async loadMemory() {
    try {
      // TODO: Cargar desde Supabase o archivo local
      logger.info(`Memory loaded for user: ${this.userId}`);
    } catch (error) {
      logger.error('Error loading memory:', error);
    }
  }

  /**
   * Guarda la memoria en almacenamiento persistente
   */
  async saveMemory() {
    try {
      // TODO: Guardar en Supabase o archivo local
      logger.info(`Memory saved for user: ${this.userId}`);
    } catch (error) {
      logger.error('Error saving memory:', error);
    }
  }

  /**
   * Aprende de una nueva interacción
   */
  async learnFromInteraction(interaction) {
    const { type, content, metadata } = interaction;
    
    switch (type) {
      case 'message':
        await this.analyzeMessage(content, metadata);
        break;
        
      case 'task_created':
        await this.learnFromTask(metadata);
        break;
        
      case 'event_created':
        await this.learnFromEvent(metadata);
        break;
        
      case 'preference_stated':
        await this.updatePreference(metadata);
        break;
    }
    
    // Actualizar estadísticas
    this.memory.interactions.totalMessages++;
    this.memory.interactions.lastActive = new Date().toISOString();
    
    await this.saveMemory();
  }

  /**
   * Analiza un mensaje para extraer información
   */
  async analyzeMessage(content, metadata) {
    // Detectar temas mencionados
    const topics = this.extractTopics(content);
    this.memory.conversationContext.recentTopics = [
      ...topics,
      ...this.memory.conversationContext.recentTopics
    ].slice(0, 10);
    
    // Detectar proyectos mencionados
    const projects = this.extractProjects(content);
    projects.forEach(project => {
      if (!this.memory.conversationContext.ongoingProjects.includes(project)) {
        this.memory.conversationContext.ongoingProjects.push(project);
      }
    });
    
    // Detectar preferencias explícitas
    this.detectPreferences(content);
    
    // Detectar información personal
    this.detectPersonalInfo(content);
  }

  /**
   * Aprende de una tarea creada
   */
  async learnFromTask(taskData) {
    const { title, due, notes } = taskData;
    
    this.memory.interactions.tasksCreated++;
    
    // Detectar patrones de tareas
    const taskType = this.categorizeTask(title);
    const existingPattern = this.memory.patterns.taskPatterns.find(
      p => p.type === taskType
    );
    
    if (existingPattern) {
      existingPattern.count++;
      existingPattern.lastCreated = new Date().toISOString();
    } else {
      this.memory.patterns.taskPatterns.push({
        type: taskType,
        count: 1,
        lastCreated: new Date().toISOString()
      });
    }
    
    // Detectar horarios preferidos para crear tareas
    if (due) {
      const dueDate = new Date(due);
      const hour = dueDate.getHours();
      // Analizar patrones de horarios
    }
  }

  /**
   * Aprende de un evento creado
   */
  async learnFromEvent(eventData) {
    const { summary, start, end } = eventData;
    
    this.memory.interactions.eventsCreated++;
    
    // Detectar reuniones recurrentes
    const startDate = new Date(start);
    const dayOfWeek = startDate.toLocaleDateString('es-ES', { weekday: 'long' });
    const time = startDate.toTimeString().slice(0, 5);
    
    const existingRecurring = this.memory.patterns.recurringMeetings.find(
      m => m.day === dayOfWeek && m.time === time
    );
    
    if (existingRecurring) {
      existingRecurring.count++;
      existingRecurring.lastOccurrence = start;
    } else {
      this.memory.patterns.recurringMeetings.push({
        day: dayOfWeek,
        time: time,
        topic: summary,
        count: 1,
        lastOccurrence: start
      });
    }
    
    // Detectar horarios preferidos para reuniones
    const hour = startDate.getHours();
    if (!this.memory.workPreferences.preferredMeetingTimes.includes(time)) {
      this.memory.workPreferences.preferredMeetingTimes.push(time);
    }
  }

  /**
   * Actualiza una preferencia del usuario
   */
  async updatePreference(preference) {
    const { category, key, value } = preference;
    
    if (this.memory[category] && this.memory[category][key] !== undefined) {
      this.memory[category][key] = value;
      logger.info(`Preference updated: ${category}.${key} = ${value}`);
    }
  }

  /**
   * Extrae temas de un mensaje
   */
  extractTopics(content) {
    const topics = [];
    const keywords = {
      'programación': ['código', 'programar', 'desarrollar', 'bug', 'error', 'función'],
      'reuniones': ['reunión', 'meeting', 'junta', 'llamada'],
      'tareas': ['tarea', 'pendiente', 'hacer', 'completar'],
      'proyectos': ['proyecto', 'aplicación', 'sistema', 'app'],
      'aprendizaje': ['aprender', 'estudiar', 'curso', 'tutorial']
    };
    
    const lowerContent = content.toLowerCase();
    
    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => lowerContent.includes(word))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  /**
   * Extrae proyectos mencionados
   */
  extractProjects(content) {
    const projects = [];
    // Buscar patrones como "proyecto X", "app X", "sistema X"
    const projectPatterns = [
      /proyecto\s+(\w+)/gi,
      /app\s+(\w+)/gi,
      /aplicación\s+(\w+)/gi,
      /sistema\s+(\w+)/gi
    ];
    
    projectPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        projects.push(match[1]);
      }
    });
    
    return projects;
  }

  /**
   * Detecta preferencias en el mensaje
   */
  detectPreferences(content) {
    const lowerContent = content.toLowerCase();
    
    // Detectar preferencias de horario
    if (lowerContent.includes('prefiero') && lowerContent.includes('mañana')) {
      this.memory.workPreferences.preferredMeetingTimes = ['09:00', '10:00', '11:00'];
    }
    
    if (lowerContent.includes('prefiero') && lowerContent.includes('tarde')) {
      this.memory.workPreferences.preferredMeetingTimes = ['14:00', '15:00', '16:00'];
    }
    
    // Detectar intereses
    const interests = ['react', 'vue', 'angular', 'node', 'python', 'ia', 'machine learning'];
    interests.forEach(interest => {
      if (lowerContent.includes(interest) && 
          !this.memory.personal.interests.includes(interest)) {
        this.memory.personal.interests.push(interest);
      }
    });
  }

  /**
   * Detecta información personal
   */
  detectPersonalInfo(content) {
    // Detectar nombre
    const namePattern = /me llamo (\w+)|mi nombre es (\w+)|soy (\w+)/i;
    const nameMatch = content.match(namePattern);
    if (nameMatch) {
      this.memory.personal.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }
    
    // Detectar rol
    const rolePattern = /soy (desarrollador|programador|estudiante|diseñador|ingeniero)/i;
    const roleMatch = content.match(rolePattern);
    if (roleMatch) {
      this.memory.personal.role = roleMatch[1];
    }
  }

  /**
   * Categoriza una tarea
   */
  categorizeTask(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('revisar') || lowerTitle.includes('review')) {
      return 'revisión';
    }
    if (lowerTitle.includes('reunión') || lowerTitle.includes('meeting')) {
      return 'reunión';
    }
    if (lowerTitle.includes('código') || lowerTitle.includes('programar')) {
      return 'programación';
    }
    if (lowerTitle.includes('estudiar') || lowerTitle.includes('aprender')) {
      return 'aprendizaje';
    }
    
    return 'general';
  }

  /**
   * Obtiene contexto relevante para una conversación
   */
  getRelevantContext(query) {
    const context = {
      recentTopics: this.memory.conversationContext.recentTopics.slice(0, 5),
      ongoingProjects: this.memory.conversationContext.ongoingProjects,
      preferences: {
        name: this.memory.personal.name,
        role: this.memory.personal.role,
        interests: this.memory.personal.interests,
        preferredTimes: this.memory.workPreferences.preferredMeetingTimes
      },
      patterns: {
        recurringMeetings: this.memory.patterns.recurringMeetings.filter(m => m.count > 2),
        commonTasks: this.memory.patterns.taskPatterns.filter(t => t.count > 3)
      }
    };
    
    return context;
  }

  /**
   * Genera un resumen de lo que el bot sabe del usuario
   */
  generateUserProfile() {
    const profile = [];
    
    if (this.memory.personal.name) {
      profile.push(`Tu nombre es ${this.memory.personal.name}`);
    }
    
    if (this.memory.personal.role) {
      profile.push(`Eres ${this.memory.personal.role}`);
    }
    
    if (this.memory.personal.interests.length > 0) {
      profile.push(`Te interesa: ${this.memory.personal.interests.join(', ')}`);
    }
    
    if (this.memory.workPreferences.preferredMeetingTimes.length > 0) {
      profile.push(`Prefieres reuniones a las: ${this.memory.workPreferences.preferredMeetingTimes.join(', ')}`);
    }
    
    if (this.memory.patterns.recurringMeetings.length > 0) {
      const recurring = this.memory.patterns.recurringMeetings[0];
      profile.push(`Tienes reuniones recurrentes los ${recurring.day} a las ${recurring.time}`);
    }
    
    if (this.memory.conversationContext.ongoingProjects.length > 0) {
      profile.push(`Proyectos actuales: ${this.memory.conversationContext.ongoingProjects.join(', ')}`);
    }
    
    return profile.join('. ');
  }

  /**
   * Predice lo que el usuario podría necesitar
   */
  predictNeeds() {
    const predictions = [];
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Predecir reuniones recurrentes
    this.memory.patterns.recurringMeetings.forEach(meeting => {
      if (meeting.day === dayOfWeek && meeting.count > 2) {
        predictions.push({
          type: 'recurring_meeting',
          message: `Usualmente tienes "${meeting.topic}" los ${meeting.day} a las ${meeting.time}. ¿Quieres que lo agende?`,
          action: 'create_event',
          data: meeting
        });
      }
    });
    
    // Predecir tareas comunes
    this.memory.patterns.taskPatterns.forEach(pattern => {
      if (pattern.count > 5) {
        predictions.push({
          type: 'common_task',
          message: `Noto que frecuentemente creas tareas de tipo "${pattern.type}". ¿Necesitas ayuda con eso?`,
          action: 'suggest_task',
          data: pattern
        });
      }
    });
    
    return predictions;
  }
}
