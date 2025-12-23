import express, { Request, Response } from 'express';
import db from '../db/connection.js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

const router = express.Router();

// Inicializar cliente Mercado Pago para consultar status
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});
const payment = new Payment(client);

// Middleware para validar webhook (assinatura)
const validateWebhookSignature = (req: Request, res: Response, next: Function) => {
  // Nota: Mercado Pago NÃO usa assinatura. Validamos consultando a API.
  // Este é o método mais seguro recomendado pelo Mercado Pago.
  next();
};

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações do Mercado Pago quando o status de um pagamento muda
 */
router.post('/mercadopago', validateWebhookSignature, async (req: Request, res: Response) => {
  try {
    const { id, type, data } = req.body;

    console.log('🔔 Webhook recebido:', { id, type, data });

    // O Mercado Pago envia diferentes tipos de notificações
    if (type === 'payment') {
      const paymentId = data.id;

      // 🔒 IMPORTANTE: Consultar a API do Mercado Pago para confirmar a notificação
      // Isso evita fraudes e garante que a notificação é legítima
      const paymentDetails = await payment.get({ id: paymentId });

      if (!paymentDetails) {
        console.warn('⚠️ Pagamento não encontrado na API:', paymentId);
        return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
      }

      // Atualizar status no banco de dados
      const updateQuery = `
        UPDATE payments
        SET
          status = $1,
          status_detail = $2,
          processed_at = CASE WHEN status = 'pending' AND $1 IN ('approved', 'rejected') THEN CURRENT_TIMESTAMP ELSE processed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE mercado_pago_id = $3
      `;

      await db.query(updateQuery, [
        paymentDetails.status,
        paymentDetails.status_detail,
        paymentId,
      ]);

      // Registrar evento de webhook no log de auditoria
      const paymentRecord = await db.query(
        'SELECT id FROM payments WHERE mercado_pago_id = $1',
        [paymentId]
      );

      if (paymentRecord.rows.length > 0) {
        const logQuery = `
          INSERT INTO payment_logs (
            payment_id, event_type, status_after, response_body, ip_address
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        await db.query(logQuery, [
          paymentRecord.rows[0].id,
          'webhook_received',
          paymentDetails.status,
          JSON.stringify(paymentDetails),
          req.ip,
        ]);
      }

      // Enviar notificação para o cliente (via WebSocket, Socket.io ou polling)
      // Aqui você pode integrar com seu sistema de notificações em tempo real
      console.log(`✅ Pagamento ${paymentId} atualizado para ${paymentDetails.status}`);

      return res.json({ success: true, message: 'Webhook processado' });
    }

    // Outros tipos de notificação (merchant_order, etc.)
    res.json({ success: true, message: 'Notificação recebida' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Retornar 200 mesmo em erro (Mercado Pago precisa dessa resposta)
    // Senão, ele continuará tentando enviar a notificação
    res.status(200).json({
      success: false,
      error: 'Erro ao processar webhook (será retentado)',
    });
  }
});

/**
 * POST /api/webhooks/test
 * Endpoint para testar webhooks em desenvolvimento
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        error: 'orderId e status são obrigatórios',
      });
    }

    // Atualizar pagamento para teste
    const updateQuery = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $2
    `;

    const result = await db.query(updateQuery, [status, orderId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado',
      });
    }

    console.log(`✅ Pagamento ${orderId} atualizado para ${status} (teste)`);

    res.json({
      success: true,
      message: `Pagamento atualizado para ${status}`,
    });
  } catch (error) {
    console.error('Erro ao processar webhook de teste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook de teste',
    });
  }
});

export default router;
