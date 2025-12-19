import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Settings } from './Settings';

const mockSettings = {
  companyName: 'Test Company',
  companyContact: 'test@company.com',
  companyLogo: '',
};

const mockSetSettings = jest.fn();

jest.mock('../context/DataContext', () => ({
  useData: () => ({
    settings: mockSettings,
    setSettings: mockSetSettings,
    materials: [],
    quotes: [],
    clients: [],
  }),
}));

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('deve renderizar o formulário de configurações', () => {
    render(<Settings />);
    
    expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/informações de contato/i)).toBeInTheDocument();
  });

  it('deve exibir valores iniciais do contexto', () => {
    render(<Settings />);
    
    const nameInput = screen.getByLabelText(/nome da empresa/i) as HTMLInputElement;
    const contactInput = screen.getByLabelText(/informações de contato/i) as HTMLTextAreaElement;
    
    expect(nameInput.value).toBe('Test Company');
    expect(contactInput.value).toBe('test@company.com');
  });

  it('deve atualizar valores ao digitar', () => {
    render(<Settings />);
    
    const nameInput = screen.getByLabelText(/nome da empresa/i);
    fireEvent.change(nameInput, { target: { value: 'New Company Name' } });
    
    expect((nameInput as HTMLInputElement).value).toBe('New Company Name');
  });

  it('deve salvar configurações ao clicar em Salvar', async () => {
    render(<Settings />);
    
    const nameInput = screen.getByLabelText(/nome da empresa/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Company' } });
    
    const saveButton = screen.getByRole('button', { name: /salvar configurações/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSetSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: 'Updated Company',
        })
      );
    });
  });

  it('deve exibir mensagem de sucesso após salvar', async () => {
    render(<Settings />);
    
    const saveButton = screen.getByRole('button', { name: /salvar configurações/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/salvo com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve esconder mensagem de sucesso após 2 segundos', async () => {
    render(<Settings />);
    
    const saveButton = screen.getByRole('button', { name: /salvar configurações/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/salvo com sucesso/i)).toBeInTheDocument();
    });
    
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(screen.queryByText(/salvo com sucesso/i)).not.toBeInTheDocument();
    });
  });

  it('deve processar upload de logo', async () => {
    render(<Settings />);
    
    const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/logotipo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
    });
    
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as any,
      result: 'data:image/png;base64,mockbase64',
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput);
    
    // Simular onloadend
    if (mockFileReader.onloadend) {
      mockFileReader.onloadend();
    }
    
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('deve permitir migração de localStorage', async () => {
    // Setup localStorage mock
    const mockMaterials = [
      { id: '1', name: 'Material 1', unitCost: 100 },
    ];
    
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'sored_materials') {
        return JSON.stringify(mockMaterials);
      }
      return null;
    });
    
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.keys = jest.fn();
    Object.keys = jest.fn(() => ['sored_materials']);
    
    render(<Settings />);
    
    const migrateButton = screen.getByRole('button', { name: /migrar/i });
    fireEvent.click(migrateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/migrated/i)).toBeInTheDocument();
    });
  });

  it('deve permitir atualização de contato', () => {
    render(<Settings />);
    
    const contactInput = screen.getByLabelText(/informações de contato/i);
    fireEvent.change(contactInput, { 
      target: { value: 'Tel: (11) 9999-9999\nEmail: novo@empresa.com' } 
    });
    
    expect((contactInput as HTMLTextAreaElement).value).toContain('Tel: (11) 9999-9999');
  });
});
