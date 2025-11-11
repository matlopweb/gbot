import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => set({ token: null, user: null, isAuthenticated: false }),

      getToken: () => get().token,

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
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
