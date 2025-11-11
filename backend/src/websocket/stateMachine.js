import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

/**
 * Máquina de estados para el bot
 * Estados: idle, listening, thinking, speaking, working
 */
export class BotStateMachine extends EventEmitter {
  constructor() {
    super();
    this.currentState = 'idle';
    this.previousState = null;
    this.stateHistory = [];
    this.maxHistorySize = 50;

    // Transiciones válidas
    this.validTransitions = {
      idle: ['listening', 'thinking', 'speaking'],
      listening: ['thinking', 'idle'],
      thinking: ['speaking', 'working', 'idle'],
      speaking: ['idle', 'listening'],
      working: ['thinking', 'speaking', 'idle']
    };

    // Metadata de estados
    this.stateMetadata = {
      idle: {
        animation: 'idle',
        description: 'Bot en reposo, esperando interacción',
        canInterrupt: true
      },
      listening: {
        animation: 'listening',
        description: 'Escuchando al usuario',
        canInterrupt: true
      },
      thinking: {
        animation: 'thinking',
        description: 'Procesando información',
        canInterrupt: false
      },
      speaking: {
        animation: 'speaking',
        description: 'Hablando con el usuario',
        canInterrupt: true
      },
      working: {
        animation: 'working',
        description: 'Ejecutando tareas',
        canInterrupt: false
      }
    };
  }

  /**
   * Transiciona a un nuevo estado
   */
  transition(newState) {
    if (!this.isValidTransition(newState)) {
      logger.warn(
        `Invalid state transition: ${this.currentState} -> ${newState}`
      );
      return false;
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    // Agregar a historial
    this.stateHistory.push({
      state: newState,
      timestamp: Date.now(),
      from: this.previousState
    });

    // Limitar tamaño del historial
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    logger.info(`State transition: ${this.previousState} -> ${newState}`);

    // Emitir evento de cambio de estado
    this.emit('stateChange', newState, this.previousState);
    this.emit(newState); // Evento específico del estado

    return true;
  }

  /**
   * Verifica si una transición es válida
   */
  isValidTransition(newState) {
    if (!this.validTransitions[this.currentState]) {
      return false;
    }

    return this.validTransitions[this.currentState].includes(newState);
  }

  /**
   * Obtiene el estado actual
   */
  getState() {
    return this.currentState;
  }

  /**
   * Obtiene metadata del estado actual
   */
  getStateMetadata() {
    return this.stateMetadata[this.currentState];
  }

  /**
   * Verifica si el estado actual puede ser interrumpido
   */
  canInterrupt() {
    return this.stateMetadata[this.currentState]?.canInterrupt || false;
  }

  /**
   * Fuerza un estado (sin validación)
   */
  forceState(newState) {
    if (!this.stateMetadata[newState]) {
      logger.error(`Invalid state: ${newState}`);
      return false;
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    logger.warn(`Forced state change: ${this.previousState} -> ${newState}`);
    this.emit('stateChange', newState, this.previousState);

    return true;
  }

  /**
   * Vuelve al estado anterior
   */
  revert() {
    if (!this.previousState) {
      logger.warn('No previous state to revert to');
      return false;
    }

    const temp = this.currentState;
    this.currentState = this.previousState;
    this.previousState = temp;

    logger.info(`Reverted to state: ${this.currentState}`);
    this.emit('stateChange', this.currentState, this.previousState);

    return true;
  }

  /**
   * Obtiene el historial de estados
   */
  getHistory(limit = 10) {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Resetea la máquina de estados
   */
  reset() {
    this.previousState = this.currentState;
    this.currentState = 'idle';
    this.stateHistory = [];

    logger.info('State machine reset to idle');
    this.emit('stateChange', 'idle', this.previousState);
  }

  /**
   * Obtiene estadísticas de uso de estados
   */
  getStatistics() {
    const stats = {};

    for (const state in this.stateMetadata) {
      stats[state] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0
      };
    }

    for (let i = 0; i < this.stateHistory.length; i++) {
      const entry = this.stateHistory[i];
      const nextEntry = this.stateHistory[i + 1];

      stats[entry.state].count++;

      if (nextEntry) {
        const duration = nextEntry.timestamp - entry.timestamp;
        stats[entry.state].totalDuration += duration;
      }
    }

    // Calcular promedios
    for (const state in stats) {
      if (stats[state].count > 0) {
        stats[state].averageDuration = 
          stats[state].totalDuration / stats[state].count;
      }
    }

    return stats;
  }
}
