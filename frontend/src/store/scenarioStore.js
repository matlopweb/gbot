import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  fetchScenarios,
  createScenario as createScenarioApi,
  activateScenario as activateScenarioApi
} from '../services/scenariosApi';

export const SCENARIO_TONES = {
  neutral: {
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    accent: 'text-slate-200',
    badge: 'bg-slate-700/60 border-slate-500/40'
  },
  focus: {
    gradient: 'from-indigo-900 via-blue-900 to-slate-900',
    accent: 'text-blue-200',
    badge: 'bg-blue-600/40 border-blue-400/30'
  },
  travel: {
    gradient: 'from-amber-900 via-orange-900 to-slate-900',
    accent: 'text-amber-100',
    badge: 'bg-amber-600/30 border-amber-400/30'
  },
  relax: {
    gradient: 'from-emerald-900 via-teal-900 to-slate-900',
    accent: 'text-emerald-100',
    badge: 'bg-emerald-600/30 border-emerald-400/30'
  },
  creative: {
    gradient: 'from-purple-900 via-fuchsia-900 to-slate-900',
    accent: 'text-fuchsia-100',
    badge: 'bg-fuchsia-600/30 border-fuchsia-400/30'
  }
};

export const useScenarioStore = create((set, get) => ({
  scenarios: [],
  activeScenario: null,
  isLoading: false,
  error: null,

  async loadScenarios({ silent = false } = {}) {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (!silent) {
      set({ isLoading: true, error: null });
    }

    try {
      const scenarios = await fetchScenarios(token);
      const activeScenario =
        scenarios.find((scenario) => scenario.is_active) || null;
      set({ scenarios, activeScenario, isLoading: false });
    } catch (error) {
      console.error('Error loading scenarios', error);
      set({ error: error.message, isLoading: false });
    }
  },

  async createScenario(payload) {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No autenticado');

    set({ isLoading: true, error: null });
    try {
      const scenario = await createScenarioApi(token, payload);
      set((state) => ({
        scenarios: [scenario, ...state.scenarios],
        isLoading: false
      }));
      return scenario;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  async activateScenario(scenarioId) {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No autenticado');

    set({ isLoading: true, error: null });
    try {
      const updated = await activateScenarioApi(token, scenarioId);
      set((state) => ({
        scenarios: state.scenarios.map((scenario) =>
          scenario.id === updated.id
            ? { ...scenario, is_active: true }
            : { ...scenario, is_active: false }
        ),
        activeScenario: updated,
        isLoading: false
      }));
      return updated;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getToneTheme() {
    const activeScenario = get().activeScenario;
    if (!activeScenario) return SCENARIO_TONES.neutral;
    return SCENARIO_TONES[activeScenario.tone] || SCENARIO_TONES.neutral;
  }
}));
