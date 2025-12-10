import { act } from 'react';
import { useModalStore } from '@/store/modalSlice';

describe('useModalStore (Zustand modal)', () => {
  beforeEach(() => {
    useModalStore.setState({
      isOpen: false,
      content: null,
      isAbsolute: false,
    });
  });

  test('initial state should be closed', () => {
    const state = useModalStore.getState();

    expect(state.isOpen).toBe(false);
    expect(state.content).toBe(null);
    expect(state.isAbsolute).toBe(false);
  });

  test('openModal should set isOpen=true and store content', () => {
    act(() => {
      useModalStore.getState().openModal('Test content');
    });

    const state = useModalStore.getState();

    expect(state.isOpen).toBe(true);
    expect(state.content).toBe('Test content');
    expect(state.isAbsolute).toBe(false);
  });

  test('openModal should accept isAbsolute=true', () => {
    act(() => {
      useModalStore.getState().openModal('Absolute content', true);
    });

    const state = useModalStore.getState();

    expect(state.isOpen).toBe(true);
    expect(state.content).toBe('Absolute content');
    expect(state.isAbsolute).toBe(true);
  });

  test('closeModal should reset modal state', () => {
    act(() => {
      useModalStore.getState().openModal('Some content');
      useModalStore.getState().closeModal();
    });

    const state = useModalStore.getState();

    expect(state.isOpen).toBe(false);
    expect(state.content).toBe(null);
    expect(state.isAbsolute).toBe(false);
  });

  test('content should be replaced when modal opened again', () => {
    act(() => {
      useModalStore.getState().openModal('Old content');
      useModalStore.getState().openModal('New content');
    });

    expect(useModalStore.getState().content).toBe('New content');
  });
});
