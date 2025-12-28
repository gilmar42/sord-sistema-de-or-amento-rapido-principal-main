import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansList } from '../PlansList';

// Mock fetch
global.fetch = jest.fn();

describe('PlansList Component', () => {
  const mockPlans = [
    {
      id: 'plan1',
      name: 'Plano Mensal',
      price: 100,
      billingCycle: 'monthly',
      features: {
        maxClients: 50,
        maxQuotes: 100,
        maxUsers: 3,
      },
    },
    {
      id: 'plan2',
      name: 'Plano Anual',
      price: 1100,
      billingCycle: 'yearly',
      features: {
        maxClients: 50,
        maxQuotes: 100,
        maxUsers: 3,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPlans,
    });
  });

  it('deve carregar e exibir planos', async () => {
    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Plano Mensal')).toBeInTheDocument();
      expect(screen.getByText('Plano Anual')).toBeInTheDocument();
    });

    expect(screen.getByText(/R\$ 100/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 1\.100/)).toBeInTheDocument();
  });

  it('deve exibir badge de melhor economia para plano anual', async () => {
    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/melhor economia/i)).toBeInTheDocument();
    });
  });

  it('deve calcular e exibir economia do plano anual', async () => {
    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      // Economia: (100 * 12) - 1100 = 1200 - 1100 = 100
      // Percentual: (100 / 1200) * 100 = 8.33%
      expect(screen.getByText(/8%/)).toBeInTheDocument();
    });
  });

  it('deve chamar callback ao selecionar plano', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();

    render(<PlansList onSelectPlan={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Plano Mensal')).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /selecionar/i })[0];
    await user.click(selectButton);

    expect(mockOnSelect).toHaveBeenCalledWith(mockPlans[0]);
  });

  it('deve exibir erro ao falhar carregamento', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar planos/i)).toBeInTheDocument();
    });
  });

  it('deve fazer fetch para a API correta', async () => {
    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/plans'),
        expect.any(Object)
      );
    });
  });

  it('deve listar features dos planos', async () => {
    render(<PlansList onSelectPlan={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/50 clientes/i)).toBeInTheDocument();
      expect(screen.getByText(/100 orçamentos/i)).toBeInTheDocument();
      expect(screen.getByText(/3 usuários/i)).toBeInTheDocument();
    });
  });
});
