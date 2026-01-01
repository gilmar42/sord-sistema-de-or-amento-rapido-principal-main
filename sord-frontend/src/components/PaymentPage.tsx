import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, SparklesIcon } from './Icons';

interface PaymentPageProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

// Helper function to get environment variables safely
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || defaultValue;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

export const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess, onPaymentError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const VITE_API_URL = getEnvVar('VITE_API_URL', 'http://localhost:3001/api');
  const MP_PUBLIC_KEY = getEnvVar('VITE_MERCADO_PAGO_PUBLIC_KEY', 'TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX');

  useEffect(() => {
    // Carregar script do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        try {
          // SDK v2 usa instância em vez de setPublishableKey
          const mp = new window.MercadoPago(MP_PUBLIC_KEY, {
            locale: 'pt-BR'
          });
          (window as any).mpInstance = mp;
          setIsLoading(false);
        } catch (error) {
          console.error('Erro ao inicializar Mercado Pago:', error);
          setError('Erro ao inicializar sistema de pagamento.');
          setIsLoading(false);
        }
      }
    };
    script.onerror = () => {
      setError('Erro ao carregar Mercado Pago SDK. Tente novamente.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [MP_PUBLIC_KEY]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (!cardholderName || !email) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Criar token do cartão com Mercado Pago (em produção)
      // Para teste, vamos simular um pagamento bem-sucedido

      const orderId = `order_${Date.now()}`;
      const paymentData = {
        orderId,
        amount: 0.01, // Pagamento simbólico de teste
        email: email,
        description: 'Acesso ao SORD - Sistema de Orçamento Rápido',
        token: 'test_token', // Em produção: usar window.MercadoPago.createCardToken()
        paymentMethodId: 'visa',
        installments: 1,
      };

      // Chamar endpoint público de pagamento (sem autenticação)
      const response = await fetch(`${VITE_API_URL}/payments/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      setSuccessMessage('Pagamento processado com sucesso! Bem-vindo ao SORD.');
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar pagamento';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-lg font-semibold">Carregando sistema de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
              SORED
            </h1>
          </div>
          <p className="text-textSecondary">Ative sua conta para acessar o sistema</p>
        </div>

        {/* Card de Pagamento */}
        <div className="glass-card p-8 rounded-2xl">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">Erro no pagamento</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-4">
            {/* Nome do Titular */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-textPrimary">
                Nome do Titular
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="João da Silva"
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-textPrimary">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            {/* Informação de Teste */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Modo Teste:</strong> Use qualquer nome e email para ativar sua conta.
              </p>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processando...' : 'Ativar Conta (R$ 0,01)'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-textSecondary text-center mt-6">
            Seu pagamento é seguro e criptografado
          </p>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 p-4 bg-surface/40 rounded-lg text-center">
          <p className="text-sm text-textSecondary">
            Problemas no pagamento? <br />
            <a href="mailto:suporte@sored.com" className="text-primary hover:underline font-semibold">
              Entre em contato com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
