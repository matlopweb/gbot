import WebSocket from 'ws';
import { REALTIME_CONFIG, TOOLS } from '../config/openai.js';
import { logger } from '../utils/logger.js';

export class OpenAIRealtimeSession {
  constructor(options) {
    this.userId = options.userId;
    this.sessionId = options.sessionId;
    this.onAudioDelta = options.onAudioDelta;
    this.onTextDelta = options.onTextDelta;
    this.onFunctionCall = options.onFunctionCall;
    this.onResponseComplete = options.onResponseComplete;
    this.onError = options.onError;
    
    this.ws = null;
    this.isConnected = false;
  }

  async connect() {
    const url = `wss://api.openai.com/v1/realtime?model=${REALTIME_CONFIG.model}`;
    
    this.ws = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        logger.info(`OpenAI Realtime session connected: ${this.sessionId}`);
        this.isConnected = true;
        
        // Configurar sesión
        this.send({
          type: 'session.update',
          session: {
            modalities: REALTIME_CONFIG.modalities,
            instructions: REALTIME_CONFIG.instructions,
            voice: REALTIME_CONFIG.voice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            tools: TOOLS,
            tool_choice: 'auto',
            temperature: REALTIME_CONFIG.temperature,
            max_response_output_tokens: REALTIME_CONFIG.max_tokens
          }
        });

        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data.toString()));
      });

      this.ws.on('error', (error) => {
        logger.error('OpenAI Realtime WebSocket error:', error);
        this.onError?.(error);
        reject(error);
      });

      this.ws.on('close', () => {
        logger.info(`OpenAI Realtime session closed: ${this.sessionId}`);
        this.isConnected = false;
      });
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case 'session.created':
        logger.info('OpenAI session created:', message.session.id);
        break;

      case 'session.updated':
        logger.info('OpenAI session updated');
        break;

      case 'conversation.item.created':
        logger.debug('Conversation item created:', message.item.id);
        break;

      case 'response.audio.delta':
        // Audio chunk recibido
        if (this.onAudioDelta) {
          this.onAudioDelta(message.delta);
        }
        break;

      case 'response.audio_transcript.delta':
        // Transcripción del audio generado
        if (this.onTextDelta) {
          this.onTextDelta(message.delta);
        }
        break;

      case 'response.text.delta':
        // Texto generado
        if (this.onTextDelta) {
          this.onTextDelta(message.delta);
        }
        break;

      case 'response.function_call_arguments.delta':
        // Argumentos de function call en streaming
        logger.debug('Function call arguments delta:', message.delta);
        break;

      case 'response.function_call_arguments.done':
        // Function call completa
        this.handleFunctionCall(message);
        break;

      case 'response.done':
        // Respuesta completa
        if (this.onResponseComplete) {
          this.onResponseComplete(message.response);
        }
        break;

      case 'input_audio_buffer.speech_started':
        logger.debug('User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        logger.debug('User stopped speaking');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        logger.info('User transcript:', message.transcript);
        break;

      case 'error':
        logger.error('OpenAI Realtime error:', message.error);
        if (this.onError) {
          this.onError(new Error(message.error.message));
        }
        break;

      default:
        logger.debug('Unhandled message type:', message.type);
    }
  }

  async handleFunctionCall(message) {
    const functionCall = {
      id: message.item_id,
      name: message.name,
      arguments: JSON.parse(message.arguments)
    };

    logger.info('Function call received:', functionCall);

    try {
      // Ejecutar la función a través del callback
      const result = await this.onFunctionCall?.(functionCall);

      // Enviar resultado de vuelta a OpenAI
      this.send({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: functionCall.id,
          output: JSON.stringify(result)
        }
      });

      // Solicitar respuesta
      this.send({
        type: 'response.create'
      });

    } catch (error) {
      logger.error('Error executing function call:', error);
      
      // Enviar error a OpenAI
      this.send({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: functionCall.id,
          output: JSON.stringify({
            error: error.message
          })
        }
      });
    }
  }

  sendAudio(audioData) {
    if (!this.isConnected) {
      logger.warn('Cannot send audio: session not connected');
      return;
    }

    this.send({
      type: 'input_audio_buffer.append',
      audio: audioData // Base64 encoded PCM16 audio
    });
  }

  sendText(text) {
    if (!this.isConnected) {
      logger.warn('Cannot send text: session not connected');
      return;
    }

    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    });

    // Solicitar respuesta
    this.send({
      type: 'response.create'
    });
  }

  commitAudio() {
    if (!this.isConnected) return;

    this.send({
      type: 'input_audio_buffer.commit'
    });
  }

  clearAudioBuffer() {
    if (!this.isConnected) return;

    this.send({
      type: 'input_audio_buffer.clear'
    });
  }

  cancelResponse() {
    if (!this.isConnected) return;

    this.send({
      type: 'response.cancel'
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }
}
