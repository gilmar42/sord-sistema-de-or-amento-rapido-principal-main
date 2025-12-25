import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    role: string;
    planId?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role,
      planId: decoded.planId
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
};

export const generateToken = (payload: {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  planId?: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token válido por 7 dias
  });
};
