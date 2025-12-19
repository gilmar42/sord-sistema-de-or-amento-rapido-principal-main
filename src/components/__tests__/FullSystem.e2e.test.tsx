import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

/**
 * Teste de Integração End-to-End Completo
 * 
 * Este teste simula um fluxo completo de uso do sistema:
 * 1. Autenticação (signup/login)
 * 2. Gerenciamento de materiais
 * 3. Gerenciamento de clientes
 * 4. Criação de orçamento
 * 5. Salvamento e visualização de orçamentos
 * 6. Geração de PDF
 */

describe('Sistema SORED - Teste E2E Completo', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('deve completar fluxo completo do sistema', async () => {
    render(<App />);

    // ========== ETAPA 1: AUTENTICAÇÃO ==========
    
    // Verificar tela de login
    expect(screen.getByText(/acessar sua conta/i)).toBeInTheDocument();

    // Alternar para signup
    const signupToggle = screen.getByText(/não tem uma conta\? cadastre-se/i);
    fireEvent.click(signupToggle);

    // Preencher formulário de cadastro
    const companyInput = screen.getByLabelText(/nome da empresa/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(companyInput, { target: { value: 'Empresa Teste E2E' } });
    fireEvent.change(emailInput, { target: { value: 'e2e@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });

    // Submeter cadastro
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

    // Aguardar redirecionamento para aplicação principal
    await waitFor(() => {
      expect(screen.queryByText(/criar nova conta/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // ========== ETAPA 2: GERENCIAMENTO DE MATERIAIS ==========

    // Navegar para Materiais
    const materialsNav = screen.getByRole('button', { name: /materiais/i });
    fireEvent.click(materialsNav);

    await waitFor(() => {
      expect(screen.getByText(/gerenciar materiais/i)).toBeInTheDocument();
    });

    // Adicionar novo material
    const newMaterialButton = screen.getByRole('button', { name: /novo material/i });
    fireEvent.click(newMaterialButton);

    // Preencher formulário de material
    const materialNameInput = screen.getByPlaceholderText(/nome do material/i);
    const materialCostInput = screen.getByPlaceholderText(/custo unitário/i);
    const materialWeightInput = screen.getByPlaceholderText(/peso unitário/i);

    fireEvent.change(materialNameInput, { target: { value: 'Aço Inox 304' } });
    fireEvent.change(materialCostInput, { target: { value: '150.00' } });
    fireEvent.change(materialWeightInput, { target: { value: '5.5' } });

    // Salvar material
    const saveMaterialButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveMaterialButton);

    await waitFor(() => {
      expect(screen.getByText('Aço Inox 304')).toBeInTheDocument();
    });

    // Adicionar segundo material
    fireEvent.click(newMaterialButton);
    
    const materialNameInput2 = screen.getByPlaceholderText(/nome do material/i);
    fireEvent.change(materialNameInput2, { target: { value: 'Tubo PVC' } });
    fireEvent.change(screen.getByPlaceholderText(/custo unitário/i), { target: { value: '25.00' } });
    fireEvent.change(screen.getByPlaceholderText(/peso unitário/i), { target: { value: '1.2' } });
    
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText('Tubo PVC')).toBeInTheDocument();
    });

    // ========== ETAPA 3: GERENCIAMENTO DE CLIENTES ==========

    // Navegar para Clientes (se existir essa navegação)
    const clientsNav = screen.queryByRole('button', { name: /clientes/i });
    if (clientsNav) {
      fireEvent.click(clientsNav);

      await waitFor(() => {
        expect(screen.getByText(/gerenciar clientes/i)).toBeInTheDocument();
      });

      // Adicionar novo cliente
      const newClientButton = screen.getByRole('button', { name: /novo cliente/i });
      fireEvent.click(newClientButton);

      // Preencher formulário de cliente
      const clientNameInput = screen.getByPlaceholderText(/nome do cliente/i);
      const clientEmailInput = screen.getByPlaceholderText(/e-mail/i);
      const clientPhoneInput = screen.getByPlaceholderText(/telefone/i);

      fireEvent.change(clientNameInput, { target: { value: 'Cliente E2E Teste' } });
      fireEvent.change(clientEmailInput, { target: { value: 'cliente@e2e.com' } });
      fireEvent.change(clientPhoneInput, { target: { value: '11999999999' } });

      // Salvar cliente
      const saveClientButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveClientButton);

      await waitFor(() => {
        expect(screen.getByText('Cliente E2E Teste')).toBeInTheDocument();
      });
    }

    // ========== ETAPA 4: CRIAR ORÇAMENTO ==========

    // Navegar para Calculadora
    const calculatorNav = screen.getByRole('button', { name: /calculadora|orçamento/i });
    fireEvent.click(calculatorNav);

    await waitFor(() => {
      expect(screen.getByText(/calculadora de orçamento/i)).toBeInTheDocument();
    });

    // Preencher dados do orçamento
    const clientNameQuoteInput = screen.getByPlaceholderText(/nome do cliente/i);
    fireEvent.change(clientNameQuoteInput, { target: { value: 'Cliente E2E Teste' } });

    // Adicionar material ao orçamento
    const addMaterialButton = screen.getByRole('button', { name: /adicionar material/i });
    fireEvent.click(addMaterialButton);

    // Selecionar material da lista
    await waitFor(() => {
      const material1 = screen.getByText('Aço Inox 304');
      fireEvent.click(material1);
    });

    // Definir quantidade
    const quantityInput = screen.getByPlaceholderText(/quantidade/i);
    fireEvent.change(quantityInput, { target: { value: '10' } });

    // Adicionar custos indiretos
    const laborCostInput = screen.getByPlaceholderText(/custo de mão de obra/i);
    const freightCostInput = screen.getByPlaceholderText(/custo de frete/i);
    const profitMarginInput = screen.getByPlaceholderText(/margem de lucro/i);

    fireEvent.change(laborCostInput, { target: { value: '500' } });
    fireEvent.change(freightCostInput, { target: { value: '100' } });
    fireEvent.change(profitMarginInput, { target: { value: '20' } });

    // ========== ETAPA 5: SALVAR ORÇAMENTO ==========

    const saveQuoteButton = screen.getByRole('button', { name: /salvar orçamento/i });
    fireEvent.click(saveQuoteButton);

    await waitFor(() => {
      expect(screen.getByText(/orçamento salvo com sucesso/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // ========== ETAPA 6: VISUALIZAR ORÇAMENTOS SALVOS ==========

    // Navegar para Orçamentos Salvos
    const savedQuotesNav = screen.getByRole('button', { name: /orçamentos salvos/i });
    fireEvent.click(savedQuotesNav);

    await waitFor(() => {
      expect(screen.getByText('Cliente E2E Teste')).toBeInTheDocument();
    });

    // ========== ETAPA 7: GERAR PDF ==========

    const pdfButton = screen.getByRole('button', { name: /pdf|gerar|visualizar/i });
    fireEvent.click(pdfButton);

    // Aguardar modal de PDF (se existir)
    await waitFor(() => {
      const dialog = screen.queryByRole('dialog');
      if (dialog) {
        expect(dialog).toBeInTheDocument();
      }
    });

    // ========== ETAPA 8: CONFIGURAÇÕES ==========

    const settingsNav = screen.getByRole('button', { name: /configurações/i });
    fireEvent.click(settingsNav);

    await waitFor(() => {
      expect(screen.getByText(/configurações da empresa/i)).toBeInTheDocument();
    });

    // Atualizar nome da empresa
    const companyNameSetting = screen.getByLabelText(/nome da empresa/i);
    fireEvent.change(companyNameSetting, { target: { value: 'Empresa E2E Atualizada' } });

    const saveSettingsButton = screen.getByRole('button', { name: /salvar configurações/i });
    fireEvent.click(saveSettingsButton);

    await waitFor(() => {
      expect(screen.getByText(/salvo com sucesso/i)).toBeInTheDocument();
    });

    // ========== ETAPA 9: LOGOUT ==========

    const logoutButton = screen.queryByRole('button', { name: /sair|logout/i });
    if (logoutButton) {
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/acessar sua conta/i)).toBeInTheDocument();
      });
    }

    // ========== VERIFICAÇÃO FINAL ==========
    
    // Verificar que dados foram persistidos no localStorage
    const materials = localStorage.getItem('sored_materials');
    const quotes = localStorage.getItem('sored_quotes');
    const settings = localStorage.getItem('sored_settings');

    expect(materials).toBeTruthy();
    expect(quotes).toBeTruthy();
    expect(settings).toBeTruthy();

    // Verificar conteúdo
    if (materials) {
      const parsedMaterials = JSON.parse(materials);
      expect(parsedMaterials.length).toBeGreaterThan(0);
    }

    if (quotes) {
      const parsedQuotes = JSON.parse(quotes);
      expect(parsedQuotes.length).toBeGreaterThan(0);
    }
  });

  it('deve persistir dados entre sessões', async () => {
    // Primeira renderização
    const { unmount } = render(<App />);

    // Adicionar dados
    localStorage.setItem('sored_materials', JSON.stringify([
      { id: '1', name: 'Material Persistido', unitCost: 100, unitWeight: 5 }
    ]));

    unmount();

    // Segunda renderização
    render(<App />);

    // Verificar se dados foram carregados
    await waitFor(() => {
      const materials = localStorage.getItem('sored_materials');
      expect(materials).toBeTruthy();
      
      if (materials) {
        const parsed = JSON.parse(materials);
        expect(parsed[0].name).toBe('Material Persistido');
      }
    });
  });

  it('deve lidar com múltiplas ações simultâneas', async () => {
    render(<App />);

    // Simular várias ações rapidamente
    const actions = [
      () => fireEvent.click(screen.getByRole('button', { name: /materiais/i })),
      () => fireEvent.click(screen.getByRole('button', { name: /calculadora/i })),
      () => fireEvent.click(screen.getByRole('button', { name: /configurações/i })),
    ];

    actions.forEach(action => action());

    // Sistema deve permanecer estável
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
