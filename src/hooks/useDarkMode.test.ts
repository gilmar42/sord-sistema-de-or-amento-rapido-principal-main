import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('deve inicializar com dark mode ativo por padrão', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(true);
  });

  it('deve adicionar classe dark ao documentElement quando ativo', () => {
    renderHook(() => useDarkMode());
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve alternar dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve salvar preferência no localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    const stored = localStorage.getItem('darkMode');
    expect(stored).toBe('false');
  });

  it('deve carregar preferência do localStorage', () => {
    localStorage.setItem('darkMode', 'false');
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve definir dark mode explicitamente via toggle', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDark).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDark).toBe(true);
  });

  it('deve sincronizar classe dark com estado', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve persistir estado entre re-renderizações', () => {
    const { result, rerender } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    rerender();
    
    expect(result.current.isDark).toBe(false);
  });
});
