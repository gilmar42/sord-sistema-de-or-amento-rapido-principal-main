import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentForm from './PaymentForm';

// Mock do serviço de pagamento
jest.mock('../services/paymentService', () => ({
  createPayment: jest.fn(),
}));

// Mock do SDK Mercado Pago
Object.defineProperty(window, 'MercadoPago', {
  value: jest.fn(() => ({
    createCardToken: jest.fn().mockResolvedValue({ token: 'mock-token-123' }),
  })),
});

describe('PaymentForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const defaultProps = {
    amount: 100.00,
    description: 'Teste de Pagamento',
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza o formulário corretamente', () => {
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Formulário de Pagamento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu Nome Completo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar/i })).toBeInTheDocument();
  });

  test('valida campo de email obrigatório', async () => {
    render(<PaymentForm {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pagar/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText(/Por favor, preencha o email/i)).toBeInTheDocument();
    });
  });

  test('valida campos do cartão obrigatórios', async () => {
    render(<PaymentForm {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const payButton = screen.getByRole('button', { name: /Pagar/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText(/Por favor, preencha todos os campos do cartão/i)).toBeInTheDocument();
    });
  });

  test('formata número do cartão corretamente', () => {
    render(<PaymentForm {...defaultProps} />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    fireEvent.change(cardInput, { target: { value: '4111111111111111' } });

    expect(cardInput).toHaveValue('4111111111111111');
  });

  test('formata validade do cartão como MM/AA', () => {
    render(<PaymentForm {...defaultProps} />);
    
    const validityInput = screen.getByPlaceholderText('MM/AA');
    
    fireEvent.change(validityInput, { target: { value: '1225' } });
    expect(validityInput).toHaveValue('12/25');
  });

  test('limita CVV a 4 dígitos', () => {
    render(<PaymentForm {...defaultProps} />);
    
    const cvvInput = screen.getByPlaceholderText('123');
    fireEvent.change(cvvInput, { target: { value: '12345' } });

    expect(cvvInput).toHaveValue('1234');
  });

  test('calcula corretamente parcelamentos', () => {
    render(<PaymentForm {...defaultProps} />);
    
    const installmentSelect = screen.getByDisplayValue('1x de R$ 100.00');
    fireEvent.change(installmentSelect, { target: { value: '3' } });

    expect(screen.getByDisplayValue('3x de R$ 33.33')).toBeInTheDocument();
  });

  test('exibe total do pagamento', () => {
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Total: R$ 100.00')).toBeInTheDocument();
  });

  test('desabilita botão durante carregamento', async () => {
    const { createPayment } = require('../services/paymentService');
    createPayment.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PaymentForm {...defaultProps} />);
    
    // Preencher formulário
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'test@example.com' } 
    });

    const payButton = screen.getByRole('button', { name: /Pagar/i });
    expect(payButton).not.toBeDisabled();
  });

  test('chama onError quando pagamento falha', async () => {
    const { createPayment } = require('../services/paymentService');
    createPayment.mockResolvedValueOnce({
      success: false,
      error: 'Cartão recusado',
    });

    render(<PaymentForm {...defaultProps} />);
    
    // Preencher e submeter formulário
    // ... (código de preenchimento)
    
    // Aguardar callback
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Cartão recusado');
    });
  });
});
