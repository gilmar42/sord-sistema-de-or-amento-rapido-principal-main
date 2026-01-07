/**
 * Payment Service - Integração com Mercado Pago
 * Responsável por processar pagamentos, webhooks e consultar status
 */

import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../db/models.js';
import logger from '../utils/logger.js';
import MercadoPagoService from './mercadoPagoService.js';

interface PaymentRequest {
  orderId: string;
  amount: number;
  email: string;
  description: string;
  tenantId: string;
  metadata?: any;
}

interface ProcessPaymentRequest extends PaymentRequest {
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
  ipAddress?: string;
}

interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class PaymentService {
  /**
   * Processa um pagamento com o Mercado Pago
   */
  async processPayment(req: ProcessPaymentRequest): Promise<PaymentResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`[Payment] Processando pagamento ${req.orderId}`, {
        amount: req.amount,
        email: req.email,
        tenantId: req.tenantId,
      });

      // Validar entrada
      this.validatePaymentRequest(req);

      // Criar simulação de resposta do Mercado Pago
      // Nota: Em produção, aqui você chamaria a API real do MP
      const mpResponse = await this.createMercadoPagoPayment(req);

      // Salvar no banco de dados
      const paymentDoc = new Payment({
        paymentId: mpResponse.id,
        orderId: req.orderId,
        status: mpResponse.status,
        amount: req.amount,
        description: req.description,
        paymentMethod: req.paymentMethodId,
        installments: req.installments,
        payer: {
          email: req.email,
        },
        tenantId: req.tenantId,
        metadata: {
          mpId: mpResponse.id,
          mpStatus: mpResponse.status,
          mpStatusDetail: mpResponse.status_detail,
          processedAt: new Date(),
          ipAddress: req.ipAddress,
        },
      });

      await paymentDoc.save();
      const duration = Date.now() - startTime;

      logger.info(`[Payment] Pagamento processado com sucesso`, {
        orderId: req.orderId,
        paymentId: mpResponse.id,
        status: mpResponse.status,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        data: {
          id: mpResponse.id,
          status: mpResponse.status,
          status_detail: mpResponse.status_detail,
          amount: req.amount,
          description: req.description,
          orderId: req.orderId,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`[Payment] Erro ao processar pagamento`, {
        orderId: req.orderId,
        error: error.message,
        duration: `${duration}ms`,
      });

      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Consulta o status de um pagamento
   */
  async getPaymentStatus(paymentId: string, tenantId: string): Promise<any> {
    try {
      logger.info(`[Payment] Consultando status do pagamento ${paymentId}`);

      const payment = await Payment.findOne({
        paymentId,
        tenantId,
      });

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      return {
        success: true,
        data: {
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          status: payment.status,
          amount: payment.amount,
          description: payment.description,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
      };
    } catch (error: any) {
      logger.error(`[Payment] Erro ao consultar pagamento`, {
        paymentId,
        error: error.message,
      });

      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Lista pagamentos com filtros
   */
  async listPayments(
    tenantId: string,
    filters?: { status?: string; limit?: number; offset?: number }
  ): Promise<any> {
    try {
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      const query: any = { tenantId };

      if (filters?.status) {
        query.status = filters.status;
      }

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset),
        Payment.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          payments: payments.map(p => ({
            paymentId: p.paymentId,
            orderId: p.orderId,
            status: p.status,
            amount: p.amount,
            description: p.description,
            createdAt: p.createdAt,
          })),
          pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error(`[Payment] Erro ao listar pagamentos`, {
        error: error.message,
      });

      return {
        success: false,
        error: 'Erro ao listar pagamentos',
      };
    }
  }

  /**
   * Processa webhook do Mercado Pago
   */
  async handleWebhook(mpData: any): Promise<void> {
    try {
      logger.info(`[Webhook] Recebido evento do MP: ${mpData.type}`);

      if (mpData.type === 'payment') {
        const paymentId = mpData.data?.id;

        if (!paymentId) {
          logger.warn('[Webhook] Webhook sem paymentId');
          return;
        }

        // Buscar pagamento local
        const payment = await Payment.findOne({ paymentId });

        if (!payment) {
          logger.warn(`[Webhook] Pagamento não encontrado: ${paymentId}`);
          return;
        }

        // Atualizar status baseado no webhook
        const newStatus = this.mapMercadoPagoStatus(mpData.data?.status);
        payment.status = newStatus as 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
        payment.metadata = {
          ...payment.metadata,
          lastWebhook: mpData,
          webhookReceivedAt: new Date(),
        };

        await payment.save();

        logger.info(`[Webhook] Pagamento atualizado`, {
          paymentId,
          newStatus,
          orderId: payment.orderId,
        });
      }
    } catch (error: any) {
      logger.error(`[Webhook] Erro ao processar webhook`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Simula chamada ao Mercado Pago (em produção, integrar SDK real)
   */
  private async createMercadoPagoPayment(req: ProcessPaymentRequest): Promise<any> {
    // Em produção (sem sandbox), usar SDK real do Mercado Pago
    if (process.env.NODE_ENV === 'production' && !process.env.USE_MP_SANDBOX) {
      const result = await MercadoPagoService.processPayment({
        orderId: req.orderId,
        amount: req.amount,
        token: req.token,
        paymentMethodId: req.paymentMethodId,
        installments: req.installments,
        email: req.email,
        description: req.description,
        issuerId: req.issuerId,
        metadata: { ipAddress: req.ipAddress },
        tenantId: req.tenantId,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Falha ao processar pagamento no Mercado Pago');
      }

      return {
        id: result.data.id,
        status: result.data.status,
        status_detail: result.data.status_detail,
        transaction_amount: result.data.amount,
        description: result.data.description,
        created_at: new Date().toISOString(),
      };
    }

    // Em desenvolvimento/staging, retornar resposta simulada
    const isTest = req.email.includes('test');
    const status = isTest ? 'approved' : 'pending';

    return {
      id: uuidv4(),
      status,
      status_detail: 'approved',
      transaction_amount: req.amount,
      description: req.description,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Mapear status do Mercado Pago para nosso sistema
   */
  private mapMercadoPagoStatus(mpStatus: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'pending',
      approved: 'approved',
      authorized: 'approved',
      in_process: 'pending',
      in_mediation: 'pending',
      rejected: 'rejected',
      cancelled: 'cancelled',
      refunded: 'refunded',
      charged_back: 'rejected',
    };

    return statusMap[mpStatus] || 'pending';
  }

  /**
   * Validar request de pagamento
   */
  private validatePaymentRequest(req: ProcessPaymentRequest): void {
    const errors: string[] = [];

    if (!req.orderId?.trim()) errors.push('orderId é obrigatório');
    if (!req.amount || req.amount <= 0) errors.push('amount deve ser maior que zero');
    if (!req.token?.trim()) errors.push('token é obrigatório');
    if (!req.paymentMethodId?.trim()) errors.push('paymentMethodId é obrigatório');
    if (!req.email?.trim()) errors.push('email é obrigatório');
    if (!req.description?.trim()) errors.push('description é obrigatória');
    if (req.installments < 1) errors.push('installments deve ser no mínimo 1');

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      errors.push('email inválido');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Mapear erros para mensagens amigáveis
   */
  private getErrorMessage(error: any): string {
    const message = error.message || 'Erro ao processar pagamento';

    const errorMap: { [key: string]: string } = {
      'invalid_token': 'Token de pagamento inválido. Por favor, tente novamente.',
      'card_disabled': 'Cartão desabilitado. Use outro cartão.',
      'insufficient_amount': 'Saldo insuficiente.',
      'timeout': 'Tempo de processamento excedido. Tente novamente.',
      'network': 'Erro de conexão. Verifique sua internet.',
      'not found': 'Pagamento não encontrado',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }

    return message;
  }
}

export default new PaymentService();
