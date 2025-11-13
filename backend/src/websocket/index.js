import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIRealtimeSession } from './openaiRealtime.js';
import { BotStateMachine } from './stateMachine.js';
import { ProfessionalWebSocketHandler } from './professionalHandler.js';
import { verifyToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { ProactiveBehavior } from '../services/proactiveBehavior.js';
import { ContextualMemory } from '../services/contextualMemory.js';
import { trackWsConnection, trackWsMessage, trackWsError } from '../middleware/metrics.js';

const sessions = new Map();

export function setupWebSocket(wss) {
  wss.on('connection', async (ws, req) => {
    const sessionId = uuidv4();
    logger.info(`New WebSocket connection: ${sessionId}`);

    // Verificar autenticaciÃ³n
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
      return;
    }
    const userId = decoded.userId;

    // Crear sesión profesional
    const session = {
      id: sessionId,
      userId,
      ws,
      tokenExp: null,
      jwt: token,
      openaiSession: null,
      stateMachine: new BotStateMachine(),
      lastActivity: Date.now(),
      userContext: {},
      proactiveBehavior: null,
      calendarService: null,
      tasksService: null,
      spotifyService: null,
      productivityServices: {}, // notion, trello, asana
      emailService: null,
      learningService: null,
      contextualMemory: new ContextualMemory(userId), // Sistema de memoria
      conversationHistory: [], // Historial de conversación
      lastGreetingAt: 0,
      lastUserMessageAt: 0,
      processedMessageIds: new Set(),
      professionalHandler: null // Manejador profesional
    };
    
    // Inicializar manejador profesional
    session.professionalHandler = new ProfessionalWebSocketHandler(session);
    bindSessionToken(session, token);

    sessions.set(sessionId, session);
    trackWsConnection(1);

    // Inicializar mÃ¡quina de estados
    session.stateMachine.on('stateChange', (newState) => {
      sendToClient(ws, {
        type: 'state_change',
        state: newState,
        timestamp: Date.now()
      });
    });

    // Manejar mensajes del cliente con sistema profesional
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        trackWsMessage(message.type || 'unknown');
        
        // Usar el manejador profesional
        if (session.professionalHandler) {
          await session.professionalHandler.handleMessage(message);
        } else {
          // Fallback al sistema anterior
          await handleClientMessage(session, message);
        }
      } catch (error) {
        logger.error('Error processing message:', error);
        trackWsError();
        sendToClient(ws, {
          type: 'error',
          message: 'Error processing message',
          error: error.message
        });
      }
    });

    // Heartbeat
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    // Manejar desconexión
    ws.on('close', (code, reason) => {
      const reasonText = reason?.toString?.() || '';
      logger.info(`WebSocket disconnected: ${sessionId} code=${code} reason=${reasonText}`);
      
      // Limpiar recursos
      if (session.openaiSession) {
        session.openaiSession.close();
      }
      if (session.proactiveBehavior) {
        session.proactiveBehavior.stop();
      }
      if (session.professionalHandler) {
        session.professionalHandler.cleanup();
      }
      
      sessions.delete(sessionId);
      trackWsConnection(-1);
    });

    // Enviar confirmaciÃ³n de conexiÃ³n
    sendToClient(ws, {
      type: 'connected',
      sessionId,
      timestamp: Date.now()
    });

    // Iniciar comportamiento autÃ³nomo (desactivado por defecto)
    if (process.env.PROACTIVE_ENABLED === 'true') {
      startAutonomousBehavior(session);
    }
  });

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        trackWsError();
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30 * 1000);

  wss.on('close', () => clearInterval(heartbeatInterval));

  // Cleanup de sesiones inactivas
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutos

    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.lastActivity > timeout) {
        logger.info(`Closing inactive session: ${sessionId}`);
        session.ws.close();
        sessions.delete(sessionId);
      }
    }
  }, 5 * 60 * 1000); // Revisar cada 5 minutos
}

async function handleClientMessage(session, message) {
  session.lastActivity = Date.now();

  if (message.type !== 'refresh_token' && isSessionTokenExpired(session)) {
    sendToClient(session.ws, {
      type: 'error',
      message: 'Authentication expired'
    });
    session.ws.close(4001, 'Authentication expired');
    return;
  }

  switch (message.type) {
    case 'refresh_token':
      try {
        if (!message.token) {
          throw new Error('Token is required');
        }
        const decoded = verifyToken(message.token);
        if (decoded.userId !== session.userId) {
          throw new Error('Token user mismatch');
        }
        session.tokenExp = decoded.exp ? decoded.exp * 1000 : null;
        session.jwt = message.token;
        sendToClient(session.ws, {
          type: 'token_refreshed',
          expiresAt: session.tokenExp
        });
      } catch (error) {
        trackWsError();
        sendToClient(session.ws, {
          type: 'error',
          message: 'Token refresh failed',
          error: error.message
        });
      }
      break;
    case 'start_realtime':
      await startRealtimeSession(session, message.config);
      break;

    case 'audio_chunk':
      // Acumular chunks de audio
      if (!session.audioBuffer) {
        session.audioBuffer = [];
      }
      session.audioBuffer.push(message.audio);
      break;
    
    case 'commit_audio':
      // Procesar audio acumulado con Whisper
      if (session.audioBuffer && session.audioBuffer.length > 0) {
        await processAudioWithWhisper(session);
      }
      break;

    case 'text_message':
      await handleTextMessage(session, message);
      break;

    case 'stop_realtime':
      if (session.openaiSession) {
        session.openaiSession.close();
        session.openaiSession = null;
      }
      session.stateMachine.transition('idle');
      break;

    case 'update_context':
      session.userContext = { ...session.userContext, ...message.context };
      break;

    default:
      logger.warn(`Unknown message type: ${message.type}`);
  }
}

async function startRealtimeSession(session, config = {}) {
  if (session.openaiSession) {
    session.openaiSession.close();
  }

  session.stateMachine.transition('listening');

  session.openaiSession = new OpenAIRealtimeSession({
    userId: session.userId,
    sessionId: session.id,
    onAudioDelta: (audio) => {
      sendToClient(session.ws, {
        type: 'audio_delta',
        audio
      });
    },
    onTextDelta: (text) => {
      sendToClient(session.ws, {
        type: 'text_delta',
        text
      });
    },
    onFunctionCall: async (functionCall) => {
      session.stateMachine.transition('working');
      
      sendToClient(session.ws, {
        type: 'function_call',
        function: functionCall.name,
        arguments: functionCall.arguments
      });

      // Ejecutar la funciÃ³n y retornar resultado
      const result = await executeFunctionCall(session, functionCall);
      
      return result;
    },
    onResponseComplete: () => {
      session.stateMachine.transition('idle');
    },
    onError: (error) => {
      logger.error('OpenAI Realtime error:', error);
      sendToClient(session.ws, {
        type: 'error',
        message: error.message
      });
      session.stateMachine.transition('idle');
    }
  });

  await session.openaiSession.connect();
}

async function handleTextMessage(session, payload) {
  const text = payload?.text || '';
  const messageId = payload?.id || `msg_${Date.now()}`;

  if (!session.processedMessageIds) {
    session.processedMessageIds = new Set();
  }

  if (session.processedMessageIds.has(messageId)) {
    logger.warn('Duplicate text message ignored', { messageId });
    return;
  }
  session.processedMessageIds.add(messageId);
  if (session.processedMessageIds.size > 1000) {
    const first = session.processedMessageIds.values().next().value;
    if (first) session.processedMessageIds.delete(first);
  }

  // Registrar actividad reciente del usuario para coordinar mensajes proactivos
  session.lastUserMessageAt = Date.now();

  session.stateMachine.transition('thinking');

  // SupresiÃ³n de saludos repetidos
  const greetRe = /^(hola|buenas(?:\s+tardes|\s+d[iÃ­]as|\s+noches)?)[!.\s]*$/i;
  const nowTs = Date.now();
  if (greetRe.test((text || '').trim())) {
    if (nowTs - session.lastGreetingAt < 8000) {
      logger.info('Greeting suppressed to avoid duplicates');
      sendToClient(session.ws, { type: 'response', text: 'Â¡Hola! Â¿En quÃ© puedo ayudarte?' });
      session.stateMachine.transition('idle');
      return;
    }
  }

  // Guardar mensaje del usuario en el historial
  if (!session.conversationHistory) {
    session.conversationHistory = [];
  }
  
  session.conversationHistory.push({
    role: 'user',
    content: text,
    timestamp: new Date().toISOString(),
    id: messageId
  });
  
  // Aprender de la interacciÃ³n
  await session.contextualMemory.learnFromInteraction({
    type: 'message',
    content: text,
    metadata: { timestamp: new Date().toISOString() }
  });

  sendToClient(session.ws, {
    type: 'processing',
    text
  });

  try {
    // Importar OpenAI client
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Usar servicios de Google de la sesiÃ³n si ya estÃ¡n inicializados
    let calendarService = session.calendarService;
    let tasksService = session.tasksService;
    
    // Solo inicializar servicios si no existen en la sesiÃ³n
    if (!calendarService || !tasksService) {
      try {
        const { CalendarService } = await import('../services/calendarService.js');
        const { TasksService } = await import('../services/tasksService.js');
        const { getUserTokens } = await import('../utils/tokenStore.js');
        const { ensureFreshGoogleTokens, decryptGoogleTokens } = await import('../utils/googleTokens.js');
        const { setCredentials } = await import('../config/google.js');
        
        // Obtener tokens del usuario
        let storedTokens = await getUserTokens(session.userId);
        storedTokens = await ensureFreshGoogleTokens(session.userId, storedTokens);

        if (storedTokens) {
          const tokens = decryptGoogleTokens(storedTokens);
          
          calendarService = new CalendarService(tokens);
          tasksService = new TasksService(tokens);
          
          // Inicializar servicio de email
          const { EmailService } = await import('../services/emailService.js');
          const emailService = new EmailService(tokens);
          
          // Guardar servicios en la sesiÃ³n
          session.calendarService = calendarService;
          session.tasksService = tasksService;
          session.emailService = emailService;
          
          logger.info('Google services initialized successfully (Calendar, Tasks, Email)');
          
          // Inicializar servicio de aprendizaje
          const { LearningService } = await import('../services/learningService.js');
          session.learningService = new LearningService(session.userId);
          logger.info('Learning service initialized');
          
          // Iniciar comportamiento proactivo solo la primera vez
          if (!session.proactiveBehavior) {
            session.proactiveBehavior = new ProactiveBehavior(session, {
              calendarService: session.calendarService,
              tasksService: session.tasksService
            });
            session.proactiveBehavior.start();
          }
        } else {
          logger.info('No stored tokens found for user');
        }
        
        // Inicializar Spotify si hay tokens
        try {
          const { SpotifyService } = await import('../services/spotifyService.js');
          const { supabase } = await import('../config/supabase.js');
          
          const { data: spotifyTokens } = await supabase
            .from('user_tokens')
            .select('access_token, refresh_token')
            .eq('user_id', session.userId)
            .eq('service', 'spotify')
            .single();
          
          if (spotifyTokens) {
            const { decryptToken } = await import('../utils/encryption.js');
            const accessToken = decryptToken(spotifyTokens.access_token);
            const refreshToken = decryptToken(spotifyTokens.refresh_token);
            
            session.spotifyService = new SpotifyService(accessToken, refreshToken);
            logger.info('Spotify service initialized successfully');
          }
        } catch (spotifyError) {
          logger.warn('Spotify service not available:', spotifyError.message);
        }
        
        // Inicializar servicios de productividad (Notion, Trello, Asana)
        try {
          const { ProductivityService } = await import('../services/productivityService.js');
          const { supabase } = await import('../config/supabase.js');
          
          // Notion
          const { data: notionTokens } = await supabase
            .from('user_tokens')
            .select('access_token')
            .eq('user_id', session.userId)
            .eq('service', 'notion')
            .single();
          
          if (notionTokens) {
            const accessToken = decryptToken(notionTokens.access_token);
            session.productivityServices.notion = new ProductivityService('notion', accessToken);
            logger.info('Notion service initialized');
          }
          
          // Trello
          const { data: trelloTokens } = await supabase
            .from('user_tokens')
            .select('access_token')
            .eq('user_id', session.userId)
            .eq('service', 'trello')
            .single();
          
          if (trelloTokens) {
            const accessToken = decryptToken(trelloTokens.access_token);
            session.productivityServices.trello = new ProductivityService('trello', accessToken);
            logger.info('Trello service initialized');
          }
          
          // Asana
          const { data: asanaTokens } = await supabase
            .from('user_tokens')
            .select('access_token')
            .eq('user_id', session.userId)
            .eq('service', 'asana')
            .single();
          
          if (asanaTokens) {
            const accessToken = decryptToken(asanaTokens.access_token);
            session.productivityServices.asana = new ProductivityService('asana', accessToken);
            logger.info('Asana service initialized');
          }
        } catch (productivityError) {
          logger.warn('Productivity services not available:', productivityError.message);
        }
        
      } catch (googleError) {
        logger.warn('Google services not available:', googleError.message);
        // Continuar sin servicios de Google
      }
    }
    
    // Inicializar servicio de bÃºsqueda web
    const { WebSearchService } = await import('../services/webSearch.js');
    const webSearch = new WebSearchService();
    
    // Inicializar contexto ambiental
    const { EnvironmentalContext } = await import('../services/environmentalContext.js');
    const envContext = new EnvironmentalContext();
    
    // Definir funciones disponibles para GPT
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_web',
          description: 'Busca informaciÃ³n actualizada en internet. Usa esta funciÃ³n cuando el usuario pregunte sobre algo que no conoces, informaciÃ³n reciente, noticias, o conceptos nuevos despuÃ©s de octubre 2023.',
          parameters: {
            type: 'object',
            properties: {
              query: { 
                type: 'string', 
                description: 'La consulta de bÃºsqueda en espaÃ±ol' 
              },
              searchType: {
                type: 'string',
                enum: ['general', 'news', 'entity'],
                description: 'Tipo de bÃºsqueda: general (informaciÃ³n general), news (noticias recientes), entity (informaciÃ³n sobre persona/empresa/concepto)'
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_calendar_event',
          description: 'Crea un nuevo evento en Google Calendar',
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'TÃ­tulo del evento' },
              description: { type: 'string', description: 'DescripciÃ³n del evento' },
              start: { type: 'string', description: 'Fecha y hora de inicio (ISO 8601)' },
              end: { type: 'string', description: 'Fecha y hora de fin (ISO 8601)' }
            },
            required: ['summary', 'start', 'end']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_calendar_events',
          description: 'Lista eventos prÃ³ximos del calendario',
          parameters: {
            type: 'object',
            properties: {
              maxResults: { type: 'number', description: 'NÃºmero mÃ¡ximo de eventos a listar' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_task',
          description: 'Crea una nueva tarea en Google Tasks',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'TÃ­tulo de la tarea' },
              notes: { type: 'string', description: 'Notas adicionales' },
              due: { type: 'string', description: 'Fecha de vencimiento (ISO 8601)' }
            },
            required: ['title']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_tasks',
          description: 'Lista las tareas pendientes',
          parameters: {
            type: 'object',
            properties: {
              maxResults: { type: 'number', description: 'NÃºmero mÃ¡ximo de tareas' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Obtiene el clima actual y pronÃ³stico. Usa cuando el usuario pregunte sobre el clima, temperatura o condiciones meteorolÃ³gicas.',
          parameters: {
            type: 'object',
            properties: {
              includeForecast: { 
                type: 'boolean', 
                description: 'Si debe incluir pronÃ³stico de los prÃ³ximos dÃ­as' 
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_clothing_suggestion',
          description: 'Sugiere quÃ© ropa usar segÃºn el clima actual. Usa cuando el usuario pregunte quÃ© ponerse o cÃ³mo vestirse.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'check_good_time_to_go_out',
          description: 'Verifica si es buen momento para salir segÃºn el clima. Usa cuando el usuario pregunte si puede salir o si es buen momento.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_play',
          description: 'Reproduce mÃºsica en Spotify. Usa cuando el usuario pida reproducir mÃºsica, play, o iniciar reproducciÃ³n.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_pause',
          description: 'Pausa la mÃºsica en Spotify. Usa cuando el usuario pida pausar, detener o parar la mÃºsica.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_next',
          description: 'Salta a la siguiente canciÃ³n. Usa cuando el usuario pida siguiente, next, o cambiar de canciÃ³n.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_previous',
          description: 'Vuelve a la canciÃ³n anterior. Usa cuando el usuario pida anterior, previous, o volver atrÃ¡s.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_volume',
          description: 'Ajusta el volumen de Spotify. Usa cuando el usuario pida subir/bajar volumen o ajustar el sonido.',
          parameters: {
            type: 'object',
            properties: {
              volume: {
                type: 'number',
                description: 'Volumen en porcentaje (0-100)'
              }
            },
            required: ['volume']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_play_for_activity',
          description: 'Reproduce mÃºsica apropiada para una actividad especÃ­fica (programar, estudiar, ejercicio, relajarse, etc.). Usa cuando el usuario pida mÃºsica para una actividad.',
          parameters: {
            type: 'object',
            properties: {
              activity: {
                type: 'string',
                description: 'La actividad para la que se quiere mÃºsica (programar, estudiar, ejercicio, relajarse, trabajar, etc.)'
              }
            },
            required: ['activity']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_current_track',
          description: 'Obtiene informaciÃ³n sobre la canciÃ³n que estÃ¡ sonando actualmente. Usa cuando el usuario pregunte quÃ© mÃºsica estÃ¡ sonando o quÃ© canciÃ³n es.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'spotify_search',
          description: 'Busca y reproduce una canciÃ³n, artista o playlist especÃ­fica. Usa cuando el usuario pida una canciÃ³n o artista en particular.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Nombre de la canciÃ³n, artista o playlist a buscar'
              },
              type: {
                type: 'string',
                enum: ['track', 'playlist'],
                description: 'Tipo de bÃºsqueda: track (canciÃ³n) o playlist'
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'productivity_get_tasks',
          description: 'Obtiene tareas de Notion, Trello o Asana. Usa cuando el usuario pregunte por sus tareas en estas plataformas.',
          parameters: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['notion', 'trello', 'asana'],
                description: 'Plataforma de la que obtener tareas'
              }
            },
            required: ['platform']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'productivity_create_task',
          description: 'Crea una tarea en Notion, Trello o Asana. Usa cuando el usuario pida crear una tarea en estas plataformas.',
          parameters: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['notion', 'trello', 'asana'],
                description: 'Plataforma donde crear la tarea'
              },
              title: {
                type: 'string',
                description: 'TÃ­tulo de la tarea'
              },
              description: {
                type: 'string',
                description: 'DescripciÃ³n de la tarea (opcional)'
              },
              dueDate: {
                type: 'string',
                description: 'Fecha de vencimiento en formato ISO 8601 (opcional)'
              }
            },
            required: ['platform', 'title']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'productivity_sync_tasks',
          description: 'Sincroniza tareas entre plataformas (Notion, Trello, Asana). Usa cuando el usuario pida sincronizar o copiar tareas entre plataformas.',
          parameters: {
            type: 'object',
            properties: {
              from: {
                type: 'string',
                enum: ['notion', 'trello', 'asana'],
                description: 'Plataforma origen'
              },
              to: {
                type: 'string',
                enum: ['notion', 'trello', 'asana'],
                description: 'Plataforma destino'
              }
            },
            required: ['from', 'to']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'email_get_recent',
          description: 'Obtiene emails recientes. Usa cuando el usuario pregunte por sus emails, correos o mensajes.',
          parameters: {
            type: 'object',
            properties: {
              maxResults: {
                type: 'number',
                description: 'NÃºmero mÃ¡ximo de emails a obtener (default: 10)'
              },
              onlyUnread: {
                type: 'boolean',
                description: 'Solo emails no leÃ­dos (default: true)'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'email_summarize',
          description: 'Genera un resumen inteligente de emails categorizados. Usa cuando el usuario pida un resumen de sus emails.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'email_mark_read',
          description: 'Marca un email como leÃ­do. Usa cuando el usuario pida marcar un email como leÃ­do.',
          parameters: {
            type: 'object',
            properties: {
              emailIndex: {
                type: 'number',
                description: 'Ãndice del email en la lista (1-based)'
              }
            },
            required: ['emailIndex']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'email_send',
          description: 'EnvÃ­a un email. Usa cuando el usuario pida enviar un correo.',
          parameters: {
            type: 'object',
            properties: {
              to: {
                type: 'string',
                description: 'DirecciÃ³n de email del destinatario'
              },
              subject: {
                type: 'string',
                description: 'Asunto del email'
              },
              body: {
                type: 'string',
                description: 'Cuerpo del email'
              }
            },
            required: ['to', 'subject', 'body']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'learning_add_course',
          description: 'Agrega un curso para seguimiento. Usa cuando el usuario mencione que estÃ¡ tomando un curso.',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'TÃ­tulo del curso'
              },
              platform: {
                type: 'string',
                description: 'Plataforma del curso (udemy, coursera, youtube, custom)'
              },
              totalLessons: {
                type: 'number',
                description: 'Total de lecciones del curso'
              }
            },
            required: ['title']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'learning_get_stats',
          description: 'Obtiene estadÃ­sticas de aprendizaje. Usa cuando el usuario pregunte por su progreso de estudio.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'learning_create_flashcard',
          description: 'Crea un flashcard para estudio. Usa cuando el usuario quiera crear una tarjeta de estudio.',
          parameters: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Pregunta del flashcard'
              },
              answer: {
                type: 'string',
                description: 'Respuesta del flashcard'
              },
              category: {
                type: 'string',
                description: 'CategorÃ­a del flashcard'
              }
            },
            required: ['question', 'answer']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'learning_review_flashcards',
          description: 'Inicia sesiÃ³n de revisiÃ³n de flashcards. Usa cuando el usuario quiera estudiar o revisar flashcards.',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'NÃºmero de flashcards a revisar (default: 10)'
              }
            }
          }
        }
      }
    ];
    
    // Generar respuesta con GPT-4 y function calling
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    
    // Obtener contexto de memoria
    const userContext = session.contextualMemory.getRelevantContext(text);
    const userProfile = session.contextualMemory.generateUserProfile();
    
    const completionParams = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres GBot, un asistente personal inteligente y amigable. 
          Ayudas a los usuarios con su calendario, tareas y conversaciÃ³n general.
          Responde de forma natural, concisa y Ãºtil en espaÃ±ol.
          
          FECHA Y HORA ACTUAL: ${currentDate} ${currentTime} (Zona horaria: America/Argentina/Buenos_Aires)
          
          ${userProfile ? `INFORMACIÃ“N DEL USUARIO:\n${userProfile}\n` : ''}
          
          ${userContext.recentTopics.length > 0 ? `TEMAS RECIENTES: ${userContext.recentTopics.join(', ')}\n` : ''}
          
          ${userContext.ongoingProjects.length > 0 ? `PROYECTOS ACTUALES: ${userContext.ongoingProjects.join(', ')}\n` : ''}
          
          ${userContext.patterns.recurringMeetings.length > 0 ? `REUNIONES RECURRENTES: ${userContext.patterns.recurringMeetings.map(m => `${m.day} a las ${m.time} - ${m.topic}`).join(', ')}\n` : ''}
          
          CAPACIDADES DISPONIBLES:
          - ðŸŒ BÃšSQUEDA WEB: Puedes buscar informaciÃ³n actualizada en internet usando la funciÃ³n search_web
          - Usa bÃºsqueda web cuando:
            * El usuario pregunte sobre algo que no conoces
            * Se mencionen eventos/noticias despuÃ©s de octubre 2023
            * Se pregunte por conceptos nuevos, productos recientes, personas actuales
            * Se necesite informaciÃ³n en tiempo real
          
          ${calendarService && tasksService ? '- ðŸ“… CALENDAR & TASKS: Tienes acceso a Google Calendar y Google Tasks del usuario.' : ''}
          
          ${calendarService && tasksService ? `Cuando el usuario te pida crear eventos o tareas:
          - SIEMPRE usa la fecha actual como referencia
          - Para "maÃ±ana", suma 1 dÃ­a a la fecha actual
          - Para "hoy", usa la fecha actual
          - Usa formato ISO 8601: YYYY-MM-DDTHH:MM:SS
          - Ejemplo: ${currentDate}T14:00:00` : ''}
          
          IMPORTANTE: Si no sabes algo, NO inventes. Usa search_web para obtener informaciÃ³n real y actualizada.
          
          Usa la informaciÃ³n del usuario para personalizar tus respuestas.
          Siempre confirma las acciones realizadas de forma amigable.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    
    // Solo agregar tools y tool_choice si los servicios estÃ¡n disponibles
    if (calendarService && tasksService) {
      completionParams.tools = tools;
      completionParams.tool_choice = 'auto';
    }
    
    const completion = await openai.chat.completions.create(completionParams);

    const responseMessage = completion.choices[0].message;
    
    // Marcar si es saludo para evitar duplicados prÃ³ximos
    let responseText = (responseMessage.content || '').trim();
    if (greetRe.test(responseText)) {
      session.lastGreetingAt = nowTs;
    }

    // Verificar si hay tool calls
    let functionResults = [];
    
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      session.stateMachine.transition('working');
      
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        logger.info(`Executing function: ${functionName}`, functionArgs);
        
        sendToClient(session.ws, {
          type: 'function_call',
          function: functionName,
          arguments: functionArgs
        });
        
        let result;
        
        try {
          switch (functionName) {
            case 'search_web':
              const searchType = functionArgs.searchType || 'general';
              let searchResult;
              
              if (searchType === 'news') {
                searchResult = await webSearch.searchNews(functionArgs.query);
              } else if (searchType === 'entity') {
                searchResult = await webSearch.searchEntity(functionArgs.query);
              } else {
                searchResult = await webSearch.search(functionArgs.query);
              }
              
              if (searchResult) {
                const formattedResults = webSearch.formatResultsForPrompt(searchResult);
                functionResults.push({
                  function: 'bÃºsqueda web',
                  details: formattedResults
                });
              } else {
                functionResults.push({
                  function: 'bÃºsqueda web',
                  details: 'No se pudo realizar la bÃºsqueda. Servicio no disponible.'
                });
              }
              break;
              
            case 'create_calendar_event':
              result = await calendarService.createEvent({
                summary: functionArgs.summary,
                description: functionArgs.description,
                start: functionArgs.start,
                end: functionArgs.end
              });
              functionResults.push({
                function: 'crear evento',
                details: `"${functionArgs.summary}" el ${new Date(functionArgs.start).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`
              });
              
              // ReacciÃ³n proactiva
              if (session.proactiveBehavior) {
                session.proactiveBehavior.reactToUserAction('event_created', {
                  eventName: functionArgs.summary
                });
              }
              
              // Aprender del evento creado
              await session.contextualMemory.learnFromInteraction({
                type: 'event_created',
                content: functionArgs.summary,
                metadata: functionArgs
              });
              break;
              
            case 'list_calendar_events':
              result = await calendarService.listEvents(functionArgs.maxResults || 10);
              const eventCount = result.events?.length || 0;
              let eventDetails = `EncontrÃ© ${eventCount} evento${eventCount !== 1 ? 's' : ''}`;
              
              if (eventCount > 0) {
                eventDetails += ':\n';
                result.events.forEach((event, index) => {
                  eventDetails += `${index + 1}. ${event.summary}`;
                  if (event.start) {
                    const startDate = new Date(event.start);
                    eventDetails += ` - ${startDate.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`;
                  }
                  if (event.description) {
                    eventDetails += ` (${event.description})`;
                  }
                  eventDetails += '\n';
                });
              }
              
              functionResults.push({
                function: 'listar eventos',
                details: eventDetails
              });
              break;
              
            case 'create_task':
              result = await tasksService.createTask({
                title: functionArgs.title,
                notes: functionArgs.notes,
                due: functionArgs.due,
                tasklist: '@default'
              });
              functionResults.push({
                function: 'crear tarea',
                details: `"${functionArgs.title}"${functionArgs.due ? ' para ' + new Date(functionArgs.due).toLocaleDateString('es-ES') : ''}`
              });
              
              // ReacciÃ³n proactiva
              if (session.proactiveBehavior) {
                session.proactiveBehavior.reactToUserAction('task_created', {
                  taskName: functionArgs.title
                });
              }
              
              // Aprender de la tarea creada
              await session.contextualMemory.learnFromInteraction({
                type: 'task_created',
                content: functionArgs.title,
                metadata: functionArgs
              });
              break;
              
            case 'list_tasks':
              result = await tasksService.listTasks({
                tasklist: '@default',
                maxResults: functionArgs.maxResults || 10
              });
              const taskCount = result.tasks?.length || 0;
              let taskDetails = `Tienes ${taskCount} tarea${taskCount !== 1 ? 's' : ''} pendiente${taskCount !== 1 ? 's' : ''}`;
              
              if (taskCount > 0) {
                taskDetails += ':\n';
                result.tasks.forEach((task, index) => {
                  taskDetails += `${index + 1}. ${task.title}`;
                  if (task.due) {
                    const dueDate = new Date(task.due);
                    taskDetails += ` - Vence: ${dueDate.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}`;
                  }
                  if (task.notes) {
                    taskDetails += ` (${task.notes})`;
                  }
                  taskDetails += '\n';
                });
              }
              
              functionResults.push({
                function: 'listar tareas',
                details: taskDetails
              });
              
              // ReacciÃ³n proactiva
              if (session.proactiveBehavior) {
                if (taskCount === 0) {
                  session.proactiveBehavior.reactToUserAction('no_tasks');
                } else if (taskCount > 5) {
                  session.proactiveBehavior.reactToUserAction('multiple_tasks', { count: taskCount });
                }
              }
              break;
              
            case 'get_weather':
              const weather = await envContext.getCurrentWeather();
              let weatherInfo = '';
              
              if (weather) {
                weatherInfo = `Clima en ${weather.city}: ${weather.temperature}Â°C (sensaciÃ³n: ${weather.feelsLike}Â°C), ${weather.description}. Humedad: ${weather.humidity}%, Viento: ${weather.windSpeed} m/s.`;
                
                if (functionArgs.includeForecast) {
                  const forecast = await envContext.getWeatherForecast(3);
                  if (forecast) {
                    weatherInfo += '\n\nPronÃ³stico:\n';
                    forecast.forEach(day => {
                      weatherInfo += `${day.date}: ${day.tempMin}Â°C - ${day.tempMax}Â°C, ${day.description}${day.rain ? ' (posible lluvia)' : ''}\n`;
                    });
                  }
                }
              } else {
                weatherInfo = 'No pude obtener informaciÃ³n del clima.';
              }
              
              functionResults.push({
                function: 'clima',
                details: weatherInfo
              });
              break;
              
            case 'get_clothing_suggestion':
              const suggestion = await envContext.getClothingSuggestion();
              functionResults.push({
                function: 'sugerencia de ropa',
                details: suggestion
              });
              break;
              
            case 'check_good_time_to_go_out':
              const timeCheck = await envContext.isGoodTimeToGoOut();
              functionResults.push({
                function: 'verificar momento para salir',
                details: timeCheck.reason
              });
              break;
              
            case 'spotify_play':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'reproducir mÃºsica',
                  error: 'Spotify no estÃ¡ conectado. Por favor conecta tu cuenta de Spotify primero.'
                });
              } else {
                const playResult = await session.spotifyService.play();
                functionResults.push({
                  function: 'reproducir mÃºsica',
                  details: playResult.message || 'MÃºsica reproduciendo'
                });
              }
              break;
              
            case 'spotify_pause':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'pausar mÃºsica',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const pauseResult = await session.spotifyService.pause();
                functionResults.push({
                  function: 'pausar mÃºsica',
                  details: pauseResult.message || 'MÃºsica pausada'
                });
              }
              break;
              
            case 'spotify_next':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'siguiente canciÃ³n',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const nextResult = await session.spotifyService.next();
                functionResults.push({
                  function: 'siguiente canciÃ³n',
                  details: nextResult.message || 'Siguiente canciÃ³n'
                });
              }
              break;
              
            case 'spotify_previous':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'canciÃ³n anterior',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const prevResult = await session.spotifyService.previous();
                functionResults.push({
                  function: 'canciÃ³n anterior',
                  details: prevResult.message || 'CanciÃ³n anterior'
                });
              }
              break;
              
            case 'spotify_volume':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'ajustar volumen',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const volResult = await session.spotifyService.setVolume(functionArgs.volume);
                functionResults.push({
                  function: 'ajustar volumen',
                  details: volResult.message || `Volumen ajustado a ${functionArgs.volume}%`
                });
              }
              break;
              
            case 'spotify_play_for_activity':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'mÃºsica para actividad',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const activityResult = await session.spotifyService.playForActivity(functionArgs.activity);
                functionResults.push({
                  function: 'mÃºsica para actividad',
                  details: activityResult.success 
                    ? `Reproduciendo mÃºsica para ${functionArgs.activity}: ${activityResult.playlist}`
                    : activityResult.message
                });
              }
              break;
              
            case 'spotify_current_track':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'canciÃ³n actual',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const currentPlayback = await session.spotifyService.getCurrentPlayback();
                if (currentPlayback && currentPlayback.track) {
                  functionResults.push({
                    function: 'canciÃ³n actual',
                    details: `Sonando: "${currentPlayback.track.name}" por ${currentPlayback.track.artist} del Ã¡lbum "${currentPlayback.track.album}"`
                  });
                } else {
                  functionResults.push({
                    function: 'canciÃ³n actual',
                    details: 'No hay mÃºsica reproduciÃ©ndose actualmente'
                  });
                }
              }
              break;
              
            case 'spotify_search':
              if (!session.spotifyService) {
                functionResults.push({
                  function: 'buscar mÃºsica',
                  error: 'Spotify no estÃ¡ conectado.'
                });
              } else {
                const searchType = functionArgs.type || 'track';
                const searchResults = await session.spotifyService.search(functionArgs.query, searchType, 1);
                
                if (searchResults.length > 0) {
                  const item = searchResults[0];
                  await session.spotifyService.play(null, [item.uri]);
                  
                  functionResults.push({
                    function: 'buscar y reproducir',
                    details: searchType === 'track' 
                      ? `Reproduciendo: "${item.name}" por ${item.artist}`
                      : `Reproduciendo playlist: "${item.name}"`
                  });
                } else {
                  functionResults.push({
                    function: 'buscar mÃºsica',
                    details: `No encontrÃ© "${functionArgs.query}"`
                  });
                }
              }
              break;
              
            case 'productivity_get_tasks':
              const platform = functionArgs.platform;
              const service = session.productivityServices[platform];
              
              if (!service) {
                functionResults.push({
                  function: `obtener tareas de ${platform}`,
                  error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} no estÃ¡ conectado.`
                });
              } else {
                const tasks = await service.getTasks();
                const formatted = service.formatTasksForDisplay(tasks);
                functionResults.push({
                  function: `tareas de ${platform}`,
                  details: formatted
                });
              }
              break;
              
            case 'productivity_create_task':
              const createPlatform = functionArgs.platform;
              const createService = session.productivityServices[createPlatform];
              
              if (!createService) {
                functionResults.push({
                  function: `crear tarea en ${createPlatform}`,
                  error: `${createPlatform.charAt(0).toUpperCase() + createPlatform.slice(1)} no estÃ¡ conectado.`
                });
              } else {
                const created = await createService.createTask({
                  title: functionArgs.title,
                  description: functionArgs.description,
                  dueDate: functionArgs.dueDate
                });
                functionResults.push({
                  function: `crear tarea en ${createPlatform}`,
                  details: `Tarea creada: "${created.title}"`
                });
              }
              break;
              
            case 'productivity_sync_tasks':
              const fromPlatform = functionArgs.from;
              const toPlatform = functionArgs.to;
              const fromService = session.productivityServices[fromPlatform];
              const toService = session.productivityServices[toPlatform];
              
              if (!fromService || !toService) {
                functionResults.push({
                  function: 'sincronizar tareas',
                  error: 'Una o ambas plataformas no estÃ¡n conectadas.'
                });
              } else {
                const syncResult = await fromService.syncTasks(fromPlatform, toPlatform);
                functionResults.push({
                  function: 'sincronizar tareas',
                  details: syncResult.message
                });
              }
              break;
              
            case 'email_get_recent':
              if (!session.emailService) {
                functionResults.push({
                  function: 'obtener emails',
                  error: 'Servicio de email no disponible. Conecta tu cuenta de Google.'
                });
              } else {
                const maxResults = functionArgs.maxResults || 10;
                const query = functionArgs.onlyUnread !== false ? 'is:unread' : '';
                const emails = await session.emailService.getRecentEmails(maxResults, query);
                
                // Guardar emails en sesiÃ³n para referencias posteriores
                session.lastEmails = emails;
                
                let emailList = `Tienes ${emails.length} email(s):\n\n`;
                emails.forEach((email, index) => {
                  emailList += `${index + 1}. De: ${email.from}\n`;
                  emailList += `   Asunto: ${email.subject}\n`;
                  emailList += `   ${email.snippet}\n\n`;
                });
                
                functionResults.push({
                  function: 'emails recientes',
                  details: emailList
                });
              }
              break;
              
            case 'email_summarize':
              if (!session.emailService) {
                functionResults.push({
                  function: 'resumen de emails',
                  error: 'Servicio de email no disponible.'
                });
              } else {
                const emails = await session.emailService.getRecentEmails(20, '');
                const summary = await session.emailService.summarizeEmails(emails);
                const formatted = session.emailService.formatEmailSummary(summary);
                
                functionResults.push({
                  function: 'resumen de emails',
                  details: formatted
                });
              }
              break;
              
            case 'email_mark_read':
              if (!session.emailService || !session.lastEmails) {
                functionResults.push({
                  function: 'marcar como leÃ­do',
                  error: 'No hay emails cargados.'
                });
              } else {
                const emailIndex = functionArgs.emailIndex - 1;
                if (emailIndex >= 0 && emailIndex < session.lastEmails.length) {
                  const email = session.lastEmails[emailIndex];
                  await session.emailService.markAsRead(email.id);
                  functionResults.push({
                    function: 'marcar como leÃ­do',
                    details: `Email "${email.subject}" marcado como leÃ­do`
                  });
                } else {
                  functionResults.push({
                    function: 'marcar como leÃ­do',
                    error: 'Ãndice de email invÃ¡lido'
                  });
                }
              }
              break;
              
            case 'email_send':
              if (!session.emailService) {
                functionResults.push({
                  function: 'enviar email',
                  error: 'Servicio de email no disponible.'
                });
              } else {
                await session.emailService.sendEmail(
                  functionArgs.to,
                  functionArgs.subject,
                  functionArgs.body
                );
                functionResults.push({
                  function: 'enviar email',
                  details: `Email enviado a ${functionArgs.to}`
                });
              }
              break;
              
            case 'learning_add_course':
              if (!session.learningService) {
                functionResults.push({
                  function: 'agregar curso',
                  error: 'Servicio de aprendizaje no disponible.'
                });
              } else {
                const course = session.learningService.addCourse({
                  title: functionArgs.title,
                  platform: functionArgs.platform,
                  totalLessons: functionArgs.totalLessons
                });
                functionResults.push({
                  function: 'agregar curso',
                  details: `Curso "${course.title}" agregado para seguimiento`
                });
              }
              break;
              
            case 'learning_get_stats':
              if (!session.learningService) {
                functionResults.push({
                  function: 'estadÃ­sticas de aprendizaje',
                  error: 'Servicio de aprendizaje no disponible.'
                });
              } else {
                const stats = session.learningService.getLearningStats();
                const formatted = session.learningService.formatStats(stats);
                functionResults.push({
                  function: 'estadÃ­sticas de aprendizaje',
                  details: formatted
                });
              }
              break;
              
            case 'learning_create_flashcard':
              if (!session.learningService) {
                functionResults.push({
                  function: 'crear flashcard',
                  error: 'Servicio de aprendizaje no disponible.'
                });
              } else {
                const flashcard = session.learningService.createFlashcard({
                  question: functionArgs.question,
                  answer: functionArgs.answer,
                  category: functionArgs.category
                });
                functionResults.push({
                  function: 'crear flashcard',
                  details: `Flashcard creado: "${flashcard.question.substring(0, 50)}..."`
                });
              }
              break;
              
            case 'learning_review_flashcards':
              if (!session.learningService) {
                functionResults.push({
                  function: 'revisar flashcards',
                  error: 'Servicio de aprendizaje no disponible.'
                });
              } else {
                const limit = functionArgs.limit || 10;
                const flashcards = session.learningService.getFlashcardsForReview(limit);
                
                if (flashcards.length === 0) {
                  functionResults.push({
                    function: 'revisar flashcards',
                    details: 'No tienes flashcards pendientes de revisar. Â¡Buen trabajo!'
                  });
                } else {
                  let reviewText = `Tienes ${flashcards.length} flashcard(s) para revisar:\n\n`;
                  flashcards.forEach((f, index) => {
                    reviewText += `${index + 1}. ${f.question}\n`;
                  });
                  functionResults.push({
                    function: 'revisar flashcards',
                    details: reviewText
                  });
                }
              }
              break;
              
            default:
              result = { error: 'FunciÃ³n no reconocida' };
          }
          
          sendToClient(session.ws, {
            type: 'function_result',
            function: functionName,
            result
          });
          
        } catch (error) {
          logger.error(`Error executing ${functionName}:`, error);
          logger.error(`Error details:`, error.response?.data || error);
          
          const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
          
          sendToClient(session.ws, {
            type: 'function_error',
            function: functionName,
            error: errorMessage
          });
          functionResults.push({
            function: functionName,
            error: errorMessage
          });
        }
      }
    }
    
    // Generar respuesta mÃ¡s descriptiva
    responseText = responseMessage.content;
    
    // Si hubo function calls y no hay respuesta, hacer segunda llamada a GPT con los resultados
    if (!responseText && functionResults.length > 0) {
      const hasWebSearch = functionResults.some(r => r.function === 'bÃºsqueda web');
      
      // Para bÃºsquedas web, hacer segunda llamada a GPT para procesar resultados
      if (hasWebSearch) {
        const searchResults = functionResults.find(r => r.function === 'bÃºsqueda web');
        
        const secondCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Eres GBot, un asistente personal inteligente. 
              Responde de forma natural, clara y concisa en espaÃ±ol.
              Usa la informaciÃ³n de bÃºsqueda web para responder la pregunta del usuario.
              NO copies el formato crudo de los resultados. Procesa la informaciÃ³n y responde naturalmente.`
            },
            {
              role: 'user',
              content: text
            },
            {
              role: 'assistant',
              content: null,
              tool_calls: responseMessage.tool_calls
            },
            {
              role: 'tool',
              tool_call_id: responseMessage.tool_calls[0].id,
              content: searchResults.details
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        
        responseText = secondCompletion.choices[0].message.content;
      } else {
        // Para otras funciones, usar lÃ³gica anterior
        const successResults = functionResults.filter(r => !r.error);
        const errorResults = functionResults.filter(r => r.error);
        
        if (successResults.length > 0 && errorResults.length === 0) {
          responseText = 'Â¡Listo! ';
          responseText += successResults.map(r => `He ${r.function === 'crear evento' || r.function === 'crear tarea' ? 'creado' : 'listado'} ${r.details}`).join('. ');
        } else if (errorResults.length > 0 && successResults.length === 0) {
          responseText = 'Lo siento, hubo un problema: ' + errorResults.map(r => r.error).join('. ');
        } else if (errorResults.length > 0 && successResults.length > 0) {
          responseText = 'CompletÃ© algunas acciones pero hubo problemas: ' + errorResults.map(r => r.error).join('. ');
        } else {
          responseText = 'Hubo un problema al ejecutar las acciones solicitadas.';
        }
      }
    } else if (!responseText) {
      responseText = 'He ejecutado la acciÃ³n solicitada.';
    }

    const normalizedResponse = (responseText || '').trim().toLowerCase();
    const lastAssistantMessage = [...(session.conversationHistory || [])].reverse().find(msg => msg.role === 'assistant');

    if (lastAssistantMessage) {
      const lastText = (lastAssistantMessage.content || '').trim().toLowerCase();
      const lastTs = lastAssistantMessage.timestamp ? new Date(lastAssistantMessage.timestamp).getTime() : 0;
      const isDuplicateGreeting =
        greetRe.test(responseText) &&
        greetRe.test(lastAssistantMessage.content || '') &&
        nowTs - lastTs < 10000;
      const isExactDuplicate = lastText === normalizedResponse;

      if (isDuplicateGreeting || isExactDuplicate) {
        logger.info('Suppressed duplicate assistant response');
        session.stateMachine.transition('idle');
        return;
      }
    }

    // Guardar respuesta en el historial
    session.conversationHistory.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      id: `${messageId}-response`
    });
    
    // Guardar conversaciÃ³n en memoria persistente
    try {
      const { memoryService } = await import('../services/memoryService.js');
      await memoryService.saveConversation(session.userId, session.conversationHistory);
    } catch (memError) {
      logger.error('Error saving conversation:', memError);
    }

    session.stateMachine.transition('speaking');
    
    // Enviar respuesta de texto
    sendToClient(session.ws, {
      type: 'response',
      text: responseText
    });

    // Generar audio con TTS
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Voz femenina natural
        input: responseText,
        speed: 1.0
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64Audio = buffer.toString('base64');

      sendToClient(session.ws, {
        type: 'audio_response',
        audio: base64Audio,
        format: 'mp3'
      });
    } catch (ttsError) {
      logger.error('TTS error:', ttsError);
      // Continuar sin audio si falla
    }

    // El estado cambiarÃ¡ a idle cuando termine de reproducir el audio
    // Por ahora, esperar un tiempo estimado
    setTimeout(() => {
      session.stateMachine.transition('idle');
    }, responseText.length * 50); // ~50ms por carÃ¡cter

  } catch (error) {
    logger.error('Error generating response:', error);
    logger.error('Error details:', error.message);
    logger.error('Error stack:', error.stack);
    
    sendToClient(session.ws, {
      type: 'error',
      message: 'Error al generar respuesta: ' + error.message
    });
    
    // Enviar respuesta de texto simple si falla
    sendToClient(session.ws, {
      type: 'response',
      text: 'Lo siento, tuve un problema al procesar tu mensaje. Â¿Puedes intentarlo de nuevo?'
    });
    
    session.stateMachine.transition('idle');
  }
}

async function executeFunctionCall(session, functionCall) {
  // AquÃ­ se ejecutarÃ­an las llamadas a Google Calendar/Tasks
  // Importar los servicios correspondientes
  logger.info(`Executing function: ${functionCall.name}`, functionCall.arguments);

  // Placeholder - implementar con los servicios reales
  return {
    success: true,
    message: `Function ${functionCall.name} executed successfully`
  };
}

function startAutonomousBehavior(session) {
  // Comportamiento proactivo del bot
  const checkInterval = 5 * 60 * 1000; // Cada 5 minutos

  const intervalId = setInterval(() => {
    if (session.ws.readyState !== WebSocket.OPEN) {
      clearInterval(intervalId);
      return;
    }

    // AquÃ­ se implementarÃ­a la lÃ³gica de comportamiento autÃ³nomo
    // Por ejemplo: revisar eventos prÃ³ximos, sugerir tareas, etc.
    
  }, checkInterval);
}

async function processAudioWithWhisper(session) {
  try {
    session.stateMachine.transition('thinking');
    
    if (!session.audioBuffer || session.audioBuffer.length === 0) {
      logger.warn('No audio data to process');
      session.stateMachine.transition('idle');
      return;
    }
    
    // Importar OpenAI y fs
    const { default: OpenAI } = await import('openai');
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Combinar todos los chunks de audio
    let audioData = session.audioBuffer.join('');
    
    // Limpiar el base64 (remover prefijos si existen)
    audioData = audioData.replace(/^data:audio\/\w+;base64,/, '');
    
    // Convertir base64 a buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Rechazar audio demasiado corto o probablemente vacÃ­o
    if (!audioBuffer || audioBuffer.length < 10000) { // ~10KB ~ <0.5s
      logger.warn('Audio too short, skipping transcription');
      sendToClient(session.ws, {
        type: 'notice',
        level: 'info',
        message: 'No te escuchÃ© bien. Â¿Puedes repetir, por favor?'
      });
      session.stateMachine.transition('idle');
      session.audioBuffer = [];
      return;
    }
    
    logger.info(`Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Guardar temporalmente el archivo con extensiÃ³n webm
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `audio_${session.id}_${Date.now()}.webm`);
    
    fs.writeFileSync(tempFile, audioBuffer);
    logger.info(`Temp file created: ${tempFile}`);
    
    try {
      // Crear un FormData-like object para la API
      const fileStream = fs.createReadStream(tempFile);
      
      // Transcribir con Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: 'es',
        response_format: 'text',
        prompt: 'TranscripciÃ³n en espaÃ±ol de una conversaciÃ³n casual.'
      });
      
      logger.info(`Transcription: ${transcription}`);

      // Filtro de ruido: descartar transcripciones sospechosas o vacÃ­as
      const noisyPatterns = /(amara\.org|subt[Ã­i]tulos|suscr[Ã­i]bete|dale\s+like|m[aÃ¡]s\s+informaci[Ã³o]n|www\.|https?:\/\/|like\s+and\s+share|s[Ã­i]guenos|canal|youtube)/i;
      const cleaned = (transcription || '').trim();
      const tooShort = cleaned.length < 3;
      const isNoisy = noisyPatterns.test(cleaned);

      if (tooShort || isNoisy) {
        logger.warn('Noisy/low-info transcription filtered');
        sendToClient(session.ws, {
          type: 'notice',
          level: 'info',
          message: 'No te escuchÃ© bien. Â¿Puedes repetir, por favor?'
        });
        session.stateMachine.transition('idle');
        return;
      }

      sendToClient(session.ws, {
        type: 'transcription',
        text: cleaned
      });
      
      // Procesar como mensaje de texto
      await handleTextMessage(session, cleaned);
      
    } finally {
      // Limpiar archivo temporal
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        logger.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    // Limpiar buffer
    session.audioBuffer = [];
    
  } catch (error) {
    logger.error('Error processing audio:', error);
    sendToClient(session.ws, {
      type: 'error',
      message: 'Error procesando audio: ' + error.message
    });
    session.stateMachine.transition('idle');
  }
}

function sendToClient(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function bindSessionToken(session, token) {
  const decoded = verifyToken(token);
  session.tokenExp = decoded?.exp ? decoded.exp * 1000 : null;
  session.jwt = token;
  return decoded;
}

function isSessionTokenExpired(session) {
  return session.tokenExp ? Date.now() >= session.tokenExp : false;
}

export { sessions };


