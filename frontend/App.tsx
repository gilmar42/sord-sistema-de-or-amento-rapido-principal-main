
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './components/MainLayout';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { AuthPage } from './components/auth/AuthPage';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <DataProvider>
      <MainLayout />
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </DataProvider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
