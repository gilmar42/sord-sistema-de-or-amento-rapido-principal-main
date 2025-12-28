import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '../PaymentForm';

// Mock Mercado Pago SDK
(window as any).MercadoPago = jest.fn().mockImplementation(() => ({
  cardForm: jest.fn().mockReturnValue({
    mount: jest.fn(),
    unmount: jest.fn(),
    on: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('PaymentForm Component', () => {
  const mockPlan = {
    id: 'plan1',
    name: 'Plano Mensal',
    price: 100,
    billingCycle: 'monthly',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário de pagamento', () => {
    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText(/dados do pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Plano Mensal/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 100/)).toBeInTheDocument();
  });

  it('deve exibir informações do plano selecionado', () => {
    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText('Plano Mensal')).toBeInTheDocument();
    expect(screen.getByText('R$ 100')).toBeInTheDocument();
  });

  it('deve permitir inserir dados do titular', async () => {
    const user = userEvent.setup();
    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    const nameInput = screen.getByPlaceholderText(/nome completo/i);
    await user.type(nameInput, 'João Silva');

    expect(nameInput).toHaveValue('João Silva');
  });

  it('deve validar CPF', async () => {
    const user = userEvent.setup();
    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    const cpfInput = screen.getByPlaceholderText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');

    expect(cpfInput).toHaveValue('123.456.789-00');
  });

  it('deve chamar onCancel ao clicar em cancelar', async () => {
    const mockOnCancel = jest.fn();
    const user = userEvent.setup();

    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('deve processar pagamento com sucesso', async () => {
    const mockOnSuccess = jest.fn();
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, paymentId: '123' }),
    });

    render(<PaymentForm plan={mockPlan} onSuccess={mockOnSuccess} onCancel={jest.fn()} />);

    // Preencher dados
    const nameInput = screen.getByPlaceholderText(/nome completo/i);
    await user.type(nameInput, 'João Silva');

    const payButton = screen.getByRole('button', { name: /confirmar pagamento/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir erro ao falhar pagamento', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Payment failed' }),
    });

    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    const payButton = screen.getByRole('button', { name: /confirmar pagamento/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao processar pagamento/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão durante processamento', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    const payButton = screen.getByRole('button', { name: /confirmar pagamento/i });
    await user.click(payButton);

    expect(payButton).toBeDisabled();
  });

  it('deve inicializar SDK do Mercado Pago', () => {
    render(<PaymentForm plan={mockPlan} onSuccess={jest.fn()} onCancel={jest.fn()} />);

    expect((window as any).MercadoPago).toHaveBeenCalled();
  });
});
