import express from 'express';
import {
  createPayment,
  createPublicPayment,
  createPublicCheckoutPreference,
  getPaymentStatus,
  listPayments,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// POST /api/payments/public - Criar pagamento SEM autenticação (para novos usuários)
router.post('/public', createPublicPayment);

// POST /api/payments/public/checkout - Criar preferência de Checkout Pro e retornar URL
router.post('/public/checkout', createPublicCheckoutPreference);

// Rotas protegidas - requerem autenticação
router.use(authMiddleware);

// POST /api/payments - Criar pagamento autenticado
router.post('/', createPayment);

// GET /api/payments/:orderId - Obter status do pagamento
router.get('/:orderId', getPaymentStatus);

// GET /api/payments - Listar pagamentos (com filtros)
router.get('/', listPayments);

export default router;
