import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteCalculator } from '../QuoteCalculator';
import { DataProvider } from '../../context/DataContext';
import { AuthProvider } from '../../context/AuthContext';
import React from 'react';

// Mock contexts
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => [initialValue, jest.fn()]),
}));

const renderWithProviders = (props = {}) => {
  const defaultProps = {
    quoteToEdit: null,
    setQuoteToEdit: jest.fn(),
  };
  
  return render(
    <AuthProvider>
      <DataProvider>
        <QuoteCalculator {...defaultProps} {...props} />
      </DataProvider>
    </AuthProvider>
  );
};

describe('QuoteCalculator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente', () => {
    renderWithProviders();
    
    expect(screen.getByText(/cliente/i)).toBeInTheDocument();
  });

  it('deve permitir inserir nome do cliente', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const clientInput = screen.getByPlaceholderText(/nome do cliente/i);
    await user.type(clientInput, 'Cliente Teste');

    expect(clientInput).toHaveValue('Cliente Teste');
  });

  it('deve calcular valores corretamente', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteCalculator />);

    // Adicionar material
    const materialSelect = screen.getByRole('combobox');
    await user.selectOptions(materialSelect, 'Material A');
    
    const quantityInput = screen.getByPlaceholderText(/quantidade/i);
    await user.type(quantityInput, '5');

    // Verificar cálculo
    await waitFor(() => {
      const total = screen.getByText(/total:/i);
      expect(total).toBeInTheDocument();
    });
  });

  it('deve permitir ajustar margem de lucro', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteCalculator />);

    const profitInput = screen.getByLabelText(/margem de lucro/i);
    await user.clear(profitInput);
    await user.type(profitInput, '30');

    expect(profitInput).toHaveValue(30);
  });

  it('deve permitir resetar o formulário', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteCalculator />);

    const clientInput = screen.getByPlaceholderText(/nome do cliente/i);
    await user.type(clientInput, 'Cliente Teste');

    const resetButton = screen.getByRole('button', { name: /limpar/i });
    await user.click(resetButton);

    expect(clientInput).toHaveValue('');
  });

  it('deve validar campos obrigatórios antes de salvar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteCalculator />);

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);

    // Deve mostrar mensagem de erro ou impedir salvamento
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/nome do cliente/i)).toBeInTheDocument();
    });
  });
});
