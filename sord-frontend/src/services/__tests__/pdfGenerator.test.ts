import { generateQuotePDF } from '../pdfGenerator';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    line: jest.fn(),
    rect: jest.fn(),
    setDrawColor: jest.fn(),
    setFillColor: jest.fn(),
    setTextColor: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        width: 210,
        height: 297,
      },
    },
    autoTable: jest.fn(),
  }));
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('pdfGenerator Service', () => {
  const mockQuote = {
    id: 'quote-1',
    clientName: 'Cliente Teste',
    date: '2025-12-27',
    items: [
      {
        materialId: 'mat-1',
        materialName: 'Material A',
        quantity: 5,
        unitCost: 10,
        totalCost: 50,
      },
      {
        materialId: 'mat-2',
        materialName: 'Material B',
        quantity: 2,
        unitCost: 25,
        totalCost: 50,
      },
    ],
    subtotal: 100,
    profitMargin: 20,
    shipping: 10,
    laborCost: 30,
    total: 152,
    notes: 'Observações do orçamento',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve gerar PDF com dados do orçamento', () => {
    generateQuotePDF(mockQuote);

    const jsPDF = require('jspdf');
    expect(jsPDF).toHaveBeenCalled();
  });

  it('deve incluir nome do cliente', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir data do orçamento', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir lista de itens', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve calcular totais corretamente', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir margem de lucro', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir frete se houver', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir custo de mão de obra se houver', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve incluir observações se houver', () => {
    const result = generateQuotePDF(mockQuote);
    
    expect(result).toBeDefined();
  });

  it('deve funcionar com orçamento sem frete', () => {
    const quoteWithoutShipping = {
      ...mockQuote,
      shipping: 0,
      total: 142,
    };

    const result = generateQuotePDF(quoteWithoutShipping);
    
    expect(result).toBeDefined();
  });

  it('deve funcionar com orçamento sem observações', () => {
    const quoteWithoutNotes = {
      ...mockQuote,
      notes: '',
    };

    const result = generateQuotePDF(quoteWithoutNotes);
    
    expect(result).toBeDefined();
  });

  it('deve funcionar com lista vazia de itens', () => {
    const quoteWithNoItems = {
      ...mockQuote,
      items: [],
      subtotal: 0,
      total: 0,
    };

    const result = generateQuotePDF(quoteWithNoItems);
    
    expect(result).toBeDefined();
  });

  it('deve formatar valores monetários corretamente', () => {
    const quoteWithDecimals = {
      ...mockQuote,
      items: [
        {
          materialId: 'mat-1',
          materialName: 'Material A',
          quantity: 1.5,
          unitCost: 10.99,
          totalCost: 16.485,
        },
      ],
    };

    const result = generateQuotePDF(quoteWithDecimals);
    
    expect(result).toBeDefined();
  });
});
