import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('deve fornecer tema corporate-dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('corporate-dark');
  });

  it('deve adicionar classe dark ao documentElement', () => {
    renderHook(() => useTheme(), { wrapper });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve salvar tema no localStorage', () => {
    renderHook(() => useTheme(), { wrapper });
    
    const storedTheme = localStorage.getItem('themeMode');
    expect(storedTheme).toBe('corporate-dark');
  });

  it('deve manter tema consistente entre re-renderizações', () => {
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    
    const initialTheme = result.current.theme;
    
    rerender();
    
    expect(result.current.theme).toBe(initialTheme);
    expect(result.current.theme).toBe('corporate-dark');
  });

  it('deve lançar erro quando useTheme é usado fora do ThemeProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleErrorSpy.mockRestore();
  });

  it('deve aplicar tema em elementos filhos', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-value">{theme}</div>;
    };
    
    const { getByTestId } = require('@testing-library/react').render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme-value')).toHaveTextContent('corporate-dark');
  });

  it('deve manter classe dark após remontagem', () => {
    const { unmount } = renderHook(() => useTheme(), { wrapper });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    unmount();
    
    // Renderiza novamente
    renderHook(() => useTheme(), { wrapper });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('tema deve ser readonly (não deve ter setter)', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // ThemeContext não fornece método para mudar tema
    expect(result.current).toHaveProperty('theme');
    expect(result.current).not.toHaveProperty('setTheme');
  });
});
