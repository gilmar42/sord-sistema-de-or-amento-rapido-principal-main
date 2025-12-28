// Jest setup file para configuração global
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/sord_db_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.MERCADO_PAGO_ACCESS_TOKEN = 'TEST-TOKEN-FOR-TESTING';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock de console.log para testes (opcional)
// global.console.log = jest.fn();
