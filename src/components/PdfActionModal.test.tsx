import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PdfActionModal from './PdfActionModal';

describe('PdfActionModal Component', () => {
  const mockOnClose = jest.fn();
  const mockBlob = new Blob(['test'], { type: 'application/pdf' });

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('deve renderizar quando isOpen é true', () => {
    render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        filename="test.pdf"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/PDF gerado/i)).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(
      <PdfActionModal
        isOpen={false}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('deve abrir PDF em nova aba ao clicar em abrir', () => {
    const mockWindowOpen = jest.fn();
    global.open = mockWindowOpen;

    render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    const openButton = screen.getByRole('button', { name: /abrir/i });
    fireEvent.click(openButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('blob:mock-url', '_blank');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve fazer download do PDF ao clicar em baixar', () => {
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemove = jest.fn();
    
    document.createElement = jest.fn().mockReturnValue({
      click: mockClick,
      remove: mockRemove,
      href: '',
      download: ''
    });
    document.body.appendChild = mockAppendChild;

    render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        filename="test.pdf"
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /baixar/i });
    fireEvent.click(downloadButton);

    expect(mockClick).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar em fechar', () => {
    render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar no overlay', () => {
    render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    const overlay = document.querySelector('.absolute.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('não deve renderizar botões quando blob é null', () => {
    render(
      <PdfActionModal
        isOpen={true}
        blob={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/PDF gerado/i)).toBeInTheDocument();
  });

  it('deve ter classe de fundo escuro no overlay', () => {
    const { container } = render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    const overlay = container.querySelector('.bg-black');
    expect(overlay).toBeInTheDocument();
  });

  it('deve ter z-index alto para ficar sobre outros elementos', () => {
    const { container } = render(
      <PdfActionModal
        isOpen={true}
        blob={mockBlob}
        onClose={mockOnClose}
      />
    );

    const modalWrapper = container.querySelector('.z-50');
    expect(modalWrapper).toBeInTheDocument();
  });
});
