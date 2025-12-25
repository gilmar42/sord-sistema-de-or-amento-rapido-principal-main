/**
 * Plan Routes
 * Endpoints públicos e privados para gerenciar planos
 */

import express from 'express';
import { listPlans, getPlan, initializePlans } from '../controllers/planController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// Rotas públicas (sem autenticação)
router.get('/', listPlans);
router.get('/:planId', getPlan);

// Rotas privadas (requerem autenticação)
router.post('/init/default', authMiddleware, initializePlans);

export default router;
