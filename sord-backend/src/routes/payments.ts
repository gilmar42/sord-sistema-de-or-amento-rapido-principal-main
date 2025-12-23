import express from 'express';
import {
  createPayment,
  getPaymentStatus,
  listPayments,
} from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payments - Criar pagamento
router.post('/', createPayment);

// GET /api/payments/:orderId - Obter status do pagamento
router.get('/:orderId', getPaymentStatus);

// GET /api/payments - Listar pagamentos (com filtros)
router.get('/', listPayments);

export default router;
