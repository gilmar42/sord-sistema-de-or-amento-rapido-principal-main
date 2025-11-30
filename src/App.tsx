
import React from 'react';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthPage } from './components/auth/AuthPage';
import { MainLayout } from './components/MainLayout';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { toasts, removeToast } = useToast();

  if (!currentUser) {
    return (
      <>
        <AuthPage />
        <ToastContainer toasts={toasts} onCloseToast={removeToast} />
      </>
    );
  }

  // If user is logged in, wrap the main layout with the data provider
  // This ensures data is scoped to the logged-in user's tenant
  return (
    <DataProvider>
      <MainLayout />
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </DataProvider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
