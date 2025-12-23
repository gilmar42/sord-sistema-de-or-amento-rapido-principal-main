import db from './connection.js';

export async function initializeDatabase() {
  try {
    // Tabela de Pagamentos
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(255) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        payment_method_id VARCHAR(50) NOT NULL,
        payment_method_type VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        status_detail VARCHAR(255),
        mercado_pago_id BIGINT,
        payer_email VARCHAR(255) NOT NULL,
        description TEXT,
        installments INT DEFAULT 1,
        issuer_id VARCHAR(50),
        card_last_four VARCHAR(4),
        metadata JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
    `);

    // Índices para melhor performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payments_mercado_pago_id ON payments(mercado_pago_id);
    `);

    // Tabela de Logs de Auditoria
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        status_before VARCHAR(50),
        status_after VARCHAR(50),
        request_body JSONB,
        response_body JSONB,
        error_details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para logs
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);
    `);

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Executar inicialização se for chamado diretamente
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  initializeDatabase()
    .then(() => {
      console.log('Migração concluída');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
}
