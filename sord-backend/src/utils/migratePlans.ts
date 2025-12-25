/**
 * Script de Migração: Atualizar Planos de 3-tier para Sistema Único
 * Remove planos antigos (STARTER, PROFESSIONAL, ENTERPRISE)
 * Cria novos planos (STANDARD mensal + anual)
 */

import mongoose from 'mongoose';
import { Plan } from '../db/models.js';
import logger from './logger.js';

async function migratePlans() {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/sord_db';
    await mongoose.connect(dbUrl);
    logger.info('Conectado ao MongoDB');

    // Remover planos antigos
    const oldPlanNames = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    const deleteResult = await Plan.deleteMany({
      name: { $in: oldPlanNames },
    });

    if (deleteResult.deletedCount > 0) {
      logger.success('Planos antigos removidos', {
        count: deleteResult.deletedCount,
      });
    }

    // Verificar se já existem planos STANDARD
    const existingStandard = await Plan.countDocuments({
      name: 'STANDARD',
    });

    if (existingStandard >= 2) {
      logger.info('Planos STANDARD já existem', { count: existingStandard });
      await mongoose.connection.close();
      return;
    }

    // Criar novos planos STANDARD
    const newPlans = [
      {
        name: 'STANDARD',
        displayName: 'Plano Mensal',
        description: 'Acesso completo ao sistema - Faturamento Mensal',
        price: 100.0,
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
        price: 1100.0,
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

    const insertResult = await Plan.insertMany(newPlans);
    logger.success('Novos planos STANDARD criados', {
      count: insertResult.length,
      plans: insertResult.map(p => ({
        id: p._id,
        name: p.displayName,
        billingCycle: p.billingCycle,
      })),
    });

    await mongoose.connection.close();
    logger.info('Migração concluída com sucesso!');
  } catch (error: any) {
    logger.error('Erro na migração de planos', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

migratePlans();
