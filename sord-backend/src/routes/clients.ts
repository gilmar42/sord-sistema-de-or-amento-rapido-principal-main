import express from 'express';
import {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// POST /api/clients - Criar cliente
router.post('/', createClient);

// GET /api/clients - Listar clientes
router.get('/', listClients);

// GET /api/clients/:id - Obter cliente
router.get('/:id', getClient);

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', updateClient);

// DELETE /api/clients/:id - Deletar cliente (soft delete)
router.delete('/:id', deleteClient);

export default router;
