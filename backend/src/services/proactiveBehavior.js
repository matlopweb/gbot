import { logger } from '../utils/logger.js';

/**
 * Sistema de comportamiento proactivo para GBot
 * Hace que el bot sea mÃ¡s "vivo" e interactivo
 */
export class ProactiveBehavior {
  constructor(session, services = {}) {
    this.session = session;
    this.calendarService = services.calendarService;
    this.tasksService = services.tasksService;
    this.timers = [];
    this.lastInteraction = Date.now();
    this.hasGreeted = false; // Flag para evitar saludos repetidos
    this.userPreferences = {
      name: null,
      workHoursStart: 9,
      workHoursEnd: 18,
      breakReminders: true,
      taskReminders: true
    };
  }

  hasRecentUserActivity(windowMs = 8000) {
    const lastUserMessage = this.session?.lastUserMessageAt || 0;
    return lastUserMessage > 0 && Date.now() - lastUserMessage < windowMs;
  }

  /**
   * Inicia el comportamiento proactivo
   */
  start() {
    // Saludo inicial basado en la hora (solo una vez)
    setTimeout(() => {
      this.sendGreeting();
    }, 1000); // Esperar 1 segundo despuÃ©s de conectar

    // Revisar tareas pendientes cada 30 minutos
    this.scheduleTaskCheck(30 * 60 * 1000);

    // Recordatorios de eventos prÃ³ximos
    this.scheduleEventReminders(15 * 60 * 1000);

    // Animaciones de idle aleatorias
    this.scheduleIdleAnimations(20 * 1000);

    // Sugerencias de descanso cada 2 horas
    this.scheduleBreakReminders(2 * 60 * 60 * 1000);
    
    // Predicciones inteligentes cada hora
    this.schedulePredictiveActions(60 * 60 * 1000);

    logger.info('Proactive behavior started');
  }

  /**
   * Detiene todos los comportamientos proactivos
   */
  stop() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    logger.info('Proactive behavior stopped');
  }

  /**
   * EnvÃ­a un saludo basado en la hora del dÃ­a
   */
  sendGreeting() {
    // Solo saludar una vez por sesiÃ³n
    if (this.hasGreeted) {
      return;
    }
    
    if (this.hasRecentUserActivity(6000)) {
      this.hasGreeted = true;
      logger.info('Skipping proactive greeting due to recent user activity');
      return;
    }

    this.hasGreeted = true;
    
    const hour = new Date().getHours();
    let greeting = '';
    let emotion = 'happy';

    if (hour >= 5 && hour < 12) {
      greeting = 'Â¡Buenos dÃ­as! â˜€ï¸ Â¿Listo para un dÃ­a productivo?';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Â¡Buenas tardes! ðŸ˜Š Â¿En quÃ© puedo ayudarte hoy?';
    } else if (hour >= 18 && hour < 22) {
      greeting = 'Â¡Buenas noches! ðŸŒ™ Â¿CÃ³mo estuvo tu dÃ­a?';
    } else {
      greeting = 'Â¡Hola! ðŸŒŸ Trabajando hasta tarde, Â¿eh? Estoy aquÃ­ para ayudarte.';
      emotion = 'idle';
    }

    this.sendProactiveMessage(greeting, emotion);
  }

  /**
   * Revisa tareas pendientes y envÃ­a recordatorios
   */
  async scheduleTaskCheck(interval) {
    const checkTasks = async () => {
      try {
        if (!this.tasksService) return;

        const result = await this.tasksService.listTasks({
          tasklist: '@default',
          maxResults: 10
        });

        const tasks = result.tasks || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tareas vencidas
        const overdueTasks = tasks.filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today && task.status !== 'completed';
        });

        // Tareas para hoy
        const todayTasks = tasks.filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime() && task.status !== 'completed';
        });

        if (overdueTasks.length > 0) {
          this.sendProactiveMessage(
            `âš ï¸ Tienes ${overdueTasks.length} tarea${overdueTasks.length > 1 ? 's' : ''} atrasada${overdueTasks.length > 1 ? 's' : ''}. Â¿Quieres que te ayude a organizarlas?`,
            'confused'
          );
        } else if (todayTasks.length > 0) {
          this.sendProactiveMessage(
            `ðŸ“‹ Tienes ${todayTasks.length} tarea${todayTasks.length > 1 ? 's' : ''} para hoy. Â¡Vamos a completarlas!`,
            'excited'
          );
        }
      } catch (error) {
        logger.error('Error checking tasks:', error);
      }

      // Programar siguiente revisiÃ³n
      const timer = setTimeout(checkTasks, interval);
      this.timers.push(timer);
    };

    // Primera revisiÃ³n despuÃ©s de 5 minutos
    const timer = setTimeout(checkTasks, 5 * 60 * 1000);
    this.timers.push(timer);
  }

  /**
   * Programa recordatorios de eventos prÃ³ximos
   */
  async scheduleEventReminders(interval) {
    const checkEvents = async () => {
      try {
        if (!this.calendarService) return;

        const result = await this.calendarService.listEvents(5);
        const events = result.events || [];
        const now = new Date();
        const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

        // Eventos en los prÃ³ximos 30 minutos
        const upcomingEvents = events.filter(event => {
          if (!event.start) return false;
          const eventStart = new Date(event.start);
          return eventStart > now && eventStart <= in30Minutes;
        });

        if (upcomingEvents.length > 0) {
          const event = upcomingEvents[0];
          const minutesUntil = Math.round((new Date(event.start) - now) / 60000);
          this.sendProactiveMessage(
            `â° Recordatorio: "${event.summary}" en ${minutesUntil} minutos`,
            'excited'
          );
        }
      } catch (error) {
        logger.error('Error checking events:', error);
      }

      // Programar siguiente revisiÃ³n
      const timer = setTimeout(checkEvents, interval);
      this.timers.push(timer);
    };

    // Primera revisiÃ³n despuÃ©s de 2 minutos
    const timer = setTimeout(checkEvents, 2 * 60 * 1000);
    this.timers.push(timer);
  }

  /**
   * Programa animaciones de idle aleatorias
   */
  scheduleIdleAnimations(interval) {
    const sendIdleAnimation = () => {
      const timeSinceLastInteraction = Date.now() - this.lastInteraction;
      
      // Solo si no ha habido interacciÃ³n en los Ãºltimos 30 segundos
      if (timeSinceLastInteraction > 30000) {
        const animations = [
          { type: 'look_around', emotion: 'idle' },
          { type: 'blink', emotion: 'idle' },
          { type: 'stretch', emotion: 'happy' },
          { type: 'yawn', emotion: 'idle' }
        ];

        const animation = animations[Math.floor(Math.random() * animations.length)];
        
        this.sendToClient({
          type: 'idle_animation',
          animation: animation.type,
          emotion: animation.emotion
        });
      }

      // Programar siguiente animaciÃ³n
      const nextInterval = interval + Math.random() * 10000; // VariaciÃ³n aleatoria
      const timer = setTimeout(sendIdleAnimation, nextInterval);
      this.timers.push(timer);
    };

    const timer = setTimeout(sendIdleAnimation, interval);
    this.timers.push(timer);
  }

  /**
   * Programa recordatorios de descanso
   */
  scheduleBreakReminders(interval) {
    const sendBreakReminder = () => {
      const hour = new Date().getHours();
      
      // Solo durante horas de trabajo
      if (hour >= this.userPreferences.workHoursStart && 
          hour < this.userPreferences.workHoursEnd) {
        
        const messages = [
          'â˜• Â¿QuÃ© tal un descanso? Has estado trabajando mucho.',
          'ðŸ§˜ Recuerda tomar un respiro. Tu salud es importante.',
          'ðŸ’§ Â¿Ya tomaste agua? Mantente hidratado.',
          'ðŸ‘€ Descansa la vista un momento. Mira algo lejos de la pantalla.'
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.sendProactiveMessage(message, 'happy');
      }

      // Programar siguiente recordatorio
      const timer = setTimeout(sendBreakReminder, interval);
      this.timers.push(timer);
    };

    const timer = setTimeout(sendBreakReminder, interval);
    this.timers.push(timer);
  }

  /**
   * Celebra cuando el usuario completa tareas
   */
  celebrateCompletion(taskName) {
    const celebrations = [
      `ðŸŽ‰ Â¡Genial! Completaste "${taskName}". Â¡Sigue asÃ­!`,
      `âœ¨ Â¡Bien hecho! Una tarea menos. Â¡Eres increÃ­ble!`,
      `ðŸŒŸ Â¡Excelente! "${taskName}" completada. Â¡Vamos por mÃ¡s!`,
      `ðŸŽŠ Â¡Bravo! Cada tarea completada es un paso hacia tus metas.`
    ];

    const message = celebrations[Math.floor(Math.random() * celebrations.length)];
    this.sendProactiveMessage(message, 'excited');
  }

  /**
   * Reacciona a eventos del usuario
   */
  reactToUserAction(action, context = {}) {
    this.lastInteraction = Date.now();

    switch (action) {
      case 'task_created':
        this.sendProactiveMessage(
          `ðŸ“ Â¡Perfecto! AgreguÃ© "${context.taskName}" a tu lista. Â¡No te preocupes, te recordarÃ©!`,
          'happy'
        );
        break;

      case 'event_created':
        this.sendProactiveMessage(
          `ðŸ“… Â¡Listo! "${context.eventName}" estÃ¡ en tu calendario. Te avisarÃ© antes.`,
          'excited'
        );
        break;

      case 'multiple_tasks':
        if (context.count > 5) {
          this.sendProactiveMessage(
            `ðŸ˜® Â¡Wow! Tienes ${context.count} tareas. Â¿Quieres que te ayude a priorizarlas?`,
            'confused'
          );
        }
        break;

      case 'no_tasks':
        this.sendProactiveMessage(
          `ðŸŽˆ Â¡IncreÃ­ble! No tienes tareas pendientes. Â¡Disfruta tu tiempo libre!`,
          'excited'
        );
        break;

      case 'long_session':
        this.sendProactiveMessage(
          `ðŸ’ª Llevas mucho tiempo trabajando. Â¡Eres muy dedicado! Pero recuerda descansar.`,
          'happy'
        );
        break;
    }
  }

  /**
   * EnvÃ­a un mensaje proactivo al usuario
   */
  sendProactiveMessage(message, emotion = 'happy') {
    if (this.hasRecentUserActivity()) {
      logger.info('Skipping proactive message due to recent user activity');
      return;
    }

    this.sendToClient({
      type: 'proactive_message',
      message,
      emotion,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * EnvÃ­a un mensaje al cliente WebSocket
   */
  sendToClient(data) {
    if (this.session.ws && this.session.ws.readyState === 1) {
      this.session.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Actualiza las preferencias del usuario
   */
  updatePreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    logger.info('User preferences updated:', this.userPreferences);
  }

  /**
   * Programa acciones predictivas basadas en patrones
   */
  schedulePredictiveActions(interval) {
    const checkPredictions = async () => {
      try {
        // Obtener predicciones de la memoria contextual
        if (!this.session.contextualMemory) return;
        
        const predictions = this.session.contextualMemory.predictNeeds();
        
        // Enviar predicciones relevantes
        predictions.forEach(prediction => {
          this.sendProactiveMessage(prediction.message, 'excited');
          
          // Enviar tambiÃ©n los datos de la acciÃ³n sugerida
          this.sendToClient({
            type: 'prediction',
            prediction: prediction.type,
            action: prediction.action,
            data: prediction.data,
            message: prediction.message
          });
        });
        
      } catch (error) {
        logger.error('Error checking predictions:', error);
      }

      // Programar siguiente revisiÃ³n
      const timer = setTimeout(checkPredictions, interval);
      this.timers.push(timer);
    };

    // Primera revisiÃ³n despuÃ©s de 10 minutos
    const timer = setTimeout(checkPredictions, 10 * 60 * 1000);
    this.timers.push(timer);
  }
}

