import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Payment as PaymentModel } from '../db/models.js';
import { v4 as uuidv4 } from 'uuid';

// Validação crítica: token deve existir em produção
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.error('❌ ERRO CRÍTICO: MERCADO_PAGO_ACCESS_TOKEN não configurado');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN é obrigatório em produção');
  }
}

// Avisar sobre token de teste em produção
if (process.env.NODE_ENV === 'production' && 
    process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-')) {
  console.warn('⚠️  AVISO: Token de TESTE detectado em ambiente de PRODUÇÃO');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

const payment = new Payment(client);

interface PaymentRequest {
  orderId: string;
  amount: number;
  token: string;
  paymentMethodId: string;
  installments: number;
  email: string;
  description: string;
  issuerId?: string;
  metadata?: any;
  ipAddress?: string;
  tenantId?: string;
}

interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MercadoPagoService {
  async processPayment(req: PaymentRequest): Promise<PaymentResponse> {
    const startTime = Date.now();
    
    try {
      // Validações de entrada
      this.validatePaymentRequest(req);

      const idempotencyKey = `${req.orderId}-${Date.now()}`;

      const body = {
        transaction_amount: req.amount,
        token: req.token,
        description: req.description,
        installments: req.installments,
        payment_method_id: req.paymentMethodId,
        payer: {
          email: req.email,
        },
        ...(req.issuerId && { issuer_id: parseInt(req.issuerId) }),
        metadata: {
          order_id: req.orderId,
          ...req.metadata,
        },
      };

      console.log(`[MercadoPago] Processando pagamento ${req.orderId} - R$ ${req.amount}`);

      const requestOptions = { idempotencyKey };
      const result = await payment.create({ body, requestOptions });

      const duration = Date.now() - startTime;
      console.log(`[MercadoPago] Pagamento ${req.orderId} processado em ${duration}ms - Status: ${result.status}`);

      // Salvar pagamento no MongoDB
      await this.savePayment({
        paymentId: result.id?.toString() || uuidv4(),
        orderId: req.orderId,
        status: result.status || 'pending',
        amount: req.amount,
        description: req.description,
        paymentMethod: req.paymentMethodId,
        installments: req.installments,
        payer: {
          email: req.email,
        },
        tenantId: req.tenantId,
        metadata: result,
      });

      return {
        success: true,
        data: {
          id: result.id,
          status: result.status,
          status_detail: result.status_detail,
          amount: result.transaction_amount,
          description: result.description,
        },
      };
    } catch (error: any) {
      console.error(`[MercadoPago] Erro ao processar pagamento ${req.orderId}:`, {
        message: error.message,
        cause: error.cause,
        status: error.status,
        orderId: req.orderId,
      });

      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private validatePaymentRequest(req: PaymentRequest): void {
    if (!req.orderId) throw new Error('orderId é obrigatório');
    if (!req.amount || req.amount <= 0) throw new Error('amount deve ser maior que zero');
    if (!req.token) throw new Error('token é obrigatório');
    if (!req.paymentMethodId) throw new Error('paymentMethodId é obrigatório');
    if (!req.email) throw new Error('email é obrigatório');
    if (!req.description) throw new Error('description é obrigatória');
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      throw new Error('email inválido');
    }
  }

  private getErrorMessage(error: any): string {
    // Mapear erros comuns do Mercado Pago
    if (error.message?.includes('invalid_token')) {
      return 'Token de pagamento inválido. Por favor, tente novamente.';
    }
    if (error.message?.includes('card_disabled')) {
      return 'Cartão desabilitado. Use outro cartão.';
    }
    if (error.message?.includes('insufficient_amount')) {
      return 'Saldo insuficiente.';
    }
    if (error.message?.includes('timeout')) {
      return 'Tempo de processamento excedido. Tente novamente.';
    }
    return error.message || 'Erro ao processar pagamento';
  }

  async savePayment(data: any) {
    try {
      const paymentDoc = new PaymentModel(data);
      await paymentDoc.save();
      console.log(`[MongoDB] Pagamento salvo: ${data.orderId}`);
    } catch (error: any) {
      console.error('[MongoDB] Erro ao salvar pagamento:', error.message);
      // Não lançar erro para não falhar o pagamento
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      console.log(`[MercadoPago] Consultando status do pagamento ${paymentId}`);
      const result = await payment.get({ id: paymentId });
      
      return {
        success: true,
        data: {
          id: result.id,
          status: result.status,
          status_detail: result.status_detail,
          amount: result.transaction_amount,
        },
      };
    } catch (error: any) {
      console.error(`[MercadoPago] Erro ao consultar pagamento ${paymentId}:`, error.message);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }
}

export default new MercadoPagoService();
