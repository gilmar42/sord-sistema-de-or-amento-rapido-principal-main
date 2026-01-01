import React from 'react';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthPage } from './components/auth/AuthPage';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './components/LandingPage';
import { PaymentPage } from './components/PaymentPage';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [skipLanding, setSkipLanding] = React.useState<boolean>(false);
  const [showPayment, setShowPayment] = React.useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = React.useState<boolean>(() => {
    // Verificar se já pagou anteriormente
    return localStorage.getItem('payment_completed') === 'true';
  });

  // Gerenciar histórico do navegador
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      if (state?.page === 'landing') {
        setSkipLanding(false);
        setShowPayment(false);
      } else if (state?.page === 'payment') {
        setSkipLanding(true);
        setShowPayment(false);
      } else if (state?.page === 'auth') {
        setShowPayment(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Inicializar histórico
    if (!window.history.state) {
      window.history.replaceState({ page: 'landing' }, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fluxo: 1. Landing Page → 2. Payment → 3. Auth → 4. App

  // Se não está logado e não pulou landing, mostra landing
  if (!currentUser && !skipLanding && !showPayment) {
    return <LandingPage onNavigateToAuth={() => {
      setSkipLanding(true);
      window.history.pushState({ page: 'payment' }, '', window.location.href);
    }} />;
  }

  // Se clicou "Começar" mas não pagou, mostra página de pagamento
  if (!currentUser && skipLanding && !paymentCompleted) {
    return (
      <PaymentPage
        onPaymentSuccess={() => {
          setPaymentCompleted(true);
          localStorage.setItem('payment_completed', 'true');
          setShowPayment(true);
          window.history.pushState({ page: 'auth' }, '', window.location.href);
        }}
        onPaymentError={(error) => {
          console.error('Erro no pagamento:', error);
          // Permite tentar novamente sem voltar para landing
        }}
      />
    );
  }

  // Após pagamento bem-sucedido, mostra auth
  if (!currentUser && (paymentCompleted || showPayment)) {
    return <AuthPage />;
  }

  // Após login, mostra app
  if (currentUser) {
    return (
      <DataProvider>
        <MainLayout />
      </DataProvider>
    );
  }

  return null;
};

export default App;
