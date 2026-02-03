// Mock para paymentService - evita erros com import.meta.env em testes Jest
export async function getPlans() {
  return {
    monthly: { id: 'monthly', name: 'Monthly', price: 29.9 },
    annual: { id: 'annual', name: 'Annual', price: 299 },
  };
}

export async function createSubscription({ email, token, planType }: { email: string; token: string; planType: 'monthly' | 'annual' }) {
  return { success: true, subscriptionId: 'mock-subscription-id', email, planType };
}

export async function createPixPayment({ email, planType }: { email: string; planType: 'monthly' | 'annual' }) {
  return {
    paymentId: 'mock-payment-id',
    status: 'pending',
    qrCode: 'mock-qr-code',
    qrCodeBase64: 'data:image/png;base64,mock',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

export async function getPixPaymentStatus(paymentId: string) {
  return {
    paymentId,
    status: 'pending',
    detail: null,
  };
}

export async function getSubscription(id: string) {
  return {
    id,
    status: 'active',
    planType: 'monthly',
    email: 'test@example.com',
  };
}
