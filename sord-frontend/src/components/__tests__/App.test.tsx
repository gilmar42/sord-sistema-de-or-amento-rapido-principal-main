import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import * as AuthContext from '../../context/AuthContext';

// Mock the child components
jest.mock('../LandingPage', () => ({
  LandingPage: ({ onNavigateToAuth }: any) => (
    <div data-testid="landing-page">
      <button onClick={onNavigateToAuth}>Go to Auth</button>
    </div>
  ),
}));

jest.mock('../PaymentPage', () => ({
  PaymentPage: ({ onPaymentSuccess, onPaymentError }: any) => (
    <div data-testid="payment-page">
      <button onClick={onPaymentSuccess}>Payment Success</button>
      <button onClick={() => onPaymentError('Test Error')}>Payment Error</button>
    </div>
  ),
}));

jest.mock('../auth/AuthPage', () => ({
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>,
}));

jest.mock('../MainLayout', () => ({
  MainLayout: () => <div data-testid="main-layout">Main Layout</div>,
}));

jest.mock('../../context/DataContext', () => ({
  DataProvider: ({ children }: any) => <>{children}</>,
}));

describe('App Navigation Flow', () => {
  const mockUseAuth = {
    currentUser: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue(mockUseAuth as any);
  });

  it('should render landing page by default', () => {
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('should navigate to payment page when user clicks "Go to Auth"', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<App />);
    
    const goToAuthButton = screen.getByText('Go to Auth');
    await act(async () => {
      await user.click(goToAuthButton);
    });
    
    expect(screen.getByTestId('payment-page')).toBeInTheDocument();
  });

  it('should navigate to auth page after successful payment', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<App />);
    
    // Go from landing to payment
    const goToAuthButton = screen.getByText('Go to Auth');
    await act(async () => {
      await user.click(goToAuthButton);
    });
    
    // Complete payment
    const paymentSuccessButton = screen.getByText('Payment Success');
    await act(async () => {
      await user.click(paymentSuccessButton);
    });
    
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it.skip('should return to landing page after payment error', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();
    
    const { rerender } = render(<App />);
    
    // Go from landing to payment
    const goToAuthButton = screen.getByText('Go to Auth');
    await act(async () => {
      await user.click(goToAuthButton);
    });
    
    // Payment fails
    const paymentErrorButton = screen.getByText('Payment Error');
    await act(async () => {
      await user.click(paymentErrorButton);
    });
    
    // Fast-forward time to trigger redirect
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    
    // Should be back at landing page
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should show main layout when user is authenticated', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      ...mockUseAuth,
      currentUser: { id: '123', email: 'test@example.com' },
    } as any);
    
    render(<App />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});
