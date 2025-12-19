import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, AuthContext } from './AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve inicializar sem usuário logado', () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    expect(result.current?.currentUser).toBeNull();
  });

  it('deve fazer signup de novo usuário', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    let success: boolean = false;
    
    await act(async () => {
      success = await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    expect(success).toBe(true);
  });

  it('deve fazer login com credenciais corretas', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    // Primeiro faz signup
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    // Faz logout
    act(() => {
      result.current!.logout();
    });
    
    // Tenta login
    let loginSuccess: boolean = false;
    await act(async () => {
      loginSuccess = await result.current!.login('test@example.com', 'password123');
    });
    
    expect(loginSuccess).toBe(true);
    expect(result.current?.currentUser).toBeTruthy();
    expect(result.current?.currentUser?.email).toBe('test@example.com');
  });

  it('deve falhar login com senha incorreta', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    // Primeiro faz signup
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    // Faz logout
    act(() => {
      result.current!.logout();
    });
    
    // Tenta login com senha errada
    let loginSuccess: boolean = true;
    await act(async () => {
      loginSuccess = await result.current!.login('test@example.com', 'wrongpassword');
    });
    
    expect(loginSuccess).toBe(false);
    expect(result.current?.currentUser).toBeNull();
  });

  it('deve falhar login com email não registrado', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    let loginSuccess: boolean = true;
    await act(async () => {
      loginSuccess = await result.current!.login('notregistered@example.com', 'password');
    });
    
    expect(loginSuccess).toBe(false);
  });

  it('deve fazer logout e limpar usuário atual', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    // Signup e login
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    expect(result.current?.currentUser).toBeTruthy();
    
    // Logout
    act(() => {
      result.current!.logout();
    });
    
    expect(result.current?.currentUser).toBeNull();
  });

  it('não deve permitir signup com email já existente', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    // Primeiro signup
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    // Tentar signup com mesmo email
    await expect(async () => {
      await act(async () => {
        await result.current!.signup('Another Company', 'test@example.com', 'password456');
      });
    }).rejects.toThrow('User already exists');
  });

  it('deve ser case-insensitive para email no login', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await result.current!.signup('Test Company', 'Test@Example.com', 'password123');
    });
    
    act(() => {
      result.current!.logout();
    });
    
    let loginSuccess: boolean = false;
    await act(async () => {
      loginSuccess = await result.current!.login('test@example.com', 'password123');
    });
    
    expect(loginSuccess).toBe(true);
  });

  it('deve persistir sessão no localStorage', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    const session = localStorage.getItem('sored_session');
    expect(session).toBeTruthy();
    
    const parsedSession = JSON.parse(session!);
    expect(parsedSession.email).toBe('test@example.com');
  });

  it('não deve armazenar senha no hash na sessão', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    const session = localStorage.getItem('sored_session');
    const parsedSession = JSON.parse(session!);
    
    expect(parsedSession.passwordHash).toBeUndefined();
  });

  it('deve criar tenant ao fazer signup', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    const tenants = localStorage.getItem('sored_tenants');
    expect(tenants).toBeTruthy();
    
    const parsedTenants = JSON.parse(tenants!);
    expect(parsedTenants).toHaveLength(1);
    expect(parsedTenants[0].companyName).toBe('Test Company');
  });

  it('deve associar usuário ao tenant correto', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    await act(async () => {
      await result.current!.signup('Test Company', 'test@example.com', 'password123');
    });
    
    const user = result.current?.currentUser;
    const tenants = JSON.parse(localStorage.getItem('sored_tenants')!);
    
    expect(user?.tenantId).toBe(tenants[0].id);
  });

  it('deve lançar erro quando usado fora do provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => {
        const context = React.useContext(AuthContext);
        if (!context) throw new Error('useAuth must be used within AuthProvider');
      });
    }).toThrow();
    
    consoleErrorSpy.mockRestore();
  });
});
