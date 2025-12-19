import { renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';
import { ThemeProvider } from '../context/ThemeContext';
import * as React from 'react';

describe('useTheme Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );
  
  it('deve retornar tema corporate-dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('corporate-dark');
  });

  it('deve lançar erro quando usado fora do ThemeProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleErrorSpy.mockRestore();
  });

  it('deve manter tema consistente entre re-renderizações', () => {
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    
    const initialTheme = result.current.theme;
    
    rerender();
    
    expect(result.current.theme).toBe(initialTheme);
    expect(result.current.theme).toBe('corporate-dark');
  });
});
