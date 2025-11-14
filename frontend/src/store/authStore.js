import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchProfile } from '../services/profileApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      profile: null,

      setAuth: (token, user = {}) => set({
        token,
        user: {
          id: user.id || null,
          name: user.name || null,
          email: user.email || null
        },
        isAuthenticated: true
      }),

      setProfile: (profile) => set({ profile }),

      logout: () => set({ token: null, user: null, profile: null, isAuthenticated: false }),

      getToken: () => get().token,

      loadProfile: async () => {
        try {
          const token = get().token;
          if (!token) return null;
          const profile = await fetchProfile(token);
          set({ profile });
          return profile;
        } catch (error) {
          console.error('Error loading profile:', error);
          return null;
        }
      },

      checkAuth: () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }
        
        // Verificar si el token ha expirado (simple check)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          
          if (isExpired) {
            get().logout();
            return false;
          }
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'gbot-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
