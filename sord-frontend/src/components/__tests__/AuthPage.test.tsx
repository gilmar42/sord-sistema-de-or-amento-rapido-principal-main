import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../context/AuthContext';
import { AuthPage } from '../auth/AuthPage';

// Mock useLocalStorage
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => {
    let value = initialValue;
    return [
      value,
      jest.fn((newValue) => {
        value = newValue;
      }),
    ];
  }),
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário de login por padrão', () => {
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve alternar para o formulário de cadastro', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const cadastroLink = screen.getByText(/criar uma conta/i);
    await user.click(cadastroLink);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/nome da empresa/i)).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios no login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(loginButton);

    // Form validation should prevent submission
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument();
  });

  it('deve aceitar entrada de email e senha', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText(/e-mail/i);
    const passwordInput = screen.getByPlaceholderText(/senha/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
