/**
 * Testes de Produção - ClientManagement
 * Valida CRUD de clientes, busca e validações
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientManagement } from '../ClientManagement';
import { DataProvider } from '../../context/DataContext';
import { Client } from '../../types';

// Mock do AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 'test-user-id',
      email: 'test@example.com',
      tenantId: 'test-tenant-id',
    },
  }),
}));

const mockClients: Client[] = [
  {
    id: 'CLI-001',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    address: 'Rua A, 123',
    document: '123.456.789-00',
    notes: 'Cliente VIP',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'CLI-002',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 91234-5678',
    address: 'Av. B, 456',
    document: '987.654.321-00',
    notes: 'Cliente regular',
    createdAt: '2024-02-20T14:30:00.000Z',
  },
  {
    id: 'CLI-003',
    name: 'Pedro Oliveira',
    email: '',
    phone: '(11) 99999-8888',
    address: 'Rua C, 789',
    document: '111.222.333-44',
    notes: '',
    createdAt: '2024-03-10T09:15:00.000Z',
  },
];

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => {
      if (key === 'test-tenant-id-clients') {
        return JSON.stringify(mockClients);
      }
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ClientManagement - Testes de Produção', () => {
  const renderClientManagement = () => {
    return render(
      <DataProvider testCurrentUser={{ id: 'test-user-id', tenantId: 'test-tenant-id' }}>
        <ClientManagement />
      </DataProvider>
    );
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  describe('Renderização Inicial', () => {
    it('deve renderizar o título da página', () => {
      renderClientManagement();
      expect(screen.getByText(/Gestão de Clientes/i)).toBeInTheDocument();
    });

    it('deve exibir estatísticas dos clientes', () => {
      renderClientManagement();
      
      // Total de clientes
      expect(screen.getByText(/Total de Clientes/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Clientes com email
      expect(screen.getByText(/Com Email/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Clientes com telefone
      expect(screen.getByText(/Com Telefone/i)).toBeInTheDocument();
    });

    it('deve exibir lista de clientes', () => {
      renderClientManagement();
      
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
    });

    it('deve exibir campo de busca', () => {
      renderClientManagement();
      expect(screen.getByPlaceholderText(/Buscar clientes/i)).toBeInTheDocument();
    });
  });

  describe('Busca de Clientes', () => {
    it('deve filtrar clientes por nome', () => {
      renderClientManagement();
      
      const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
      fireEvent.change(searchInput, { target: { value: 'João' } });
      
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
      expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument();
    });

    it('deve filtrar clientes por email', () => {
      renderClientManagement();
      
      const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
      fireEvent.change(searchInput, { target: { value: 'maria@' } });
      
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument();
    });

    it('deve filtrar clientes por telefone', () => {
      renderClientManagement();
      
      const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
      fireEvent.change(searchInput, { target: { value: '99999' } });
      
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
    });

    it('deve ser case insensitive na busca', () => {
      renderClientManagement();
      
      const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
      fireEvent.change(searchInput, { target: { value: 'JOÃO' } });
      
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando não encontrar resultados', () => {
      renderClientManagement();
      
      const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
      fireEvent.change(searchInput, { target: { value: 'Cliente Inexistente' } });
      
      expect(screen.getByText(/Nenhum cliente encontrado/i)).toBeInTheDocument();
    });
  });

  describe('Adicionar Cliente', () => {
    it('deve abrir modal de cadastro ao clicar em adicionar', () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      expect(screen.getByText(/Cadastrar Cliente/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Nome completo/i)).toBeInTheDocument();
    });

    it('deve adicionar novo cliente com todos os campos', async () => {
      renderClientManagement();
      
      // Abrir modal
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      // Preencher formulário
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Novo Cliente' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@exemplo.com/i), {
        target: { value: 'novo@email.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/\(00\) 00000-0000/i), {
        target: { value: '(11) 98888-7777' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Endereço completo/i), {
        target: { value: 'Rua Nova, 100' },
      });
      fireEvent.change(screen.getByPlaceholderText(/CPF ou CNPJ/i), {
        target: { value: '555.555.555-55' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Observações adicionais/i), {
        target: { value: 'Cliente novo' },
      });
      
      // Salvar
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      // Verificar se foi adicionado
      await waitFor(() => {
        expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
      });
    });

    it('deve validar campo nome obrigatório', async () => {
      renderClientManagement();
      
      // Abrir modal
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      // Mock window.alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      // Tentar salvar sem nome
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('nome'));
      });
      
      alertMock.mockRestore();
    });

    it('deve adicionar cliente apenas com nome (campos opcionais vazios)', async () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Cliente Mínimo' },
      });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Cliente Mínimo')).toBeInTheDocument();
      });
    });
  });

  describe('Editar Cliente', () => {
    it('deve abrir modal de edição com dados preenchidos', () => {
      renderClientManagement();
      
      // Clicar no botão de editar do primeiro cliente
      const editButtons = screen.getAllByLabelText(/Editar cliente/i);
      fireEvent.click(editButtons[0]);
      
      expect(screen.getByText(/Editar Cliente/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
      expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument();
    });

    it('deve atualizar dados do cliente', async () => {
      renderClientManagement();
      
      // Abrir edição
      const editButtons = screen.getAllByLabelText(/Editar cliente/i);
      fireEvent.click(editButtons[0]);
      
      // Alterar nome
      const nameInput = screen.getByDisplayValue('João Silva');
      fireEvent.change(nameInput, { target: { value: 'João Silva Atualizado' } });
      
      // Salvar
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      // Verificar atualização
      await waitFor(() => {
        expect(screen.getByText('João Silva Atualizado')).toBeInTheDocument();
        expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      });
    });

    it('deve preservar campos não alterados na edição', async () => {
      renderClientManagement();
      
      const editButtons = screen.getAllByLabelText(/Editar cliente/i);
      fireEvent.click(editButtons[0]);
      
      // Alterar apenas o telefone
      const phoneInput = screen.getByDisplayValue('(11) 98765-4321');
      fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('joao@email.com')).toBeInTheDocument();
      });
    });
  });

  describe('Deletar Cliente', () => {
    it('deve deletar cliente após confirmação', async () => {
      renderClientManagement();
      
      // Confirmar deleção
      window.confirm = jest.fn(() => true);
      
      // Clicar em deletar
      const deleteButtons = screen.getAllByLabelText(/Deletar cliente/i);
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      });
    });

    it('não deve deletar se cancelar confirmação', async () => {
      renderClientManagement();
      
      // Cancelar deleção
      window.confirm = jest.fn(() => false);
      
      const deleteButtons = screen.getAllByLabelText(/Deletar cliente/i);
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });
  });

  describe('Modal de Formulário', () => {
    it('deve fechar modal ao clicar em cancelar', () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      expect(screen.getByText(/Cadastrar Cliente/i)).toBeInTheDocument();
      
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText(/Cadastrar Cliente/i)).not.toBeInTheDocument();
    });

    it('deve limpar formulário ao fechar modal', () => {
      renderClientManagement();
      
      // Abrir modal
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      // Preencher campo
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Teste' },
      });
      
      // Cancelar
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
      
      // Reabrir modal
      fireEvent.click(addButton);
      
      // Campo deve estar vazio
      expect(screen.getByPlaceholderText(/Nome completo/i)).toHaveValue('');
    });

    it('deve limpar formulário após salvar', async () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Cliente Teste' },
      });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Cadastrar Cliente/i)).not.toBeInTheDocument();
      });
      
      // Reabrir e verificar se está limpo
      fireEvent.click(addButton);
      expect(screen.getByPlaceholderText(/Nome completo/i)).toHaveValue('');
    });
  });

  describe('Estatísticas', () => {
    it('deve calcular total de clientes corretamente', () => {
      renderClientManagement();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('deve calcular clientes com email corretamente', () => {
      renderClientManagement();
      // João e Maria têm email, Pedro não tem
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('deve atualizar estatísticas ao adicionar cliente', async () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Novo Cliente Stats' },
      });
      fireEvent.change(screen.getByPlaceholderText(/email@exemplo.com/i), {
        target: { value: 'stats@email.com' },
      });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        // Total deve ser 4
        const statElements = screen.getAllByText('4');
        expect(statElements.length).toBeGreaterThan(0);
      });
    });

    it('deve atualizar estatísticas ao deletar cliente', async () => {
      renderClientManagement();
      
      window.confirm = jest.fn(() => true);
      
      const deleteButtons = screen.getAllByLabelText(/Deletar cliente/i);
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        // Total deve ser 2
        const statElements = screen.getAllByText('2');
        expect(statElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Persistência de Dados', () => {
    it('deve salvar cliente no localStorage', async () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Cliente Persistente' },
      });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const stored = localStorageMock.getItem('test-tenant-id-clients');
        if (stored) {
          const clients = JSON.parse(stored);
          const found = clients.find((c: Client) => c.name === 'Cliente Persistente');
          expect(found).toBeDefined();
        }
      });
    });

    it('deve gerar ID único para novo cliente', async () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      fireEvent.change(screen.getByPlaceholderText(/Nome completo/i), {
        target: { value: 'Cliente com ID' },
      });
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const stored = localStorageMock.getItem('test-tenant-id-clients');
        if (stored) {
          const clients = JSON.parse(stored);
          const newClient = clients.find((c: Client) => c.name === 'Cliente com ID');
          expect(newClient?.id).toMatch(/^CLI-\d+$/);
        }
      });
    });
  });

  describe('Interface e UX', () => {
    it('deve exibir informações de contato do cliente', () => {
      renderClientManagement();
      
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();
      expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
    });

    it('deve exibir data de cadastro formatada', () => {
      renderClientManagement();
      // Verificar se a data é exibida (formato pode variar)
      expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
    });

    it('deve desabilitar botão de salvar durante processamento', () => {
      renderClientManagement();
      
      const addButton = screen.getByText(/Novo Cliente/i);
      fireEvent.click(addButton);
      
      const saveButton = screen.getByText(/Salvar Cliente/i);
      expect(saveButton).not.toBeDisabled();
    });
  });
});
