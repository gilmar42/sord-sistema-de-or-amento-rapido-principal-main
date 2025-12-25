import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// POST /api/auth/register - Registrar novo usuário
router.post('/register', register);

// POST /api/auth/login - Login
router.post('/login', login);

// GET /api/auth/profile - Obter perfil (protegido)
router.get('/profile', authMiddleware, getProfile);

export default router;
