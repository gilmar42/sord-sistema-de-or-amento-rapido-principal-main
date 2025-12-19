import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from './Toast';

describe('Toast Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('deve renderizar toast de sucesso', () => {
    render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        message="Operação realizada com sucesso"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Sucesso')).toBeInTheDocument();
    expect(screen.getByText('Operação realizada com sucesso')).toBeInTheDocument();
  });

  it('deve renderizar toast de erro', () => {
    render(
      <Toast
        id="2"
        type="error"
        title="Erro"
        message="Algo deu errado"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('deve renderizar toast de aviso', () => {
    render(
      <Toast
        id="3"
        type="warning"
        title="Aviso"
        message="Atenção necessária"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Aviso')).toBeInTheDocument();
  });

  it('deve renderizar toast de informação', () => {
    render(
      <Toast
        id="4"
        type="info"
        title="Informação"
        message="Dados informativos"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Informação')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão fechar', () => {
    render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('1');
  });

  it('deve fechar automaticamente após duração padrão (5s)', () => {
    render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(5000);

    expect(mockOnClose).toHaveBeenCalledWith('1');
  });

  it('deve fechar automaticamente após duração customizada', () => {
    render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        duration={3000}
        onClose={mockOnClose}
      />
    );

    jest.advanceTimersByTime(3000);

    expect(mockOnClose).toHaveBeenCalledWith('1');
  });

  it('deve renderizar sem mensagem (apenas título)', () => {
    render(
      <Toast
        id="1"
        type="info"
        title="Apenas título"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Apenas título')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS corretas para cada tipo', () => {
    const { rerender, container } = render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        onClose={mockOnClose}
      />
    );

    let toastElement = container.firstChild;
    expect(toastElement).toHaveClass('bg-green-500');

    rerender(
      <Toast
        id="2"
        type="error"
        title="Erro"
        onClose={mockOnClose}
      />
    );

    toastElement = container.firstChild;
    expect(toastElement).toHaveClass('bg-red-500');

    rerender(
      <Toast
        id="3"
        type="warning"
        title="Aviso"
        onClose={mockOnClose}
      />
    );

    toastElement = container.firstChild;
    expect(toastElement).toHaveClass('bg-yellow-500');

    rerender(
      <Toast
        id="4"
        type="info"
        title="Info"
        onClose={mockOnClose}
      />
    );

    toastElement = container.firstChild;
    expect(toastElement).toHaveClass('bg-blue-500');
  });

  it('deve limpar timer ao desmontar', () => {
    const { unmount } = render(
      <Toast
        id="1"
        type="success"
        title="Sucesso"
        onClose={mockOnClose}
      />
    );

    unmount();

    jest.advanceTimersByTime(5000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
