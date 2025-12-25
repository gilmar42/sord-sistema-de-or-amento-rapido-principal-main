import { Response } from 'express';
import { Client } from '../db/models.js';
import { AuthRequest } from '../utils/auth';
import Joi from 'joi';

const clientSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  cpf: Joi.string().optional(),
  cnpj: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string(),
    number: Joi.string(),
    complement: Joi.string().allow(''),
    neighborhood: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
  }).optional(),
  notes: Joi.string().allow('').optional(),
});

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const tenantId = req.user?.tenantId;

    const client = new Client({
      ...value,
      tenantId,
    });

    await client.save();

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cliente',
    });
  }
};

export const listClients = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { active } = req.query;

    const query: any = { tenantId };
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const clients = await Client.find(query)
      .sort({ name: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar clientes',
    });
  }
};

export const getClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    const client = await Client.findOne({ _id: id, tenantId });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar cliente',
    });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, tenantId },
      value,
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cliente',
    });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    const client = await Client.findOneAndUpdate(
      { _id: id, tenantId },
      { active: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Cliente desativado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar cliente',
    });
  }
};
