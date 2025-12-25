/**
 * Payment Controller
 * Endpoints para gerenciar pagamentos
 */

import { Response } from 'express';
import { AuthRequest } from '../utils/auth';
import paymentService from '../services/paymentService.js';
import logger from '../utils/logger.js';

/**
 * POST /api/payments
 * Criar novo pagamento
 */
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, amount, email, description, token, paymentMethodId, installments, issuerId } = req.body;
    const tenantId = req.user?.tenantId;
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Validações básicas
    if (!orderId || !amount || !email || !description || !token || !paymentMethodId || !installments) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: orderId, amount, email, description, token, paymentMethodId, installments',
      });
    }

    logger.info('Iniciando processamento de pagamento', {
      orderId,
      amount,
      email,
    });

    const result = await paymentService.processPayment({
      orderId,
      amount,
      email,
      description,
      token,
      paymentMethodId,
      installments,
      issuerId,
      tenantId: tenantId || 'unknown',
      ipAddress,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logger.error('Erro ao criar pagamento', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento. Tente novamente.',
    });
  }
};

/**
 * GET /api/payments/:orderId
 * Obter status de um pagamento
 */
export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId é obrigatório',
      });
    }

    const result = await paymentService.getPaymentStatus(orderId, tenantId || 'unknown');

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error: any) {
    logger.error('Erro ao obter status do pagamento', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Erro ao obter status do pagamento',
    });
  }
};

/**
 * GET /api/payments
 * Listar pagamentos com filtros
 */
export const listPayments = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { status, limit, offset } = req.query;

    const result = await paymentService.listPayments(tenantId || 'unknown', {
      status: status as string,
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Erro ao listar pagamentos', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Erro ao listar pagamentos',
    });
  }
};
