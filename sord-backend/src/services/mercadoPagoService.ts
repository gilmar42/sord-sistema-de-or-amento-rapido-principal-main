import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

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
}

interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MercadoPagoService {
  async processPayment(req: PaymentRequest): Promise<PaymentResponse> {
    try {
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

      const requestOptions = { idempotencyKey };
      const result = await payment.create({ body, requestOptions });

      // Salvar pagamento no banco de dados
      const paymentData = {
        order_id: req.orderId,
        amount: req.amount,
        payment_method_id: req.paymentMethodId,
        payment_method_type: result.payment_method?.type,
        status: result.status,
        status_detail: result.status_detail,
        mercado_pago_id: result.id,
        payer_email: req.email,
        description: req.description,
        installments: req.installments,
        issuer_id: req.issuerId,
        card_last_four: result.card?.last_four_digits,
        metadata: JSON.stringify(result),
      };

      await this.savePayment(paymentData);

      // Log de auditoria
      await this.logPaymentEvent({
        payment_id: paymentData.order_id,
        event_type: 'payment_processed',
        status_after: result.status,
        request_body: JSON.stringify(body),
        response_body: JSON.stringify(result),
        ip_address: req.ipAddress,
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
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async savePayment(data: any) {
    const query = `
      INSERT INTO payments (
        order_id, amount, payment_method_id, payment_method_type,
        status, status_detail, mercado_pago_id, payer_email,
        description, installments, issuer_id, card_last_four, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      ON CONFLICT (order_id) DO UPDATE SET
        status = $5,
        updated_at = CURRENT_TIMESTAMP,
        mercado_pago_id = $7,
        metadata = $13
    `;

    await db.query(query, [
      data.order_id,
      data.amount,
      data.payment_method_id,
      data.payment_method_type,
      data.status,
      data.status_detail,
      data.mercado_pago_id,
      data.payer_email,
      data.description,
      data.installments,
      data.issuer_id,
      data.card_last_four,
      data.metadata,
    ]);
  }

  async logPaymentEvent(data: any) {
    const paymentIdResult = await db.query(
      'SELECT id FROM payments WHERE order_id = $1',
      [data.payment_id]
    );

    if (paymentIdResult.rows.length === 0) return;

    const query = `
      INSERT INTO payment_logs (
        payment_id, event_type, status_after, request_body, response_body, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await db.query(query, [
      paymentIdResult.rows[0].id,
      data.event_type,
      data.status_after,
      data.request_body,
      data.response_body,
      data.ip_address,
    ]);
  }

  async getPaymentStatus(paymentId: string) {
    try {
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
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new MercadoPagoService();
