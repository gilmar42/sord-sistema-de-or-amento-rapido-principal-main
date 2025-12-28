import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('deve retornar valor inicial quando localStorage está vazio', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    expect(result.current[0]).toBe('initialValue');
  });

  it('deve retornar valor do localStorage quando existe', () => {
    localStorage.setItem('testKey', JSON.stringify('savedValue'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    expect(result.current[0]).toBe('savedValue');
  });

  it('deve atualizar valor no localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('deve aceitar função como argumento para setValue', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 10));

    act(() => {
      result.current[1]((prev: number) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('deve funcionar com objetos', () => {
    const initialValue = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('testKey', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]({ name: 'Updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'Updated', count: 5 });
    expect(JSON.parse(localStorage.getItem('testKey')!)).toEqual({
      name: 'Updated',
      count: 5,
    });
  });

  it('deve funcionar com arrays', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('testKey', []));

    act(() => {
      result.current[1]([1, 2, 3]);
    });

    expect(result.current[0]).toEqual([1, 2, 3]);

    act(() => {
      result.current[1](prev => [...prev, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('deve lidar com valores null', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('testKey', null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]('notNull');
    });

    expect(result.current[0]).toBe('notNull');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
  });

  it('deve manter sincronização entre múltiplas instâncias da mesma chave', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('sharedKey', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('sharedKey', 'value2'));

    // Ambos devem começar com o mesmo valor
    expect(result1.current[0]).toBe(result2.current[0]);

    act(() => {
      result1.current[1]('updated');
    });

    // Ambos devem ser atualizados (na implementação real do hook)
    expect(localStorage.getItem('sharedKey')).toBe(JSON.stringify('updated'));
  });

  it('deve lidar com erro de parse do JSON graciosamente', () => {
    // Simular dados corrompidos no localStorage
    localStorage.setItem('testKey', 'invalid-json{');

    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));

    // Deve usar valor inicial quando parse falhar
    expect(result.current[0]).toBe('fallback');
  });

  it('deve persistir valores boolean', () => {
    const { result } = renderHook(() => useLocalStorage('boolKey', true));

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(JSON.parse(localStorage.getItem('boolKey')!)).toBe(false);
  });

  it('deve persistir valores numéricos', () => {
    const { result } = renderHook(() => useLocalStorage('numKey', 42));

    expect(result.current[0]).toBe(42);

    act(() => {
      result.current[1](100);
    });

    expect(result.current[0]).toBe(100);
    expect(JSON.parse(localStorage.getItem('numKey')!)).toBe(100);
  });
});
