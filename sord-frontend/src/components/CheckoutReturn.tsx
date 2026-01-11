import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from './Icons';

interface CheckoutReturnProps {
  status: 'success' | 'error' | 'pending';
  onContinue: () => void;
}

export const CheckoutReturn: React.FC<CheckoutReturnProps> = ({ status, onContinue }) => {
  useEffect(() => {
    // Auto-redirect após 3 segundos
    const timer = setTimeout(onContinue, 3000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Pagamento Realizado!</h1>
          <p className="text-xl text-textSecondary mb-8">
            Seu pagamento foi processado com sucesso. Redirecionando para autenticação...
          </p>
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <XMarkIcon className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Pagamento Falhou</h1>
          <p className="text-xl text-textSecondary mb-8">
            Ocorreu um erro ao processar seu pagamento. Redirecionando...
          </p>
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-80 transition"
          >
            Voltar e Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // pending
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-4xl font-bold mb-4">Pagamento Pendente</h1>
        <p className="text-xl text-textSecondary mb-8">
          Seu pagamento está sendo processado. Por favor, aguarde...
        </p>
      </div>
    </div>
  );
};
