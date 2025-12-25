import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import clientRoutes from './routes/clients.js';
import planRoutes from './routes/plans.js';
import errorHandler from './utils/errorHandler.js';
import planService from './services/planService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validações críticas para produção
if (NODE_ENV === 'production') {
  console.log('🔒 Modo PRODUÇÃO ativado - Verificando configurações...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'MERCADO_PAGO_ACCESS_TOKEN',
    'FRONTEND_URL',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }

  // Avisar sobre tokens de teste
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-')) {
    console.warn('⚠️  AVISO: Token de TESTE do Mercado Pago em produção!');
  }
  
  console.log('✅ Configurações de produção validadas');
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Log de requisições em produção (simplificado)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
async function startServer() {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Inicializar planos padrão
    await planService.initializeDefaultPlans();

    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 SORD Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Environment: ${NODE_ENV}`);
      console.log(`   Server URL: http://localhost:${PORT}`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`   CORS Enabled: ✅`);
      console.log(`   Database: MongoDB ✅`);
      console.log(`   Plans System: ✅`);
      console.log(`   Mercado Pago: ${process.env.MERCADO_PAGO_ACCESS_TOKEN ? '✅' : '❌'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Erro ao iniciar servidor');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error);
  process.exit(1);
});

startServer();
