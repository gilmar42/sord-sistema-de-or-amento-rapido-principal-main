require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
console.log('DEBUG .env MERCADO_PAGO_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN);
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const materialsRoutes = require('./routes/materials');
const quotesRoutes = require('./routes/quotes');
const clientsRoutes = require('./routes/clients');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const paymentsRoutes = require('./routes/payments');

// Initialize database
require('./config/database');

const app = express();

// Middleware CORS permissivo para desenvolvimento
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.0.104:3000',
      'http://192.168.0.104:5173',
      'https://sord-sistema-de-or-amento-rapido-pr-seven.vercel.app',
    ],
    credentials: true,
  })
);
const PORT = process.env.PORT || 5000;

// Middleware

app.use('/api/payments/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SORED API is running! 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🔐 JWT Authentication enabled`);
});

module.exports = app;
