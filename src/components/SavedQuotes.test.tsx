import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedQuotes } from './SavedQuotes';
import { Quote, Material } from '../types';

const mockMaterials: Material[] = [
  {
    id: 'MAT-1',
    name: 'Material 1',
    description: 'Material de teste 1',
    categoryId: 'CAT-1',
    unitCost: 100,
    unitWeight: 10,
    unit: 'kg',
    components: [],
  },
  {
    id: 'MAT-2',
    name: 'Material 2',
    description: 'Material de teste 2',
    categoryId: 'CAT-1',
    unitCost: 200,
    unitWeight: 20,
    unit: 'kg',
    components: [],
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'Q-1',
    clientName: 'Cliente 1',
    date: '2024-01-01',
    items: [
      { materialId: 'MAT-1', quantity: 10 },
      { materialId: 'MAT-2', quantity: 5 },
    ],
    laborCost: 500,
    freightCost: 200,
    profitMargin: 20,
    laborHours: 40,
    laborHourlyRate: 12.5,
    numberOfWorkers: 1,
  },
  {
    id: 'Q-2',
    clientName: 'Cliente 2',
    date: '2024-01-02',
    items: [{ materialId: 'MAT-1', quantity: 5 }],
    laborCost: 0,
    freightCost: 0,
    profitMargin: 15,
    laborHours: 0,
    laborHourlyRate: 0,
    numberOfWorkers: 1,
  },
];

const mockSetQuotes = jest.fn();
const mockOnEditQuote = jest.fn();

jest.mock('../context/DataContext', () => ({
  useData: () => ({
    quotes: mockQuotes,
    setQuotes: mockSetQuotes,
    materials: mockMaterials,
    settings: {
      companyName: 'Test Company',
      companyContact: 'test@company.com',
      companyLogo: '',
    },
  }),
}));

jest.mock('../services/pdfGenerator', () => ({
  generateQuotePDF: jest.fn(() => 'mock-pdf-blob'),
}));

describe('SavedQuotes Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(() => 'mock-url');
    URL.revokeObjectURL = jest.fn();
  });

  it('deve renderizar a lista de orçamentos salvos', () => {
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    expect(screen.getByText('Cliente 2')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há orçamentos', () => {
    jest.spyOn(require('../context/DataContext'), 'useData').mockReturnValue({
      quotes: [],
      setQuotes: mockSetQuotes,
      materials: mockMaterials,
      settings: {
        companyName: 'Test Company',
        companyContact: 'test@company.com',
        companyLogo: '',
      },
    });

    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    expect(screen.getByText(/nenhum orçamento salvo/i)).toBeInTheDocument();
  });

  it('deve chamar onEditQuote ao clicar em editar', () => {
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    const editButtons = screen.getAllByLabelText(/editar/i);
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEditQuote).toHaveBeenCalledWith(mockQuotes[0]);
  });

  it('deve deletar um orçamento', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    const deleteButtons = screen.getAllByLabelText(/deletar|remover/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockSetQuotes).toHaveBeenCalledWith(
      expect.arrayContaining([mockQuotes[1]])
    );
    
    confirmSpy.mockRestore();
  });

  it('não deve deletar quando cancelar confirmação', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    const deleteButtons = screen.getAllByLabelText(/deletar|remover/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(mockSetQuotes).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('deve calcular corretamente o valor do orçamento', () => {
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    // Material cost: (100*10 + 200*5) = 2000
    // Indirect: 500 + 200 = 700
    // Total project: 2700
    // Profit (20%): 540
    // Final: 3240
    
    expect(screen.getByText(/3240/)).toBeInTheDocument();
  });

  it('deve exibir a data formatada', () => {
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
  });

  it('deve calcular peso total corretamente', () => {
    render(<SavedQuotes onEditQuote={mockOnEditQuote} />);
    
    // Weight: (10*10 + 20*5) = 200 kg
    expect(screen.getByText(/200.*kg/)).toBeInTheDocument();
  });
});
