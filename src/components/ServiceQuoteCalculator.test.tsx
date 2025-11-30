import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceQuoteCalculator } from './ServiceQuoteCalculator';

// Cálculo esperado para a linha default:
// horas = 1, hora = 100 => base 100
// margem removida (0%)
// imposto removido (0%)
// total = 100.00

describe('ServiceQuoteCalculator', () => {
  it('adiciona linha e calcula total corretamente', () => {
    render(<ServiceQuoteCalculator />);
    const addButton = screen.getAllByText(/Adicionar Linha/i)[0];
    fireEvent.click(addButton);
    // Deve mostrar total com base nos valores iniciais
    expect(screen.getAllByText(/R\$ 100\.00/).length).toBeGreaterThan(0);
  });
});
