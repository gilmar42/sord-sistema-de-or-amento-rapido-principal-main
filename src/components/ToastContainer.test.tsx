import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToastContainer from './ToastContainer';

describe('ToastContainer Component', () => {
  const mockToasts = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Sucesso 1',
      message: 'Mensagem de sucesso',
      onClose: jest.fn(),
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Erro 1',
      message: 'Mensagem de erro',
      onClose: jest.fn(),
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Aviso 1',
      onClose: jest.fn(),
    },
  ];

  it('deve renderizar múltiplos toasts', () => {
    const mockCloseToast = jest.fn();
    render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    expect(screen.getByText('Sucesso 1')).toBeInTheDocument();
    expect(screen.getByText('Erro 1')).toBeInTheDocument();
    expect(screen.getByText('Aviso 1')).toBeInTheDocument();
  });

  it('deve renderizar lista vazia quando não há toasts', () => {
    const mockCloseToast = jest.fn();
    const { container } = render(<ToastContainer toasts={[]} onCloseToast={mockCloseToast} />);

    const toastElements = container.querySelectorAll('[role="alert"]');
    expect(toastElements).toHaveLength(0);
  });

  it('deve posicionar container no canto superior direito', () => {
    const mockCloseToast = jest.fn();
    const { container } = render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('fixed');
    expect(containerElement).toHaveClass('top-4');
    expect(containerElement).toHaveClass('right-4');
  });

  it('deve aplicar z-index alto para ficar sobre outros elementos', () => {
    const mockCloseToast = jest.fn();
    const { container } = render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('z-50');
  });

  it('deve renderizar toasts na ordem correta', () => {
    const mockCloseToast = jest.fn();
    render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles[0]).toHaveTextContent('Sucesso 1');
    expect(titles[1]).toHaveTextContent('Erro 1');
    expect(titles[2]).toHaveTextContent('Aviso 1');
  });

  it('deve passar props corretamente para cada Toast', () => {
    const mockCloseToast = jest.fn();
    render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    expect(screen.getByText('Mensagem de sucesso')).toBeInTheDocument();
    expect(screen.getByText('Mensagem de erro')).toBeInTheDocument();
  });

  it('deve renderizar com espaçamento entre toasts', () => {
    const mockCloseToast = jest.fn();
    const { container } = render(<ToastContainer toasts={mockToasts} onCloseToast={mockCloseToast} />);

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('space-y-4');
  });
});
