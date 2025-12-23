import { Request, Response } from 'express';
import mercadoPagoService from '../services/mercadoPagoService.js';
import db from '../db/connection.js';
import Joi from 'joi';

// Schema de validação
const paymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  token: Joi.string().required(),
  paymentMethodId: Joi.string().required(),
  installments: Joi.number().integer().min(1).required(),
  email: Joi.string().email().required(),
  description: Joi.string().required(),
  issuerId: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

export const createPayment = async (req: Request, res: Response) => {
  try {
    // Validação
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress;

    // Processar pagamento
    const result = await mercadoPagoService.processPayment({
      ...value,
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
      payment: result.data,
    });
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento',
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const dbResult = await db.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado',
      });
    }

    const payment = dbResult.rows[0];
    res.json({
      success: true,
      payment: {
        orderId: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        statusDetail: payment.status_detail,
        createdAt: payment.created_at,
        processedAt: payment.processed_at,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar status do pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar status do pagamento',
    });
  }
};

export const listPayments = async (req: Request, res: Response) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      payments: result.rows.map((p: any) => ({
        orderId: p.order_id,
        amount: p.amount,
        status: p.status,
        statusDetail: p.status_detail,
        email: p.payer_email,
        createdAt: p.created_at,
      })),
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar pagamentos',
    });
  }
};
