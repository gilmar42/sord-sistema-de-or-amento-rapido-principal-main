import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sord_db';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});

export default mongoose;
