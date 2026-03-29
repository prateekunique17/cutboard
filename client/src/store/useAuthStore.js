import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, 
  token: localStorage.getItem('cutboard_token') || null,
  isAuthenticated: !!localStorage.getItem('cutboard_token'),
  setUser: (user, token) => {
    if (token) localStorage.setItem('cutboard_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('cutboard_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
