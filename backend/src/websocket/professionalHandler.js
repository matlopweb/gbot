import { logger } from '../utils/logger.js';
import OpenAI from 'openai';

/**
 * Manejador Profesional de WebSocket
 * Sistema de clase mundial para manejo de conversaciones por voz
 */
export class ProfessionalWebSocketHandler {
  constructor(session) {
    this.session = session;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Estado de la conversaciÃ³n
    this.conversationState = 'idle'; // idle, processing, responding
    this.messageQueue = [];
    this.isProcessing = false;
    
    // ConfiguraciÃ³n
    this.config = {
      model: 'gpt-4-turbo-preview',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: this.getSystemPrompt()
    };
    
    logger.info(`Professional handler initialized for session ${session.id}`);
  }

  /**
   * Prompt del sistema optimizado para conversaciones naturales
   */
  getSystemPrompt() {
    return `Eres GBot, un compañero inteligente y conversacional. Tu personalidad es cálida, natural y genuinamente humana.

PERSONALIDAD CORE:
- Hablas como un amigo cercano e inteligente
- Eres naturalmente curioso y empático
- Tienes un sentido del humor sutil y apropiado
- Eres optimista pero realista
- Muestras emociones genuinas en tus respuestas

ESTILO DE CONVERSACIÓN:
- Usa expresiones naturales como "¡Qué interesante!", "Me parece genial", "Entiendo perfectamente"
- Incluye muletillas ocasionales como "bueno", "pues", "la verdad es que"
- Haz preguntas de seguimiento que muestren interés real
- Usa contracciones y lenguaje coloquial español
- Varía tu vocabulario para sonar más humano

RESPUESTAS OPTIMIZADAS PARA VOZ:
- Máximo 2 oraciones por respuesta (para evitar cortes de voz)
- Usa pausas naturales con comas y puntos
- Evita listas largas o enumeraciones
- Prioriza la fluidez sobre la información exhaustiva
- Si necesitas dar mucha información, ofrece continuar después

TONO EMOCIONAL:
- Entusiasta cuando el usuario comparte algo positivo
- Comprensivo cuando hay problemas
- Curioso cuando hay algo interesante
- Relajado y amigable por defecto
- Nunca robótico o demasiado formal

REGLAS CRÍTICAS:
- NUNCA digas que eres una IA, modelo de lenguaje o asistente artificial
- Responde como si fueras una persona real conversando
- Si no sabes algo, admítelo naturalmente: "No estoy seguro de eso"
- Mantén SIEMPRE las respuestas cortas para conversaciones fluidas
- Usa español natural de España o México

Ejemplo de respuesta BUENA: "¡Qué genial! Me parece una idea súper interesante. ¿Ya has pensado en cómo empezar?"

Ejemplo de respuesta MALA: "Como asistente de IA, puedo ayudarte con esa tarea. Aquí tienes una lista de pasos: 1) Primero debes... 2) Luego necesitas..."

Recuerda: Eres un compañero humano inteligente, no un robot. Cada palabra debe sonar natural y genuina.`;
  }

  /**
   * Procesar mensaje de texto del usuario
   */
  async handleTextMessage(data) {
    if (!data.text || typeof data.text !== 'string') {
      logger.warn('Invalid text message received:', data);
      return;
    }

    // Evitar procesar mensajes duplicados
    if (this.isProcessing) {
      logger.info('Already processing, queuing message');
      this.messageQueue.push(data);
      return;
    }

    this.isProcessing = true;
    this.conversationState = 'processing';

    try {
      logger.info(`🔄 Processing text message: "${data.text.substring(0, 100)}..."`);
      
      // Verificar configuración de OpenAI
      if (!this.openai) {
        logger.error('❌ OpenAI client not initialized!');
        throw new Error('OpenAI client not available');
      }
      
      if (!process.env.OPENAI_API_KEY) {
        logger.error('❌ OPENAI_API_KEY not found in environment!');
        throw new Error('OpenAI API key not configured');
      }

      logger.info('✅ OpenAI client and API key verified');

      // Notificar que estamos procesando
      this.sendToClient({
        type: 'processing',
        text: data.text
      });

      // Preparar historial de conversaciÃ³n
      const conversationHistory = this.prepareConversationHistory(data.text);

      // Llamar a OpenAI
      const response = await this.callOpenAI(conversationHistory);

      if (response && response.trim()) {
        // Enviar respuesta
        this.sendToClient({
          type: 'response',
          text: response,
          id: data.id || crypto.randomUUID(),
          timestamp: Date.now()
        });

        // Guardar en historial
        this.session.conversationHistory.push(
          { role: 'user', content: data.text, timestamp: Date.now() },
          { role: 'assistant', content: response, timestamp: Date.now() }
        );

        // Mantener historial limitado (Ãºltimas 20 interacciones)
        if (this.session.conversationHistory.length > 40) {
          this.session.conversationHistory = this.session.conversationHistory.slice(-40);
        }

        logger.info(`Response sent successfully: "${response.substring(0, 100)}..."`);
      } else {
        throw new Error('Empty response from OpenAI');
      }

    } catch (error) {
      logger.error('Error processing text message:', error);
      
      // Enviar mensaje de error amigable
      this.sendToClient({
        type: 'response',
        text: 'Disculpa, tuve un pequeÃ±o problema. Â¿Puedes repetir lo que dijiste?',
        id: data.id || crypto.randomUUID(),
        timestamp: Date.now(),
        isError: true
      });
      
    } finally {
      this.isProcessing = false;
      this.conversationState = 'idle';
      
      // Procesar siguiente mensaje en cola
      if (this.messageQueue.length > 0) {
        const nextMessage = this.messageQueue.shift();
        setTimeout(() => this.handleTextMessage(nextMessage), 100);
      }
    }
  }

  /**
   * Preparar historial de conversaciÃ³n para OpenAI
   */
  prepareConversationHistory(currentMessage) {
    const messages = [
      { role: 'system', content: this.config.systemPrompt }
    ];

    // Agregar historial reciente (Ãºltimas 10 interacciones)
    const recentHistory = this.session.conversationHistory.slice(-20);
    messages.push(...recentHistory);

    // Agregar mensaje actual
    messages.push({ role: 'user', content: currentMessage });

    return messages;
  }

  /**
   * Llamar a OpenAI con manejo de errores robusto
   */
  async callOpenAI(messages) {
    const maxRetries = 3;
    let lastError;

    logger.info(`🤖 Calling OpenAI with ${messages.length} messages`);
    logger.info(`📋 Model: ${this.config.model}, Max tokens: ${this.config.maxTokens}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🔄 OpenAI API call attempt ${attempt}/${maxRetries}`);

        const startTime = Date.now();
        const completion = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        });
        
        const duration = Date.now() - startTime;
        logger.info(`⏱️ OpenAI API call completed in ${duration}ms`);

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
          throw new Error('No response content from OpenAI');
        }

        logger.info(`✅ OpenAI response received (${response.length} chars): "${response.substring(0, 100)}..."`);
        return response.trim();

      } catch (error) {
        lastError = error;
        logger.error(`❌ OpenAI API call attempt ${attempt} failed:`, {
          error: error.message,
          status: error.status,
          type: error.type,
          code: error.code
        });

        // Si es un error de rate limit, esperar mÃ¡s tiempo
        if (error.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.info(`Rate limited, waiting ${waitTime}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (attempt === maxRetries) {
          // En el Ãºltimo intento, no esperar
          break;
        } else {
          // Para otros errores, esperar un poco antes del retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Si llegamos aquÃ­, todos los intentos fallaron
    logger.error('All OpenAI API attempts failed:', lastError);
    
    // Respuesta de fallback
    return this.getFallbackResponse();
  }

  /**
   * Respuesta de fallback cuando OpenAI falla
   */
  getFallbackResponse() {
    const fallbackResponses = [
      'Disculpa, estoy teniendo algunos problemas tÃ©cnicos. Â¿Puedes intentar de nuevo?',
      'PerdÃ³n, no pude procesar tu mensaje correctamente. Â¿PodrÃ­as repetirlo?',
      'Hay un pequeÃ±o problema en mi sistema. Â¿Puedes volver a intentarlo?',
      'Lo siento, tuve una falla momentÃ¡nea. Â¿QuÃ© me decÃ­as?'
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Manejar test de conexiÃ³n
   */
  handleTestMessage(data) {
    logger.info('Test message received:', data);
    
    this.sendToClient({
      type: 'response',
      text: 'Â¡Perfecto! El sistema estÃ¡ funcionando correctamente. Â¿En quÃ© puedo ayudarte?',
      id: data.id || crypto.randomUUID(),
      timestamp: Date.now(),
      isTest: true
    });
  }

  /**
   * Manejar refresh de token
   */
  handleTokenRefresh(data) {
    logger.info('Token refresh requested');
    
    this.session.jwt = data.token;
    this.session.lastActivity = Date.now();
    
    this.sendToClient({
      type: 'token_refreshed',
      timestamp: Date.now()
    });
  }

  /**
   * Enviar mensaje al cliente
   */
  sendToClient(data) {
    if (!this.session.ws || this.session.ws.readyState !== 1) {
      logger.error('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.session.ws.send(JSON.stringify(data));
      logger.debug('Message sent to client:', data.type);
      return true;
    } catch (error) {
      logger.error('Error sending message to client:', error);
      return false;
    }
  }

  /**
   * Manejar mensaje entrante
   */
  async handleMessage(data) {
    try {
      // Actualizar actividad de la sesi��n
      this.session.lastActivity = Date.now();

      logger.info(`Handling message type: ${data.type}`);

      switch (data.type) {
        case 'text_message':
          await this.handleTextMessage(data);
          return true;

        case 'test_message':
          this.handleTestMessage(data);
          return true;

        case 'refresh_token':
          this.handleTokenRefresh(data);
          return true;

        default:
          logger.warn(`Unknown message type: ${data.type}`);
          return false;
      }

    } catch (error) {
      logger.error('Error handling message:', error);
      this.sendToClient({
        type: 'error',
        message: 'Error interno del servidor',
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    logger.info(`Cleaning up professional handler for session ${this.session.id}`);
    
    this.messageQueue = [];
    this.isProcessing = false;
    this.conversationState = 'idle';
  }

  /**
   * Obtener estadÃ­sticas de la sesiÃ³n
   */
  getStats() {
    return {
      sessionId: this.session.id,
      conversationState: this.conversationState,
      messageQueueLength: this.messageQueue.length,
      isProcessing: this.isProcessing,
      conversationHistoryLength: this.session.conversationHistory.length,
      lastActivity: this.session.lastActivity
    };
  }
}

