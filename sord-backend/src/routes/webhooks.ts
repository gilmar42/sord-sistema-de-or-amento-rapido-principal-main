/**
 * Webhook Routes
 * Processa eventos do Mercado Pago e outros serviços de pagamento
 */

import express, { Request, Response } from 'express';
import paymentService from '../services/paymentService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações do Mercado Pago
 */
router.post('/mercadopago', async (req: Request, res: Response) => {
  try {
    const { id, type, data } = req.body;

    logger.info('Webhook recebido do Mercado Pago', {
      id,
      type,
      dataId: data?.id,
    });

    // Validar que é um evento de pagamento
    if (type === 'payment' && data?.id) {
      try {
        await paymentService.handleWebhook({
          type: 'payment',
          data: {
            id: data.id,
            status: data.status,
          },
        });

        logger.success('Webhook processado com sucesso', {
          paymentId: data.id,
          status: data.status,
        });
      } catch (error: any) {
        logger.error('Erro ao processar webhook', {
          error: error.message,
          paymentId: data.id,
        });
      }
    }

    // Sempre responder com 200 para o Mercado Pago saber que recebemos
    res.status(200).json({
      success: true,
      message: 'Webhook recebido',
    });
  } catch (error: any) {
    logger.error('Erro ao processar webhook', {
      error: error.message,
    });

    // Sempre responder com 200 mesmo em erro
    res.status(200).json({
      success: false,
      message: 'Erro ao processar webhook',
    });
  }
});

/**
 * GET /api/webhooks/health
 * Verificar saúde dos webhooks
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

