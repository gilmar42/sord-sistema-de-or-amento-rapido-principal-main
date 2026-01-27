
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './components/MainLayout';
import type { View } from './components/MainLayout';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/LandingPage';
import SubscriptionModal from './components/SubscriptionModal';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { currentUser, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [nextView, setNextView] = useState<View>('home');
  const [showLandingAfterLogin, setShowLandingAfterLogin] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failure' | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment') as 'success' | 'pending' | 'failure' | null;
    if (payment) {
      setPaymentStatus(payment);
      if (payment === 'success') {
        setShowAuth(true);
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isLoading) return null;
  if (!currentUser) {
    return (
      <>
        {showAuth ? (
          <AuthPage paymentApproved={paymentStatus === 'success'} />
        ) : (
          <LandingPage
            onGetStarted={() => {
              setNextView('calculator');
              setShowAuth(true);
            }}
            paymentStatus={paymentStatus}
          />
        )}
        <button
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50"
          onClick={() => setShowSubscription(true)}
        >
          Assinar SaaS
        </button>
        <SubscriptionModal open={showSubscription} onClose={() => setShowSubscription(false)} />
      </>
    );
  }

  // Usuário autenticado: exibir landing de boas-vindas antes de entrar no layout
  if (showLandingAfterLogin) {
    return (
      <LandingPage
        onGetStarted={() => {
          setNextView('calculator');
          setShowLandingAfterLogin(false);
        }}
        paymentStatus={paymentStatus}
      />
    );
  }

  return (
    <DataProvider>
      <MainLayout initialView={nextView} />
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </DataProvider>
  );
};

export default AppContent;
