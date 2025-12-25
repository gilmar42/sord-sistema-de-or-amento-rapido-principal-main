/**
 * Plan Controller
 * Endpoints para gerenciar planos
 */

import { Response } from 'express';
import { AuthRequest } from '../utils/auth.js';
import planService from '../services/planService.js';
import logger from '../utils/logger.js';

/**
 * GET /api/plans
 * Listar todos os planos ativos
 */
export const listPlans = async (req: AuthRequest, res: Response) => {
  try {
    const result = await planService.getActivePlans();
    res.json(result);
  } catch (error: any) {
    logger.error('Erro ao listar planos', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao listar planos',
    });
  }
};

/**
 * GET /api/plans/:planId
 * Obter detalhes de um plano específico
 */
export const getPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'planId é obrigatório',
      });
    }

    const result = await planService.getPlanById(planId);
    res.json(result);
  } catch (error: any) {
    logger.error('Erro ao obter plano', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao obter plano',
    });
  }
};

/**
 * GET /api/plans/init/default
 * Inicializar planos padrão (apenas admin)
 */
export const initializePlans = async (req: AuthRequest, res: Response) => {
  try {
    // Apenas admin pode inicializar planos
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Permissão negada',
      });
    }

    const result = await planService.initializeDefaultPlans();
    res.json(result);
  } catch (error: any) {
    logger.error('Erro ao inicializar planos', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao inicializar planos',
    });
  }
};
