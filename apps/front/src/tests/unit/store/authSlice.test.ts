import { act } from 'react';
import { useAuthStore } from '@/store/authSlice';

// ВАЖЛИВО: перед кожним тестом чистимо localStorage і Zustand state
beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ isLogged: false });
});

describe('useAuthStore (Zustand)', () => {
  test('initial state should be false', () => {
    expect(useAuthStore.getState().isLogged).toBe(false);
  });

  test('setIsLogged(true) should update state', () => {
    act(() => {
      useAuthStore.getState().setIsLogged(true);
    });

    expect(useAuthStore.getState().isLogged).toBe(true);
  });

  test('setIsLogged(false) should update state', () => {
    act(() => {
      useAuthStore.getState().setIsLogged(false);
    });

    expect(useAuthStore.getState().isLogged).toBe(false);
  });

  test('persist should save state to localStorage', () => {
    act(() => {
      useAuthStore.getState().setIsLogged(true);
    });

    const stored = localStorage.getItem('auth-storage');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.isLogged).toBe(true);
  });

  test('store should rehydrate state from localStorage', () => {
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: { isLogged: true },
        version: 0,
      })
    );

    // 👇 це змусить Zustand перечитати localStorage
    useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().isLogged).toBe(true);
  });

  test('partialize should store only isLogged key', () => {
    act(() => {
      useAuthStore.getState().setIsLogged(true);
    });

    const raw = localStorage.getItem('auth-storage');
    const parsed = JSON.parse(raw!);

    expect(Object.keys(parsed.state)).toEqual(['isLogged']);
  });
});
