import { create } from 'zustand';
import { authApi } from './api';
import type { User } from './types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        set({ user: response.user, token: response.token });
      } else {
        throw new Error(response.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        set({ user: response.user, token: response.token });
      } else {
        throw new Error(response.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      set({ user, token });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));