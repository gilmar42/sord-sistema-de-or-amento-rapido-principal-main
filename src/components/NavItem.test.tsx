import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavItem } from './NavItem';

describe('NavItem Component', () => {
  const mockSetCurrentView = jest.fn();
  const mockSetQuoteToEdit = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o NavItem com label e ícone', () => {
    render(
      <NavItem
        view="calculator"
        label="Calculadora"
        icon={<span data-testid="icon">Icon</span>}
        currentView="materials"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    expect(screen.getByText('Calculadora')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('deve aplicar classe ativa quando currentView corresponde ao view', () => {
    const { container } = render(
      <NavItem
        view="calculator"
        label="Calculadora"
        icon={<span>Icon</span>}
        currentView="calculator"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('from-ice-400');
    expect(button).toHaveClass('to-ice-600');
  });

  it('deve chamar setCurrentView ao clicar', () => {
    render(
      <NavItem
        view="materials"
        label="Materiais"
        icon={<span>Icon</span>}
        currentView="calculator"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const button = screen.getByRole('button', { name: /materiais/i });
    fireEvent.click(button);

    expect(mockSetCurrentView).toHaveBeenCalledWith('materials');
  });

  it('deve chamar onClick customizado se fornecido', () => {
    render(
      <NavItem
        label="Custom Action"
        icon={<span>Icon</span>}
        onClick={mockOnClick}
        currentView="calculator"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const button = screen.getByRole('button', { name: /custom action/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('deve limpar quoteToEdit quando navegar para calculator', () => {
    render(
      <NavItem
        view="calculator"
        label="Calculadora"
        icon={<span>Icon</span>}
        currentView="materials"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const button = screen.getByRole('button', { name: /calculadora/i });
    fireEvent.click(button);

    expect(mockSetQuoteToEdit).toHaveBeenCalledWith(null);
    expect(mockSetCurrentView).toHaveBeenCalledWith('calculator');
  });

  it('não deve aplicar efeito de glow quando não está ativo', () => {
    const { container } = render(
      <NavItem
        view="calculator"
        label="Calculadora"
        icon={<span>Icon</span>}
        currentView="materials"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const glowElement = container.querySelector('.animate-pulse');
    expect(glowElement).not.toBeInTheDocument();
  });

  it('deve aplicar efeito de glow quando está ativo', () => {
    const { container } = render(
      <NavItem
        view="calculator"
        label="Calculadora"
        icon={<span>Icon</span>}
        currentView="calculator"
        setCurrentView={mockSetCurrentView}
        setQuoteToEdit={mockSetQuoteToEdit}
      />
    );

    const glowElement = container.querySelector('.animate-pulse');
    expect(glowElement).toBeInTheDocument();
  });
});
