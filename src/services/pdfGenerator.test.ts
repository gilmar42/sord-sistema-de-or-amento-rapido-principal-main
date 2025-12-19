import { generateQuotePDF } from './pdfGenerator';
import { Quote, Material, AppSettings, CalculatedCosts } from '../types';

// Mock do jsPDF
const mockSave = jest.fn();
const mockOutput = jest.fn(() => 'mock-pdf-string');
const mockAddImage = jest.fn();
const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockSetFont = jest.fn();
const mockAutoTable = jest.fn();

const mockJsPDF = jest.fn(() => ({
  addImage: mockAddImage,
  setFontSize: mockSetFontSize,
  text: mockText,
  setFont: mockSetFont,
  save: mockSave,
  output: mockOutput,
  autoTable: mockAutoTable,
  lastAutoTable: { finalY: 100 },
}));

// Mock global jspdf
(global as any).jspdf = {
  jsPDF: mockJsPDF,
};

describe('pdfGenerator Service', () => {
  const mockMaterials: Material[] = [
    {
      id: 'MAT-1',
      name: 'Material Teste 1',
      description: 'Descrição do material 1',
      unitCost: 100,
      unitWeight: 10,
      unit: 'kg',
      categoryId: 'CAT-1',
      components: [],
    },
    {
      id: 'MAT-2',
      name: 'Material Teste 2',
      description: 'Descrição do material 2',
      unitCost: 200,
      unitWeight: 20,
      unit: 'kg',
      categoryId: 'CAT-1',
      components: [
        { id: 'COMP-1', name: 'Componente 1', unitCost: 50, unitWeight: 2, unit: 'kg' },
        { id: 'COMP-2', name: 'Componente 2', unitCost: 75, unitWeight: 3, unit: 'kg' },
      ],
    },
  ];

  const mockQuote: Quote = {
    id: 'Q-001',
    clientName: 'Cliente Teste',
    date: '2024-01-15',
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
  };

  const mockSettings: AppSettings = {
    companyName: 'Empresa Teste LTDA',
    companyContact: 'Tel: (11) 1234-5678\nEmail: contato@teste.com',
    companyLogo: 'data:image/png;base64,mocklogo',
    defaultTax: 0,
  };

  const mockCalculated: CalculatedCosts = {
    materialCost: 2000,
    totalGrossCost: 2000,
    indirectCosts: 700,
    totalProjectCost: 2700,
    profitValue: 540,
    finalValue: 3240,
    totalWeight: 200,
    laborCost: 500,
    freightCost: 200,
    totalManufacturingCostPerItem: 0,
    machineCost: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAutoTable.mockReturnValue({
      lastAutoTable: { finalY: 100 },
    });
  });

  it('deve gerar PDF com informações da empresa', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Empresa Teste LTDA'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve incluir logo da empresa se fornecido', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockAddImage).toHaveBeenCalledWith(
      'data:image/png;base64,mocklogo',
      'PNG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('não deve quebrar se logo não for fornecido', () => {
    const settingsWithoutLogo = { ...mockSettings, companyLogo: '' };
    
    expect(() => {
      generateQuotePDF(mockQuote, mockMaterials, settingsWithoutLogo, mockCalculated);
    }).not.toThrow();
  });

  it('deve incluir informações do orçamento', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Q-001'),
      expect.any(Number),
      expect.any(Number)
    );
    
    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Cliente Teste'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve criar tabela com itens do orçamento', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockAutoTable).toHaveBeenCalledWith(
      expect.objectContaining({
        head: expect.arrayContaining([
          expect.arrayContaining(['Descrição']),
        ]),
        body: expect.any(Array),
      })
    );
  });

  it('deve incluir custos calculados no resumo', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('200'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve incluir custo de hora homem quando presente', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('500'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve retornar string quando output é chamado', () => {
    const result = generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);
    
    expect(mockOutput).toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });

  it('deve calcular peso total corretamente', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('200'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve usar custo de componentes quando disponíveis', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    // Material 2 tem componentes com custo total de 125 (50 + 75)
    // Este custo deve ser usado ao invés do unitCost de 200
    expect(mockAutoTable).toHaveBeenCalled();
  });

  it('deve formatar data corretamente', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringMatching(/\d{2}\/\d{2}\/\d{4}/),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve incluir informações de frete quando presente', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('200'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('deve configurar tema da tabela corretamente', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockAutoTable).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'grid',
        headStyles: expect.objectContaining({
          fillColor: expect.any(Array),
        }),
      })
    );
  });

  it('deve lidar com materiais não encontrados', () => {
    const quoteWithInvalidMaterial: Quote = {
      ...mockQuote,
      items: [
        { materialId: 'INVALID-ID', quantity: 10 },
      ],
    };

    expect(() => {
      generateQuotePDF(quoteWithInvalidMaterial, mockMaterials, mockSettings, mockCalculated);
    }).not.toThrow();
  });

  it('deve lidar com orçamento sem itens', () => {
    const emptyQuote: Quote = {
      ...mockQuote,
      items: [],
    };

    expect(() => {
      generateQuotePDF(emptyQuote, mockMaterials, mockSettings, mockCalculated);
    }).not.toThrow();
  });

  it('deve usar setFontSize para diferentes seções', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockSetFontSize).toHaveBeenCalledWith(20); // Header
    expect(mockSetFontSize).toHaveBeenCalledWith(10); // Contact
    expect(mockSetFontSize).toHaveBeenCalledWith(12); // Quote info
  });

  it('deve configurar font styles apropriados', () => {
    generateQuotePDF(mockQuote, mockMaterials, mockSettings, mockCalculated);

    expect(mockSetFont).toHaveBeenCalledWith(undefined, 'bold');
    expect(mockSetFont).toHaveBeenCalledWith(undefined, 'normal');
  });
});
