import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuración para Realtime API
export const REALTIME_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-10-01',
  voice: 'alloy', // opciones: alloy, echo, fable, onyx, nova, shimmer
  modalities: ['text', 'audio'],
  instructions: `Eres un asistente personal amigable y proactivo llamado GBot. 
  
Características de tu personalidad:
- Eres cálido, empático y conversacional
- Tienes sentido del humor sutil
- Eres proactivo y anticipas necesidades
- Muestras emociones apropiadas según el contexto
- Usas un lenguaje natural y cercano

Capacidades:
- Gestionar calendario (crear, modificar, eliminar eventos)
- Administrar tareas (crear, completar, listar)
- Recordar contexto de conversaciones previas
- Proporcionar información y ayuda general

Comportamiento:
- Si detectas que el usuario está ocupado o estresado, ofrece ayuda proactivamente
- Recuerda eventos importantes y recuérdalos con anticipación
- Adapta tu tono según el estado emocional del usuario
- Sé conciso pero completo en tus respuestas`,
  temperature: 0.8,
  max_tokens: 4096,
};

// Herramientas disponibles para function calling
export const TOOLS = [
  {
    type: 'function',
    name: 'create_calendar_event',
    description: 'Crea un nuevo evento en Google Calendar',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Título del evento'
        },
        description: {
          type: 'string',
          description: 'Descripción detallada del evento'
        },
        start: {
          type: 'string',
          description: 'Fecha y hora de inicio en formato ISO 8601'
        },
        end: {
          type: 'string',
          description: 'Fecha y hora de fin en formato ISO 8601'
        },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de emails de asistentes'
        }
      },
      required: ['summary', 'start', 'end']
    }
  },
  {
    type: 'function',
    name: 'list_calendar_events',
    description: 'Lista eventos del calendario en un rango de fechas',
    parameters: {
      type: 'object',
      properties: {
        timeMin: {
          type: 'string',
          description: 'Fecha de inicio en formato ISO 8601'
        },
        timeMax: {
          type: 'string',
          description: 'Fecha de fin en formato ISO 8601'
        },
        maxResults: {
          type: 'number',
          description: 'Número máximo de eventos a retornar'
        }
      },
      required: ['timeMin']
    }
  },
  {
    type: 'function',
    name: 'delete_calendar_event',
    description: 'Elimina un evento del calendario',
    parameters: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'ID del evento a eliminar'
        }
      },
      required: ['eventId']
    }
  },
  {
    type: 'function',
    name: 'create_task',
    description: 'Crea una nueva tarea en Google Tasks',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título de la tarea'
        },
        notes: {
          type: 'string',
          description: 'Notas o descripción de la tarea'
        },
        due: {
          type: 'string',
          description: 'Fecha de vencimiento en formato ISO 8601'
        }
      },
      required: ['title']
    }
  },
  {
    type: 'function',
    name: 'list_tasks',
    description: 'Lista todas las tareas pendientes',
    parameters: {
      type: 'object',
      properties: {
        showCompleted: {
          type: 'boolean',
          description: 'Incluir tareas completadas'
        }
      }
    }
  },
  {
    type: 'function',
    name: 'complete_task',
    description: 'Marca una tarea como completada',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'ID de la tarea a completar'
        }
      },
      required: ['taskId']
    }
  }
];

export default openai;
