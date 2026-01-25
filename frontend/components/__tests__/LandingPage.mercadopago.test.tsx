// ...existing code...
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LandingPage } from '../LandingPage';
import { apiService } from '../../services/api';

jest.mock('../../services/api');

describe('LandingPage - Integração Mercado Pago', () => {
  let originalLocation: any;
  let assignMock: jest.Mock;
  let alertMock: jest.Mock;

  beforeEach(() => {
    // Setup de mocks e variáveis antes de cada teste
    originalLocation = window.location;
    assignMock = jest.fn();
    alertMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock };
    window.alert = alertMock;
  });

  afterEach(() => {
    // Limpa mocks e restaura window.location
    window.location = originalLocation;
    jest.clearAllMocks();
  });

    it('deve iniciar pagamento e redirecionar para Mercado Pago', async () => {
      jest.spyOn(apiService, 'createPaymentPreference').mockImplementation(async () => ({
        initPoint: 'https://mercadopago.com/redirect',
      }));

      render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
      // Se existir botão para selecionar plano anual, clique nele
      const planoAnualBtn = screen.queryByText(/Plano Anual/i);
      if (planoAnualBtn) {
        fireEvent.click(planoAnualBtn);
      }
      const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
      await act(async () => {
        fireEvent.click(comecarAgoraBtns[0]);
      });
      await waitFor(() => {
        expect(assignMock).toHaveBeenCalledWith('https://mercadopago.com/redirect');
      });
    });

    it('deve exibir erro se não houver link de pagamento (undefined)', async () => {
      (apiService.createPaymentPreference as jest.Mock).mockResolvedValue(undefined);
      await act(async () => {
        render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
        const planoAnualBtn = screen.queryByText(/Plano Anual/i);
        if (planoAnualBtn) {
          fireEvent.click(planoAnualBtn);
        }
        const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
        // eslint-disable-next-line no-console
        console.log('DEBUG: Botões Começar Agora encontrados:', comecarAgoraBtns.length);
        fireEvent.click(comecarAgoraBtns[0]);
      });
      await waitFor(() => expect(alertMock).toHaveBeenCalled());
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
      );
    });

    it('deve exibir erro se não houver link de pagamento (null)', async () => {
      (apiService.createPaymentPreference as jest.Mock).mockResolvedValue(null);
      await act(async () => {
        render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
        const planoAnualBtn = screen.queryByText(/Plano Anual/i);
        if (planoAnualBtn) {
          fireEvent.click(planoAnualBtn);
        }
        const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
        // eslint-disable-next-line no-console
        console.log('DEBUG: Botões Começar Agora encontrados:', comecarAgoraBtns.length);
        fireEvent.click(comecarAgoraBtns[0]);
      });
      await waitFor(() => expect(alertMock).toHaveBeenCalled());
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
      );
    });

    it('deve exibir erro se não houver link de pagamento (objeto vazio)', async () => {
      (apiService.createPaymentPreference as jest.Mock).mockResolvedValue({});
      await act(async () => {
        render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
        const planoAnualBtn = screen.queryByText(/Plano Anual/i);
        if (planoAnualBtn) {
          fireEvent.click(planoAnualBtn);
        }
        const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
        // eslint-disable-next-line no-console
        console.log('DEBUG: Botões Começar Agora encontrados:', comecarAgoraBtns.length);
        fireEvent.click(comecarAgoraBtns[0]);
      });
      await waitFor(() => expect(alertMock).toHaveBeenCalled());
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
      );
    });
});





