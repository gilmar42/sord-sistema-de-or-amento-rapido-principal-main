import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('deve inicializar com array vazio de toasts', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('deve adicionar toast de sucesso', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Sucesso', 'Operação concluída');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Sucesso',
      message: 'Operação concluída',
    });
  });

  it('deve adicionar toast de erro', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showError('Erro', 'Algo deu errado');
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      title: 'Erro',
      message: 'Algo deu errado',
    });
  });

  it('deve adicionar toast de aviso', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showWarning('Aviso', 'Atenção necessária');
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      title: 'Aviso',
      message: 'Atenção necessária',
    });
  });

  it('deve adicionar toast de informação', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showInfo('Informação', 'Dados importantes');
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: 'Informação',
      message: 'Dados importantes',
    });
  });

  it('deve adicionar múltiplos toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Toast 1');
      result.current.showError('Toast 2');
      result.current.showInfo('Toast 3');
    });
    
    expect(result.current.toasts).toHaveLength(3);
  });

  it('deve remover toast específico', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      toastId = result.current.showSuccess('Teste');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.removeToast(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('deve limpar todos os toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Toast 1');
      result.current.showError('Toast 2');
      result.current.showWarning('Toast 3');
    });
    
    expect(result.current.toasts).toHaveLength(3);
    
    act(() => {
      result.current.clearAllToasts();
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('deve gerar ID único para cada toast', () => {
    const { result } = renderHook(() => useToast());
    
    let id1: string, id2: string;
    
    act(() => {
      id1 = result.current.showSuccess('Toast 1');
      id2 = result.current.showSuccess('Toast 2');
    });
    
    expect(id1).not.toBe(id2);
    expect(result.current.toasts[0].id).toBe(id1);
    expect(result.current.toasts[1].id).toBe(id2);
  });

  it('deve incluir função onClose em cada toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Teste');
    });
    
    expect(result.current.toasts[0].onClose).toBeDefined();
    expect(typeof result.current.toasts[0].onClose).toBe('function');
  });

  it('deve permitir toast sem mensagem (apenas título)', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Apenas título');
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Apenas título',
    });
    expect(result.current.toasts[0].message).toBeUndefined();
  });

  it('deve aceitar duração customizada', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Teste', 'Mensagem', 3000);
    });
    
    expect(result.current.toasts[0].duration).toBe(3000);
  });

  it('deve adicionar toast com addToast genérico', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast({
        type: 'success',
        title: 'Custom Toast',
        message: 'Custom message',
        duration: 2000,
      });
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Custom Toast',
      message: 'Custom message',
      duration: 2000,
    });
  });

  it('onClose do toast deve remover o toast correto', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Toast 1');
      result.current.showError('Toast 2');
    });
    
    const toastId = result.current.toasts[0].id;
    
    act(() => {
      result.current.toasts[0].onClose(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('deve manter referências estáveis das funções', () => {
    const { result, rerender } = renderHook(() => useToast());
    
    const firstShowSuccess = result.current.showSuccess;
    const firstRemoveToast = result.current.removeToast;
    
    rerender();
    
    expect(result.current.showSuccess).toBe(firstShowSuccess);
    expect(result.current.removeToast).toBe(firstRemoveToast);
  });
});
