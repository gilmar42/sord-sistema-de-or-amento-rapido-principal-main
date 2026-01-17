require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const materialsRoutes = require('./routes/materials');
const quotesRoutes = require('./routes/quotes');
const clientsRoutes = require('./routes/clients');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');

// Initialize database
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
