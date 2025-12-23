# 💡 Exemplos de Integração - PaymentForm

Aqui estão exemplos práticos de como integrar o componente `PaymentForm` em diferentes contextos.

## 1️⃣ Exemplo Básico

```tsx
import React from 'react';
import PaymentForm from './components/PaymentForm';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
      
      <PaymentForm
        amount={250.50}
        description="Orçamento de Materiais de Construção"
        onSuccess={(payment) => {
          console.log('Pagamento aprovado:', payment);
          alert('Pagamento realizado com sucesso!');
        }}
        onError={(error) => {
          console.error('Erro:', error);
          alert('Erro ao processar pagamento: ' + error);
        }}
      />
    </div>
  );
}
```

---

## 2️⃣ Integração com QuoteCalculator

```tsx
import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';

interface Quote {
  id: string;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function QuoteCheckout() {
  const [quote, setQuote] = useState<Quote>({
    id: 'orcamento-001',
    total: 1250.00,
    items: [
      { description: 'Cimento', quantity: 10, unitPrice: 25.00 },
      { description: 'Areia', quantity: 5, unitPrice: 50.00 },
    ],
  });

  const [paidQuotes, setPaidQuotes] = useState<string[]>([]);

  const handlePaymentSuccess = async (paymentData: any) => {
    // Marcar orçamento como pago
    setPaidQuotes([...paidQuotes, quote.id]);

    // Enviar para back-end para salvar
    try {
      const response = await fetch('/api/quotes/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          paymentId: paymentData.id,
          status: paymentData.status,
        }),
      });

      if (response.ok) {
        console.log('Orçamento marcado como pago');
        // Redirecionar ou atualizar UI
      }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Resumo do Orçamento */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Resumo do Orçamento</h2>
        <div className="space-y-4">
          {quote.items.map((item, index) => (
            <div key={index} className="flex justify-between pb-2 border-b">
              <span>{item.description} (x{item.quantity})</span>
              <span>R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-xl font-bold pt-4">
            <span>Total:</span>
            <span className="text-blue-600">R$ {quote.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formulário de Pagamento */}
      <PaymentForm
        amount={quote.total}
        description={`Orçamento ${quote.id}`}
        onSuccess={handlePaymentSuccess}
        onError={(error) => console.error('Erro:', error)}
      />
    </div>
  );
}
```

---

## 3️⃣ Modal de Pagamento

```tsx
import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  description: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function PaymentModal({
  isOpen,
  amount,
  description,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Pagamento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <PaymentForm
          amount={amount}
          description={description}
          onSuccess={(data) => {
            onSuccess(data);
            onClose();
          }}
          onError={(error) => {
            console.error('Erro no pagamento:', error);
          }}
        />
      </div>
    </div>
  );
}

// Uso:
export function QuoteList() {
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    amount: 0,
    description: '',
  });

  const handlePayClick = (amount: number, description: string) => {
    setPaymentModal({ isOpen: true, amount, description });
  };

  return (
    <>
      <button onClick={() => handlePayClick(100, 'Orçamento 001')}>
        Pagar Orçamento
      </button>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        amount={paymentModal.amount}
        description={paymentModal.description}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        onSuccess={(data) => console.log('✅', data)}
      />
    </>
  );
}
```

---

## 4️⃣ Com Notificações em Tempo Real

```tsx
import React, { useState, useEffect } from 'react';
import PaymentForm from './components/PaymentForm';
import { getPaymentStatus } from '../services/paymentService';

interface PaymentTrackerProps {
  orderId: string;
  amount: number;
  description: string;
}

export default function PaymentTracker({
  orderId,
  amount,
  description,
}: PaymentTrackerProps) {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Polling para verificar status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await getPaymentStatus(orderId);
        if (response.success) {
          setPaymentStatus(response.payment.status);
          setLastChecked(new Date());
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="space-y-6">
      {/* Status Atual */}
      <div className={`p-4 rounded-lg ${
        paymentStatus === 'approved'
          ? 'bg-green-100 border border-green-400'
          : paymentStatus === 'rejected'
          ? 'bg-red-100 border border-red-400'
          : 'bg-yellow-100 border border-yellow-400'
      }`}>
        <p className="font-semibold">
          Status: <span className="uppercase">{paymentStatus}</span>
        </p>
        {lastChecked && (
          <p className="text-sm text-gray-600 mt-2">
            Última verificação: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Formulário */}
      {paymentStatus === 'pending' && (
        <PaymentForm
          amount={amount}
          description={description}
          onSuccess={(data) => {
            setPaymentStatus(data.status);
          }}
          onError={(error) => console.error(error)}
        />
      )}

      {/* Confirmação */}
      {paymentStatus === 'approved' && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <h3 className="text-2xl font-bold text-green-900 mb-2">✅ Pagamento Confirmado!</h3>
          <p className="text-green-800 mb-4">
            Obrigado por sua compra. Um email de confirmação foi enviado.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
            Baixar Recibo
          </button>
        </div>
      )}

      {paymentStatus === 'rejected' && (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-2xl font-bold text-red-900 mb-2">❌ Pagamento Recusado</h3>
          <p className="text-red-800 mb-4">
            Ocorreu um problema ao processar seu pagamento. Tente novamente com outro cartão.
          </p>
          <button onClick={() => setPaymentStatus('pending')} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded">
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 5️⃣ Com Validação de Cupom/Desconto

```tsx
import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';

interface CheckoutWithCouponProps {
  baseAmount: number;
}

export default function CheckoutWithCoupon({ baseAmount }: CheckoutWithCouponProps) {
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(baseAmount);

  const applyCoupon = async () => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon }),
      });

      const data = await response.json();
      if (data.success) {
        const discountValue = baseAmount * (data.percentage / 100);
        setDiscount(discountValue);
        setFinalAmount(baseAmount - discountValue);
      } else {
        alert('Cupom inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Resumo do Valor */}
      <div className="bg-gray-50 p-4 rounded mb-6">
        <div className="flex justify-between mb-2">
          <span>Valor Base:</span>
          <span>R$ {baseAmount.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>Desconto:</span>
            <span>-R$ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>R$ {finalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Campo de Cupom */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Cupom de Desconto (Opcional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Digite seu cupom"
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={applyCoupon}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Formulário de Pagamento */}
      <PaymentForm
        amount={finalAmount}
        description="Compra com cupom aplicado"
        onSuccess={(payment) => console.log('Pagamento realizado:', payment)}
        onError={(error) => console.error('Erro:', error)}
      />
    </div>
  );
}
```

---

## 6️⃣ Com Salvamento de Cartão

```tsx
import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';

interface SavedPaymentMethod {
  id: string;
  lastFour: string;
  type: string;
}

export default function CheckoutWithSavedCards() {
  const [savedCards, setSavedCards] = useState<SavedPaymentMethod[]>([
    { id: '1', lastFour: '1111', type: 'visa' },
  ]);
  const [useNewCard, setUseNewCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(savedCards[0].id);

  return (
    <div className="max-w-2xl mx-auto">
      {!useNewCard && savedCards.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Cartões Salvos</h3>
          <div className="space-y-2">
            {savedCards.map((card) => (
              <label key={card.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedCard === card.id}
                  onChange={() => setSelectedCard(card.id)}
                  className="mr-3"
                />
                <span className="flex-1">
                  {card.type.toUpperCase()} final em {card.lastFour}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => setUseNewCard(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            + Usar outro cartão
          </button>
        </div>
      )}

      {useNewCard && (
        <>
          <button
            onClick={() => setUseNewCard(false)}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Voltar
          </button>

          <PaymentForm
            amount={100}
            description="Compra SORD"
            onSuccess={(payment) => {
              console.log('Novo cartão adicionado');
              // Salvar novo cartão na lista
            }}
            onError={(error) => console.error(error)}
          />
        </>
      )}
    </div>
  );
}
```

---

## 🚀 Dicas Práticas

1. **Sempre Validar** - Validar email e dados antes de enviar
2. **Feedback do Usuário** - Mostrar loading, sucesso e erro
3. **Testes** - Use cartões de teste do Mercado Pago
4. **Segurança** - Nunca exponha Access Token no front-end
5. **UX** - Permitir parcelamento, salvamento de cartão
6. **Suporte** - Mostrar códigos de erro úteis ao usuário

---

**Pronto para integrar!** ✨
