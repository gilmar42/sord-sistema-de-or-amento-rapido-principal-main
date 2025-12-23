import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

interface QuoteWithPaymentProps {
  quoteName: string;
  quoteTotal: number;
  quoteDescription: string;
}

/**
 * Componente que integra o calculador de orçamento com pagamento
 * Exemplo: Material -> Cálculo do Orçamento -> Pagamento
 */
export const QuoteWithPayment: React.FC<QuoteWithPaymentProps> = ({
  quoteName,
  quoteTotal,
  quoteDescription,
}) => {
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePaymentSuccess = (data: any) => {
    setPaymentStatus('completed');
    setPaymentData(data);
    console.log('Pagamento bem-sucedido:', data);
    
    // Aqui você pode:
    // 1. Salvar no seu banco de dados
    // 2. Enviar email de confirmação
    // 3. Gerar PDF do recibo
    // 4. Redirecionar para página de sucesso
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed');
    console.error('Erro no pagamento:', error);
  };

  if (paymentStep) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900">Resumo do Orçamento</h3>
          <p className="text-sm text-blue-800 mt-2">
            <strong>Orçamento:</strong> {quoteName}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Descrição:</strong> {quoteDescription}
          </p>
          <p className="text-xl font-bold text-blue-900 mt-4">
            Total: R$ {quoteTotal.toFixed(2)}
          </p>
          <button
            onClick={() => setPaymentStep(false)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ← Voltar
          </button>
        </div>

        <PaymentForm
          amount={quoteTotal}
          description={quoteDescription}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {paymentStatus === 'completed' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold text-green-900">✅ Pagamento Confirmado!</h4>
            <p className="text-sm text-green-800 mt-2">
              ID do Pagamento: {paymentData?.id}
            </p>
            <p className="text-sm text-green-800">
              Status: {paymentData?.status}
            </p>
            <p className="text-sm text-green-800 mt-4">
              Um email de confirmação foi enviado para seu endereço registrado.
            </p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="text-lg font-semibold text-red-900">❌ Erro no Pagamento</h4>
            <p className="text-sm text-red-800 mt-2">
              Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{quoteName}</h3>
          <p className="text-gray-600">{quoteDescription}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total do Orçamento:</span>
            <span className="text-2xl font-bold text-blue-600">R$ {quoteTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => setPaymentStep(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition"
        >
          Ir para Pagamento
        </button>

        <button
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded transition"
        >
          Salvar Orçamento para Depois
        </button>
      </div>
    </div>
  );
};

export default QuoteWithPayment;
