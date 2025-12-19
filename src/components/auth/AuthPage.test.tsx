import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthPage } from './AuthPage';
import { AuthProvider } from '../../context/AuthContext';

const mockLogin = jest.fn();
const mockSignup = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    currentUser: null,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(true);
    mockSignup.mockResolvedValue(true);
  });

  it('deve renderizar tela de login por padrão', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('Acessar sua Conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve alternar para tela de cadastro', () => {
    render(<AuthPage />);
    
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Criar Nova Conta')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('deve fazer login com credenciais válidas', async () => {
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('deve mostrar erro ao fazer login com credenciais inválidas', async () => {
    mockLogin.mockResolvedValue(false);
    
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it('deve fazer signup com dados válidos', async () => {
    render(<AuthPage />);
    
    // Alternar para cadastro
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    const companyInput = screen.getByLabelText(/nome da empresa/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    
    fireEvent.change(companyInput, { target: { value: 'Test Company' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('Test Company', 'test@example.com', 'password123');
    });
  });

  it('deve validar campos obrigatórios no login', async () => {
    render(<AuthPage />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/por favor, preencha e-mail e senha/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve validar campos obrigatórios no signup', async () => {
    render(<AuthPage />);
    
    // Alternar para cadastro
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/por favor, preencha todos os campos/i)).toBeInTheDocument();
    });
    
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('deve mostrar estado de loading ao submeter', async () => {
    let resolveLogin: (value: boolean) => void;
    mockLogin.mockReturnValue(new Promise((resolve) => {
      resolveLogin = resolve;
    }));
    
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Resolver promise
    await act(async () => {
      resolveLogin!(true);
    });
  });

  it('deve limpar campos ao alternar entre login e signup', () => {
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    const newEmailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
    
    expect(newEmailInput.value).toBe('');
    expect(newPasswordInput.value).toBe('');
  });

  it('deve limpar mensagem de erro ao alternar views', () => {
    mockLogin.mockResolvedValue(false);
    
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    waitFor(() => {
      expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
    });
    
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    expect(screen.queryByText(/e-mail ou senha inválidos/i)).not.toBeInTheDocument();
  });

  it('deve renderizar logo e título', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('SORED')).toBeInTheDocument();
  });

  it('deve renderizar copyright', () => {
    render(<AuthPage />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`©${currentYear} SORED`))).toBeInTheDocument();
  });

  it('deve lidar com erro genérico', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ocorreu um erro/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar erro quando signup falha', async () => {
    mockSignup.mockResolvedValue(false);
    
    render(<AuthPage />);
    
    const toggleButton = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(toggleButton);
    
    const companyInput = screen.getByLabelText(/nome da empresa/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    
    fireEvent.change(companyInput, { target: { value: 'Test Company' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/este e-mail já está em uso/i)).toBeInTheDocument();
    });
  });
});

// Helper function for async act
const act = async (callback: () => Promise<void>) => {
  await require('@testing-library/react').act(callback);
};
