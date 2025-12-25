/**
 * Plan Service
 * Gerencia planos/pacotes de assinatura
 */

import { Plan } from '../db/models.js';
import logger from '../utils/logger.js';

interface PlanFeatures {
  maxClients: number;
  maxQuotes: number;
  maxUsers: number;
  apiAccess: boolean;
  customBranding: boolean;
  advancedReports: boolean;
  webhooks: boolean;
  supportPriority: 'basic' | 'priority' | 'vip';
}

interface PlanData {
  name: 'STANDARD';
  displayName: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeatures;
  active: boolean;
}

class PlanService {
  /**
   * Obter todos os planos ativos
   */
  async getActivePlans() {
    try {
      const plans = await Plan.find({ active: true }).sort({ price: 1 });
      return {
        success: true,
        data: plans,
      };
    } catch (error: any) {
      logger.error('Erro ao obter planos', { error: error.message });
      return {
        success: false,
        error: 'Erro ao obter planos',
      };
    }
  }

  /**
   * Obter plano específico
   */
  async getPlanById(planId: string) {
    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plano não encontrado',
        };
      }
      return {
        success: true,
        data: plan,
      };
    } catch (error: any) {
      logger.error('Erro ao obter plano', { error: error.message });
      return {
        success: false,
        error: 'Erro ao obter plano',
      };
    }
  }

  /**
   * Obter plano por nome
   */
  async getPlanByName(name: string) {
    try {
      const plan = await Plan.findOne({ name, active: true });
      if (!plan) {
        return {
          success: false,
          error: 'Plano não encontrado',
        };
      }
      return {
        success: true,
        data: plan,
      };
    } catch (error: any) {
      logger.error('Erro ao obter plano', { error: error.message });
      return {
        success: false,
        error: 'Erro ao obter plano',
      };
    }
  }

  /**
   * Inicializar plano padrão (STANDARD - Mensal + Anual)
   */
  async initializeDefaultPlans() {
    try {
      const existingPlans = await Plan.countDocuments();
      if (existingPlans > 0) {
        logger.info('Planos já inicializados', { count: existingPlans });
        return { success: true, message: 'Planos já existem' };
      }

      const defaultPlans: PlanData[] = [
        {
          name: 'STANDARD',
          displayName: 'Plano Mensal',
          description: 'Acesso completo ao sistema - Faturamento Mensal',
          price: 100.00,
          billingCycle: 'monthly',
          features: {
            maxClients: 999999,
            maxQuotes: 999999,
            maxUsers: 999999,
            apiAccess: true,
            customBranding: true,
            advancedReports: true,
            webhooks: true,
            supportPriority: 'priority',
          },
          active: true,
        },
        {
          name: 'STANDARD',
          displayName: 'Plano Anual',
          description: 'Acesso completo ao sistema - Faturamento Anual (Economize 8%)',
          price: 1100.00,
          billingCycle: 'yearly',
          features: {
            maxClients: 999999,
            maxQuotes: 999999,
            maxUsers: 999999,
            apiAccess: true,
            customBranding: true,
            advancedReports: true,
            webhooks: true,
            supportPriority: 'priority',
          },
          active: true,
        },
      ];

      await Plan.insertMany(defaultPlans);

      logger.success('Planos padrão inicializados', {
        count: defaultPlans.length,
      });

      return {
        success: true,
        message: 'Planos padrão inicializados',
        count: defaultPlans.length,
      };
    } catch (error: any) {
      logger.error('Erro ao inicializar planos padrão', {
        error: error.message,
      });
      return {
        success: false,
        error: 'Erro ao inicializar planos',
      };
    }
  }

  /**
   * Validar se usuário pode executar ação baseado em seu plano
   */
  async validateUserLimit(userId: string, limitType: string, currentCount: number): Promise<boolean> {
    try {
      // TODO: Implementar validação baseado no plano do usuário
      // Por enquanto, permitir tudo
      return true;
    } catch (error: any) {
      logger.error('Erro ao validar limite do usuário', {
        error: error.message,
      });
      return false;
    }
  }
}

export default new PlanService();
