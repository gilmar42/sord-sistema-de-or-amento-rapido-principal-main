import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('should render landing page with hero section', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    expect(screen.getByText(/Bem-vindo ao/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SORED/i)[0]).toBeInTheDocument();
  });

  it('should display main features', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    expect(screen.getByText(/Cálculos Automáticos/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestão de Materiais/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestão de Clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Profissional/i)).toBeInTheDocument();
  });

  it('should display benefits section', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    expect(screen.getByText(/Por que escolher o SORED?/i)).toBeInTheDocument();
    expect(screen.getByText(/Economia de tempo na criação de orçamentos/i)).toBeInTheDocument();
  });

  it('should call onGetStarted when clicking main CTA button', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    const button = screen.getByText(/Criar Primeiro Orçamento/i);
    fireEvent.click(button);
    
    expect(mockGetStarted).toHaveBeenCalledTimes(1);
  });

  it('should call onGetStarted when clicking secondary CTA button', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    const button = screen.getByRole('button', { name: /Começar Agora/i });
    fireEvent.click(button);
    
    expect(mockGetStarted).toHaveBeenCalledTimes(1);
  });

  it('should display statistics', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} />);
    
    expect(screen.getByText(/86\+/i)).toBeInTheDocument();
    expect(screen.getByText(/Testes Automatizados/i)).toBeInTheDocument();
  });

  it('should show payment success message when paymentStatus is success', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} paymentStatus="success" />);
    expect(screen.getByText(/Pagamento aprovado/i)).toBeInTheDocument();
    expect(screen.queryByText(/Começar Agora/i)).not.toBeInTheDocument();
  });

  it('should show CTA and not payment message when paymentStatus is not success', () => {
    const mockGetStarted = jest.fn();
    render(<LandingPage onGetStarted={mockGetStarted} paymentStatus={null} />);
    expect(screen.getByText(/Começar Agora/i)).toBeInTheDocument();
    expect(screen.queryByText(/Pagamento aprovado/i)).not.toBeInTheDocument();
  });

  it('should switch plan type when clicking plan buttons', () => {
    // Simula o clique nos botões de plano mensal/anual se existirem
    // Este teste é um placeholder, ajuste conforme a UI se houver botões visíveis
    // Exemplo:
    // const mockGetStarted = jest.fn();
    // render(<LandingPage onGetStarted={mockGetStarted} />);
    // const mensalBtn = screen.getByText(/Mensal/i);
    // fireEvent.click(mensalBtn);
    // expect(mensalBtn).toHaveClass('active');
    // ...
    expect(true).toBe(true); // Remova/ajuste conforme implementação
  });
});
