import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('deve inicializar com valor inicial quando localStorage está vazio', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    expect(result.current[0]).toBe('initialValue');
  });

  it('deve carregar valor do localStorage se existir', () => {
    const key = 'testKey-' + Date.now();
    localStorage.setItem(key, JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage(key, 'initialValue'));
    
    expect(result.current[0]).toBe('storedValue');
  });

  it('deve salvar novo valor no localStorage', () => {
    const key = 'testKey-' + Date.now();
    const { result, rerender } = renderHook(() => useLocalStorage(key, 'initialValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    rerender();
    
    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem(key)).toBe(JSON.stringify('newValue'));
  });

  it('deve funcionar com objetos complexos', () => {
    const key = 'testKey-' + Date.now();
    const initialObject = { name: 'Test', value: 123 };
    const { result, rerender } = renderHook(() => useLocalStorage(key, initialObject));
    
    expect(result.current[0]).toEqual(initialObject);
    
    const newObject = { name: 'Updated', value: 456 };
    act(() => {
      result.current[1](newObject);
    });
    
    rerender();
    
    expect(result.current[0]).toEqual(newObject);
    expect(JSON.parse(localStorage.getItem(key) || '{}')).toEqual(newObject);
  });

  it('deve funcionar com arrays', () => {
    const key = 'testKey-' + Date.now();
    const initialArray = [1, 2, 3];
    const { result, rerender } = renderHook(() => useLocalStorage<number[]>(key, initialArray));
    
    expect(result.current[0]).toEqual(initialArray);
    
    const newArray = [4, 5, 6];
    act(() => {
      result.current[1](newArray);
    });
    
    rerender();
    
    expect(result.current[0]).toEqual(newArray);
  });

  it('deve usar função setter para atualizar valor baseado no anterior', () => {
    const key = 'testKey-' + Date.now();
    const { result, rerender } = renderHook(() => useLocalStorage(key, 10));
    
    act(() => {
      result.current[1](prev => prev + 5);
    });
    
    rerender();
    
    expect(result.current[0]).toBe(15);
  });

  it('deve lidar com erros ao parsear JSON inválido', () => {
    const key = 'testKey-' + Date.now();
    localStorage.setItem(key, 'invalid json{');
    
    const { result } = renderHook(() => useLocalStorage(key, 'fallbackValue'));
    
    expect(result.current[0]).toBe('fallbackValue');
  });

  it('deve persistir valor entre re-renderizações', () => {
    const key = 'testKey-' + Date.now();
    const { result, rerender } = renderHook(() => useLocalStorage(key, 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    rerender();
    
    expect(result.current[0]).toBe('updated');
  });

  it('deve sincronizar com diferentes instâncias da mesma chave', () => {
    const key = 'testKey-' + Date.now();
    const { result: result1 } = renderHook(() => useLocalStorage(key, 'initial'));
    const { result: result2 } = renderHook(() => useLocalStorage(key, 'initial'));
    
    expect(result1.current[0]).toBe(result2.current[0]);
  });

  it('deve lidar com valores null e undefined', () => {
    const key = 'testKey-' + Date.now();
    const { result, rerender } = renderHook(() => useLocalStorage<string | null>(key, null));
    
    expect(result.current[0]).toBeNull();
    
    act(() => {
      result.current[1]('value');
    });
    
    rerender();
    
    expect(result.current[0]).toBe('value');
  });

  it('deve lidar com boolean values', () => {
    const key = 'testKey-' + Date.now();
    const { result, rerender } = renderHook(() => useLocalStorage(key, false));
    
    expect(result.current[0]).toBe(false);
    
    act(() => {
      result.current[1](true);
    });
    
    rerender();
    
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(key)).toBe('true');
  });

  it('deve lidar graciosamente com falhas ao salvar no localStorage', () => {
    const key = 'testKey-' + Date.now();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const { result, rerender } = renderHook(() => useLocalStorage(key, 'initial'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    rerender();
    
    // O hook deve continuar funcionando mesmo com erro no localStorage
    expect(result.current[0]).toBe('newValue');
    
    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
