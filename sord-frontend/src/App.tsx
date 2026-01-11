import React from 'react';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthPage } from './components/auth/AuthPage';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './components/LandingPage';
import { CheckoutReturn } from './components/CheckoutReturn';

type AppPage = 'landing' | 'auth' | 'app' | 'checkout-success' | 'checkout-error' | 'checkout-pending';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<AppPage>('landing');

  // Detectar URLs de retorno do Mercado Pago
  React.useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/checkout/sucesso') {
      setCurrentPage('checkout-success');
    } else if (path === '/checkout/erro') {
      setCurrentPage('checkout-error');
    } else if (path === '/checkout/pendente') {
      setCurrentPage('checkout-pending');
    }
  }, []);

  /**
   * Fluxo da Aplicação:
   * 1. Landing Page (início)
   * 2. Clica "Começar" → vai DIRETO para Mercado Pago Checkout Pro
   * 3. Mercado Pago processa pagamento
   * 4. Redireciona para /checkout/sucesso, /checkout/erro ou /checkout/pendente
   * 5. Checkout Return mostra status e redireciona para Auth
   * 6. Auth Page (Login/Registro)
   * 7. App/Dashboard
   */

  // Se usuário está logado, sempre mostra o app
  if (currentUser) {
    return (
      <DataProvider>
        <MainLayout />
      </DataProvider>
    );
  }

  // Se não está logado, renderiza as páginas de entrada conforme currentPage
  switch (currentPage) {
    case 'landing':
      return (
        <LandingPage
          onNavigateToAuth={() => {
            // Ao clicar "Começar", vai DIRETO para Mercado Pago
            goToMercadoPago();
          }}
        />
      );

    case 'checkout-success':
      return (
        <CheckoutReturn
          status="success"
          onContinue={() => setCurrentPage('auth')}
        />
      );

    case 'checkout-error':
      return (
        <CheckoutReturn
          status="error"
          onContinue={() => setCurrentPage('landing')}
        />
      );

    case 'checkout-pending':
      return (
        <CheckoutReturn
          status="pending"
          onContinue={() => setCurrentPage('auth')}
        />
      );

    case 'auth':
      return <AuthPage />;

    default:
      return <LandingPage onNavigateToAuth={() => goToMercadoPago()} />;
  }

  // Função para criar checkout e redirecionar para Mercado Pago
  function goToMercadoPago() {
    const orderId = `order_${Date.now()}`;
    
    fetch('http://localhost:3001/api/payments/public/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: 100.0,
        description: 'Acesso ao SORD - Sistema de Orçamento Rápido',
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.initPoint) {
          // Redireciona DIRETO para Mercado Pago
          window.location.href = data.data.initPoint;
        } else {
          console.error('Erro:', data.error);
          alert('Erro ao iniciar pagamento. Tente novamente.');
        }
      })
      .catch(err => {
        console.error('Erro:', err);
        alert('Erro ao conectar com o servidor.');
      });
  }
};

export default App;
