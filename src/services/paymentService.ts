// Serviço para comunicação com a API de pagamentos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  token: string;
  paymentMethodId: string;
  installments: number;
  email: string;
  description: string;
  issuerId?: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  payment?: {
    id: number;
    status: string;
    status_detail: string;
    amount: number;
    description: string;
  };
  error?: string;
}

export async function createPayment(
  payload: CreatePaymentRequest
): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao processar pagamento');
  }

  return response.json();
}

export async function getPaymentStatus(orderId: string) {
  const response = await fetch(`${API_URL}/payments/${orderId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar status do pagamento');
  }

  return response.json();
}

export async function listPayments(status?: string, limit?: number) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (limit) params.append('limit', String(limit));

  const response = await fetch(`${API_URL}/payments?${params}`);

  if (!response.ok) {
    throw new Error('Erro ao listar pagamentos');
  }

  return response.json();
}
