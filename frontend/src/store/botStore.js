import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { saveConversationMessage } from '../services/conversationsApi';

// Cargar historial del localStorage
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('gbot-history');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

// Guardar historial en localStorage
const saveHistory = (messages) => {
  try {
    // Guardar solo los últimos 100 mensajes
    const toSave = messages.slice(-100);
    localStorage.setItem('gbot-history', JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const useBotStore = create((set) => ({
  // Estado del bot
  state: 'idle', // idle, listening, thinking, speaking, working
  
  // WebSocket
  ws: null,
  isConnected: false,
  
  // Audio
  isRecording: false,
  isSpeaking: false,
  
  // Mensajes
  messages: loadHistory(), // Cargar historial al iniciar
  currentTranscript: '',
  
  // Contexto
  context: {},
  
  // Servicios conectados
  connectedServices: {
    google: false,
    spotify: false,
    notion: false,
    trello: false,
    asana: false
  },

  // Acciones
  setState: (state) => set({ state }),
  
  setWebSocket: (ws) => set({ ws, isConnected: !!ws }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setRecording: (isRecording) => set({ isRecording }),
  
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  
  addMessage: (message) => {
    const payload = {
      ...message,
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toISOString()
    };

    set((state) => {
      const exists = state.messages.some((msg) => msg.id === payload.id);
      if (exists) {
        return state;
      }

      const newMessages = [...state.messages, payload];
      saveHistory(newMessages);
      return { messages: newMessages };
    });

    const token = useAuthStore.getState().token;
    if (token && message.role !== 'system') {
      saveConversationMessage(token, payload).catch((error) => {
        console.error('Error syncing conversation message:', error);
      });
    }
  },

  hydrateMessages: (messages) => {
    const normalized = messages.map((message) => ({
      ...message,
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toISOString()
    }));
    saveHistory(normalized);
    set({ messages: normalized });
  },
  
  setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),
  
  updateContext: (context) => set((state) => ({
    context: { ...state.context, ...context }
  })),
  
  clearMessages: () => {
    set({ messages: [] });
    localStorage.removeItem('gbot-history');
  },
  
  setServiceConnected: (service, connected) => set((state) => ({
    connectedServices: {
      ...state.connectedServices,
      [service]: connected
    }
  })),
  
  reset: () => set({
    state: 'idle',
    isRecording: false,
    isSpeaking: false,
    currentTranscript: '',
    messages: []
  })
}));
