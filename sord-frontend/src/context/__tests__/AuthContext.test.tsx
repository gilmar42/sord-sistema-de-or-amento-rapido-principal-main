import React, { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock useLocalStorage
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => {
    let value = initialValue;
    return [
      value,
      jest.fn((newValue) => {
        value = typeof newValue === 'function' ? newValue(value) : newValue;
        return value;
      }),
    ];
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('deve iniciar com usuário nulo', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.currentUser).toBeNull();
  });

  it('deve permitir fazer signup', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.signup(
        'Empresa Teste',
        'test@example.com',
        'password123'
      );
      expect(success).toBe(true);
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser?.email).toBe('test@example.com');
  });

  it('deve impedir signup com email duplicado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Primeiro signup
    await act(async () => {
      await result.current.signup('Empresa 1', 'test@example.com', 'password123');
    });

    // Tentar signup com mesmo email
    await act(async () => {
      const success = await result.current.signup(
        'Empresa 2',
        'test@example.com',
        'password456'
      );
      expect(success).toBe(false);
    });
  });

  it('deve permitir fazer login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Primeiro criar usuário
    await act(async () => {
      await result.current.signup('Empresa Teste', 'test@example.com', 'password123');
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    // Fazer login
    await act(async () => {
      const success = await result.current.login('test@example.com', 'password123');
      expect(success).toBe(true);
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser?.email).toBe('test@example.com');
  });

  it('deve falhar login com credenciais inválidas', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Criar usuário
    await act(async () => {
      await result.current.signup('Empresa Teste', 'test@example.com', 'password123');
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    // Tentar login com senha errada
    await act(async () => {
      const success = await result.current.login('test@example.com', 'wrongpassword');
      expect(success).toBe(false);
    });

    expect(result.current.currentUser).toBeNull();
  });

  it('deve fazer logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login primeiro
    await act(async () => {
      await result.current.signup('Empresa Teste', 'test@example.com', 'password123');
    });

    expect(result.current.currentUser).not.toBeNull();

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.currentUser).toBeNull();
  });

  it('deve ser case-insensitive no email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Signup com email minúsculo
    await act(async () => {
      await result.current.signup('Empresa Teste', 'test@example.com', 'password123');
    });

    act(() => {
      result.current.logout();
    });

    // Login com email maiúsculo
    await act(async () => {
      const success = await result.current.login('TEST@EXAMPLE.COM', 'password123');
      expect(success).toBe(true);
    });

    expect(result.current.currentUser).not.toBeNull();
  });

  it('não deve retornar passwordHash na sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('Empresa Teste', 'test@example.com', 'password123');
    });

    expect(result.current.currentUser).not.toHaveProperty('passwordHash');
  });
});
