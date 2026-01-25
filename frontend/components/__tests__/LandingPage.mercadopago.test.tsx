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
    let originalConsoleLog: typeof console.log;
  it('deve iniciar pagamento e redirecionar para Mercado Pago', async () => {
    jest.spyOn(apiService, 'createPaymentPreference').mockImplementation(async () => ({
      initPoint: 'https://mercadopago.com/redirect',
    }));

    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const planoAnualBtn = screen.getByText(/Plano Anual/i);
    fireEvent.click(planoAnualBtn);
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
    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
    fireEvent.click(comecarAgoraBtns[0]);
    // eslint-disable-next-line no-console
    setTimeout(() => {
      console.log('DEBUG: mockResolvedValue (undefined):', (apiService.createPaymentPreference as jest.Mock).mock.results);
    }, 0);
    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    // eslint-disable-next-line no-console
    console.log('DEBUG: alertMock calls (undefined):', alertMock.mock.calls);
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
    );
      console.log = originalConsoleLog;
  });

  it('deve exibir erro se não houver link de pagamento (null)', async () => {
    (apiService.createPaymentPreference as jest.Mock).mockResolvedValue(null);
    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
    fireEvent.click(comecarAgoraBtns[0]);
    // eslint-disable-next-line no-console
    setTimeout(() => {
      console.log('DEBUG: mockResolvedValue (null):', (apiService.createPaymentPreference as jest.Mock).mock.results);
    }, 0);
    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    // eslint-disable-next-line no-console
    console.log('DEBUG: alertMock calls (null):', alertMock.mock.calls);
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
    );
  });

  it('deve exibir erro se não houver link de pagamento (undefined)', async () => {
    (apiService.createPaymentPreference as jest.Mock).mockResolvedValue(undefined);
    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
    fireEvent.click(comecarAgoraBtns[0]);
    // eslint-disable-next-line no-console
    setTimeout(() => {
      console.log('DEBUG: mockResolvedValue (undefined):', (apiService.createPaymentPreference as jest.Mock).mock.results);
    }, 0);
    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    // eslint-disable-next-line no-console
    console.log('DEBUG: alertMock calls (undefined):', alertMock.mock.calls);
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
    );
  });

  it('deve exibir erro se não houver link de pagamento (null)', async () => {
    (apiService.createPaymentPreference as jest.Mock).mockResolvedValue(null);
    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
    fireEvent.click(comecarAgoraBtns[0]);
    // eslint-disable-next-line no-console
    setTimeout(() => {
      console.log('DEBUG: mockResolvedValue (null):', (apiService.createPaymentPreference as jest.Mock).mock.results);
    }, 0);
    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    // eslint-disable-next-line no-console
    console.log('DEBUG: alertMock calls (null):', alertMock.mock.calls);
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
    );
  });

  it('deve exibir erro se não houver link de pagamento', async () => {
    (apiService.createPaymentPreference as jest.Mock).mockResolvedValue({});
    render(<LandingPage onGetStarted={() => {}} paymentStatus={null} />);
    const comecarAgoraBtns = screen.getAllByRole('button', { name: /Começar Agora/i });
    fireEvent.click(comecarAgoraBtns[0]);
    // eslint-disable-next-line no-console
    setTimeout(() => {
      console.log('DEBUG: mockResolvedValue (empty object):', (apiService.createPaymentPreference as jest.Mock).mock.results);
    }, 0);
    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    // eslint-disable-next-line no-console
    console.log('DEBUG: alertMock calls:', alertMock.mock.calls);
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Não foi possível iniciar o pagamento|pagamento/i)
    );
  });
});





