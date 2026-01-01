import express from 'express';
import {
  createPayment,
  createPublicPayment,
  getPaymentStatus,
  listPayments,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// POST /api/payments/public - Criar pagamento SEM autenticação (para novos usuários)
router.post('/public', createPublicPayment);

// Rotas protegidas - requerem autenticação
router.use(authMiddleware);

// POST /api/payments - Criar pagamento autenticado
router.post('/', createPayment);

// GET /api/payments/:orderId - Obter status do pagamento
router.get('/:orderId', getPaymentStatus);

// GET /api/payments - Listar pagamentos (com filtros)
router.get('/', listPayments);

export default router;
