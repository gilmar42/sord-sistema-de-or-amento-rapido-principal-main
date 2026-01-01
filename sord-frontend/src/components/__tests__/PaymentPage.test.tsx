import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentPage } from '../PaymentPage';

// Mock fetch
globalThis.fetch = jest.fn() as any;

describe('PaymentPage', () => {
  const mockOnPaymentSuccess = jest.fn();
  const mockOnPaymentError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ((globalThis as any).fetch as jest.Mock).mockClear();
    // Mock Mercado Pago
    (window as any).MercadoPago = {
      setPublishableKey: jest.fn(),
    };
  });

  it('should render payment form', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByText('Ative sua conta para acessar o sistema')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);
    
    expect(screen.getByText('Carregando sistema de pagamento...')).toBeInTheDocument();
  });

  it('should render name and email input fields', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('João da Silva')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', status: 'approved' }),
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('João da Silva')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('João da Silva');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /Ativar Conta/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect((globalThis as any).fetch).toHaveBeenCalled();
    });
  });

  it('should show error message on validation failure', async () => {
    const user = userEvent.setup();
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /Ativar Conta/i });
    await user.click(submitButton);

    // Should show validation error
    expect(mockOnPaymentError).toHaveBeenCalled();
  });

  it('should handle payment API error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Erro ao processar pagamento';
    
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('João da Silva');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const submitButton = screen.getByRole('button', { name: /Ativar Conta/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnPaymentError).toHaveBeenCalled();
    });
  });

  it('should disable form while processing', async () => {
    const user = userEvent.setup();
    ((globalThis as any).fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: '123' }),
      }), 500))
    );

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('João da Silva') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('seu@email.com') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Ativar Conta/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check that submit button is disabled
    expect(submitButton).toBeDisabled();
  });

  it('should render test mode notice', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByText('Modo Teste:')).toBeInTheDocument();
    });
  });

  it('should render support contact', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<PaymentPage onPaymentSuccess={mockOnPaymentSuccess} onPaymentError={mockOnPaymentError} />);

    await waitFor(() => {
      expect(screen.getByText(/suporte@sored.com/)).toBeInTheDocument();
    });
  });
});
