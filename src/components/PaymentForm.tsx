import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createPayment, PaymentResponse } from '../services/paymentService';

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

interface CardData {
  cardNumber: string;
  cardholderName: string;
  expirationDate: string;
  securityCode: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  onSuccess,
  onError,
}) => {
  const [mp, setMp] = useState<any>(null);
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    securityCode: '',
  });
  const [email, setEmail] = useState('');
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [token, setToken] = useState('');

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const loadMercadoPagoSDK = async () => {
      try {
        // Carregar script dinamicamente
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = () => {
          const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
          if (!publicKey) {
            setError('Chave pública do Mercado Pago não configurada');
            return;
          }
          const mercadoPago = new (window as any).MercadoPago(publicKey);
          setMp(mercadoPago);
        };
        document.head.appendChild(script);
      } catch (err) {
        setError('Erro ao carregar SDK do Mercado Pago');
        console.error(err);
      }
    };

    loadMercadoPagoSDK();
  }, []);

  // Buscar métodos de pagamento quando o SDK está carregado
  useEffect(() => {
    if (mp) {
      fetchPaymentMethods();
    }
  }, [mp]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (err) {
      console.error('Erro ao buscar métodos de pagamento:', err);
    }
  };

  const handleCardDataChange = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateToken = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expirationDate || !cardData.securityCode) {
        setError('Por favor, preencha todos os campos do cartão');
        setLoading(false);
        return;
      }

      if (!email) {
        setError('Por favor, preencha o email');
        setLoading(false);
        return;
      }

      if (!selectedPaymentMethod) {
        setError('Por favor, selecione um método de pagamento');
        setLoading(false);
        return;
      }

      // Gerar token usando o SDK do Mercado Pago
      const cardToken = await mp.createCardToken({
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expirationDate.split('/')[0],
        cardExpirationYear: `20${cardData.expirationDate.split('/')[1]}`,
        securityCode: cardData.securityCode,
      });

      setToken(cardToken.token);
      setError(null);

      // Agora processar o pagamento
      await handleSubmit(cardToken.token);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar token do cartão');
      setLoading(false);
    }
  };

  const handleSubmit = async (cardToken: string) => {
    try {
      setError(null);

      const orderId = uuidv4();

      const response = await createPayment({
        orderId,
        amount,
        token: cardToken,
        paymentMethodId: selectedPaymentMethod,
        installments,
        email,
        description,
      });

      if (response.success && response.payment) {
        onSuccess?.(response.payment);
      } else {
        const errorMessage = response.error || 'Erro ao processar pagamento';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6">Formulário de Pagamento</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="seu@email.com"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
        <select
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          disabled={loading}
        >
          <option value="">Selecione um método</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Número do Cartão</label>
        <input
          type="text"
          value={cardData.cardNumber}
          onChange={(e) => handleCardDataChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="1234 5678 9012 3456"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nome do Titular</label>
        <input
          type="text"
          value={cardData.cardholderName}
          onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="Seu Nome Completo"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Validade (MM/AA)</label>
          <input
            type="text"
            value={cardData.expirationDate}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                let formatted = value;
                if (value.length >= 2) {
                  formatted = value.slice(0, 2) + '/' + value.slice(2);
                }
                handleCardDataChange('expirationDate', formatted);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="MM/AA"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CVV</label>
          <input
            type="text"
            value={cardData.securityCode}
            onChange={(e) => handleCardDataChange('securityCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="123"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Parcelamento</label>
        <select
          value={installments}
          onChange={(e) => setInstallments(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          disabled={loading}
        >
          {[1, 2, 3, 4, 5, 6, 12].map((num) => (
            <option key={num} value={num}>
              {num}x de R$ {(amount / num).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="font-semibold text-lg">Total: R$ {amount.toFixed(2)}</p>
      </div>

      <button
        onClick={handleGenerateToken}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
      >
        {loading ? 'Processando...' : 'Pagar'}
      </button>

      {token && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          ✅ Pagamento processado com sucesso!
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
