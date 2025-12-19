import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientManagement } from './ClientManagement';
import { DataProvider } from '../context/DataContext';

// Mock do context
const mockClients = [
  {
    id: 'CLI-1',
    name: 'Cliente Teste 1',
    email: 'cliente1@test.com',
    phone: '11999999999',
    address: 'Rua Teste 1',
    document: '12345678900',
    notes: 'Notas teste',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'CLI-2',
    name: 'Cliente Teste 2',
    email: 'cliente2@test.com',
    phone: '11888888888',
    address: 'Rua Teste 2',
    document: '98765432100',
    notes: '',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockAddClient = jest.fn();
const mockUpdateClient = jest.fn();
const mockDeleteClient = jest.fn();

jest.mock('../context/DataContext', () => ({
  ...jest.requireActual('../context/DataContext'),
  useData: () => ({
    clients: mockClients,
    addClient: mockAddClient,
    updateClient: mockUpdateClient,
    deleteClient: mockDeleteClient,
    materials: [],
    quotes: [],
    settings: {
      companyName: 'Test Company',
      companyContact: 'test@company.com',
      companyLogo: '',
    },
    setMaterials: jest.fn(),
    setQuotes: jest.fn(),
    setSettings: jest.fn(),
  }),
}));

describe('ClientManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a lista de clientes', () => {
    render(<ClientManagement />);
    
    expect(screen.getByText('Cliente Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Cliente Teste 2')).toBeInTheDocument();
    expect(screen.getByText('cliente1@test.com')).toBeInTheDocument();
  });

  it('deve abrir o formulário ao clicar em Novo Cliente', () => {
    render(<ClientManagement />);
    
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i });
    fireEvent.click(novoClienteButton);
    
    expect(screen.getByPlaceholderText(/nome do cliente/i)).toBeInTheDocument();
  });

  it('deve adicionar um novo cliente', async () => {
    render(<ClientManagement />);
    
    // Abrir formulário
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i });
    fireEvent.click(novoClienteButton);
    
    // Preencher dados
    const nameInput = screen.getByPlaceholderText(/nome do cliente/i);
    const emailInput = screen.getByPlaceholderText(/e-mail/i);
    const phoneInput = screen.getByPlaceholderText(/telefone/i);
    
    fireEvent.change(nameInput, { target: { value: 'Novo Cliente' } });
    fireEvent.change(emailInput, { target: { value: 'novo@test.com' } });
    fireEvent.change(phoneInput, { target: { value: '11777777777' } });
    
    // Submeter formulário
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(salvarButton);
    
    await waitFor(() => {
      expect(mockAddClient).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Novo Cliente',
          email: 'novo@test.com',
          phone: '11777777777',
        })
      );
    });
  });

  it('deve validar campos obrigatórios', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ClientManagement />);
    
    // Abrir formulário
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i });
    fireEvent.click(novoClienteButton);
    
    // Tentar salvar sem preencher nome
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(salvarButton);
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('nome'));
    expect(mockAddClient).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('deve editar um cliente existente', async () => {
    render(<ClientManagement />);
    
    // Clicar em editar
    const editButtons = screen.getAllByLabelText(/editar/i);
    fireEvent.click(editButtons[0]);
    
    // Modificar nome
    const nameInput = screen.getByDisplayValue('Cliente Teste 1');
    fireEvent.change(nameInput, { target: { value: 'Cliente Editado' } });
    
    // Salvar
    const salvarButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(salvarButton);
    
    await waitFor(() => {
      expect(mockUpdateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'CLI-1',
          name: 'Cliente Editado',
        })
      );
    });
  });

  it('deve deletar um cliente', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<ClientManagement />);
    
    // Clicar em deletar
    const deleteButtons = screen.getAllByLabelText(/deletar/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteClient).toHaveBeenCalledWith('CLI-1');
    
    confirmSpy.mockRestore();
  });

  it('deve filtrar clientes pela busca', () => {
    render(<ClientManagement />);
    
    const searchInput = screen.getByPlaceholderText(/buscar cliente/i);
    fireEvent.change(searchInput, { target: { value: 'Cliente Teste 1' } });
    
    expect(screen.getByText('Cliente Teste 1')).toBeInTheDocument();
    expect(screen.queryByText('Cliente Teste 2')).not.toBeInTheDocument();
  });

  it('deve cancelar adição de cliente', () => {
    render(<ClientManagement />);
    
    // Abrir formulário
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i });
    fireEvent.click(novoClienteButton);
    
    // Cancelar
    const cancelarButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelarButton);
    
    expect(screen.queryByPlaceholderText(/nome do cliente/i)).not.toBeInTheDocument();
    expect(mockAddClient).not.toHaveBeenCalled();
  });
});
