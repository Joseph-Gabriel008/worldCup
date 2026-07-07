/**
 * StadiumPulse AI - Auth Store (Zustand)
 */
import { create } from 'zustand';
import type { User, UserRole, SupportedLanguage } from '@/types';
import * as api from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: SupportedLanguage;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  language: (localStorage.getItem('language') as SupportedLanguage) || 'en',

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, name, role) => {
    set({ isLoading: true });
    try {
      const res = await api.register(email, password, name, role);
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error(res.error || 'Registration failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  setLanguage: (lang) => {
    localStorage.setItem('language', lang); // Language is fine in localStorage
    set({ language: lang });
  },

  checkAuth: () => {
    const userStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('accessToken');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true });
      } catch {
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
