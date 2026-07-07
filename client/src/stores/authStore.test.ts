import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      language: 'en',
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.language).toBe('en');
  });

  it('can set language', () => {
    const { setLanguage } = useAuthStore.getState();
    setLanguage('fr');
    expect(useAuthStore.getState().language).toBe('fr');
    expect(localStorage.getItem('language')).toBe('fr');
  });

  it('can logout', () => {
    sessionStorage.setItem('accessToken', 'test-token');
    useAuthStore.setState({ isAuthenticated: true });
    
    const { logout } = useAuthStore.getState();
    logout();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('accessToken')).toBeNull();
  });
});
