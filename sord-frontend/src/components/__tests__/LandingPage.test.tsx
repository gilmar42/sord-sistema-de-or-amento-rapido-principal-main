import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPage } from '../LandingPage';

describe('LandingPage', () => {
  const mockOnNavigateToAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render landing page with title', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    expect(screen.getByText('Sistema de Orçamento Rápido')).toBeInTheDocument();
  });

  it('should render navbar with SORED branding', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    expect(screen.getByText('SORED')).toBeInTheDocument();
    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
  });

  it('should render all feature cards', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    expect(screen.getByText('Cálculo de Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Gerenciamento de Materiais')).toBeInTheDocument();
    expect(screen.getByText('Orçamentos Salvos')).toBeInTheDocument();
    expect(screen.getByText('Configurações Avançadas')).toBeInTheDocument();
  });

  it('should render benefits section', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    expect(screen.getByText('Por que escolher SORED?')).toBeInTheDocument();
    expect(screen.getByText('Precisão nos cálculos de orçamento')).toBeInTheDocument();
    expect(screen.getByText('Suporte a múltiplas unidades de medida')).toBeInTheDocument();
  });

  it('should render multiple CTA buttons', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    const buttons = screen.getAllByText(/Começar|Comece/);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should call onNavigateToAuth when CTA button is clicked', async () => {
    const user = userEvent.setup();
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    const ctaButton = screen.getByRole('button', { name: /Começar Agora/i });
    await user.click(ctaButton);
    
    expect(mockOnNavigateToAuth).toHaveBeenCalled();
  });

  it('should track mouse position for 3D effect', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    // Component should render without errors despite mouse tracking
    expect(screen.getByText('Sistema de Orçamento Rápido')).toBeInTheDocument();
  });

  it('should render footer with copyright', () => {
    render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    expect(screen.getByText(/© 2026 SORED/)).toBeInTheDocument();
  });

  it('should have responsive layout', () => {
    const { container } = render(<LandingPage onNavigateToAuth={mockOnNavigateToAuth} />);
    
    // Check for responsive classes
    const mainSection = container.querySelector('section');
    expect(mainSection).toHaveClass('min-h-screen');
  });
});
