import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
});

console.log('🔍 Testando conexão com PostgreSQL...');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`User: ${process.env.DB_USER || 'postgres'}`);
console.log(`Database: ${process.env.DB_NAME || 'postgres'}`);
console.log('');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    console.log('\n💡 Verifique:');
    console.log('1. PostgreSQL está rodando?');
    console.log('2. A senha está correta no arquivo .env?');
    console.log('3. O banco de dados existe?');
  } else {
    console.log('✅ Conexão bem-sucedida!');
    console.log('Hora do servidor:', res.rows[0].now);
  }
  pool.end();
});
