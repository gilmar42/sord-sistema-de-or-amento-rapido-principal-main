import { Request, Response } from 'express';
import { User, Plan } from '../db/models.js';
import { generateToken } from '../utils/auth.js';
import planService from '../services/planService.js';
import logger from '../utils/logger.js';
import Joi from 'joi';

// Schemas de validação
const registerSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * POST /api/auth/register
 * Registrar novo usuário com plano
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validação
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { name, email, password, billingCycle } = value;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'E-mail já cadastrado',
      });
    }

    // Obter plano STANDARD com ciclo selecionado
    const planResult = await planService.getActivePlans();
    if (!planResult.success || !planResult.data || planResult.data.length === 0) {
      logger.warn('Plano não encontrado, inicializando padrões');
      await planService.initializeDefaultPlans();
    }

    const allPlans = planResult.data || await Plan.find({ active: true });
    const plan = allPlans.find((p: any) => p.billingCycle === billingCycle);
    
    if (!plan) {
      return res.status(500).json({
        success: false,
        error: 'Plano não disponível para este período de faturamento.',
      });
    }

    // Criar tenantId único
    const tenantId = `T-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar usuário com plano
    const planStartDate = new Date();
    const planEndDate = new Date();
    
    // Adicionar 30 dias para mensal, 365 dias para anual
    const daysToAdd = billingCycle === 'yearly' ? 365 : 30;
    planEndDate.setDate(planEndDate.getDate() + daysToAdd);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      companyName: name,
      tenantId,
      planId: plan._id,
      planStartDate,
      planEndDate,
      role: 'admin',
      active: true,
    });

    await user.save();

    // Gerar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      planId: user.planId.toString(),
    });

    logger.success('Novo usuário registrado com plano', {
      email,
      tenantId,
      planName: plan.name,
      planDisplayName: plan.displayName,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          tenantId: user.tenantId,
          planId: user.planId,
          planName: plan.name,
          planDisplayName: plan.displayName,
          planStartDate: user.planStartDate,
          planEndDate: user.planEndDate,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    logger.error('Erro ao registrar usuário', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário',
    });
  }
};

/**
 * POST /api/auth/login
 * Fazer login de usuário
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validação
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Buscar usuário
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      active: true 
    }).populate('planId');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'E-mail ou senha inválidos',
      });
    }

    // Verificar senha
    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'E-mail ou senha inválidos',
      });
    }

    // Verificar se plano está ativo
    const planExpired = new Date() > new Date(user.planEndDate);
    if (planExpired) {
      logger.warn('Plano expirado', {
        email: user.email,
        planEndDate: user.planEndDate,
      });
    }

    // Gerar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      planId: user.planId.toString(),
    });

    const plan = user.planId as any;

    logger.success('Login realizado', {
      email,
      tenantId: user.tenantId,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          tenantId: user.tenantId,
          planId: user.planId,
          planName: plan?.name,
          planDisplayName: plan?.displayName,
          planStartDate: user.planStartDate,
          planEndDate: user.planEndDate,
          planExpired,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    logger.error('Erro ao fazer login', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login',
    });
  }
};

/**
 * GET /api/auth/profile
 * Obter perfil do usuário autenticado
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('-password').populate('planId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const planExpired = new Date() > new Date(user.planEndDate);
    const plan = user.planId as any;

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        tenantId: user.tenantId,
        planId: user.planId,
        planName: plan?.name,
        planDisplayName: plan?.displayName,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        planExpired,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao buscar perfil', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil',
    });
  }
};
