# 📖 Guia Rápido - Integração Mercado Pago SORD

## 🚀 Começar em 5 Minutos

### 1️⃣ Backend
```bash
cd sord-backend
npm install
cp .env.example .env
# Editar .env com credenciais
npm run migrate
npm run dev  # Rodando em http://localhost:3001
```

### 2️⃣ Frontend
```bash
cp .env.local.example .env.local
# Editar .env.local com PUBLIC_KEY do Mercado Pago
npm run dev  # Rodando em http://localhost:3000
```

### 3️⃣ Usar PaymentForm
```tsx
import PaymentForm from './components/PaymentForm';

<PaymentForm
  amount={100}
  description="Meu Orçamento"
  onSuccess={(payment) => console.log('✅', payment)}
  onError={(error) => console.log('❌', error)}
/>
```

---

## 🔑 Credenciais do Mercado Pago

**Obtenha aqui**: https://www.mercadopago.com.br/developers

| Credencial | Onde usar | Exemplo |
|-----------|-----------|---------|
| **Public Key** | `.env.local` (Front) | `APP_USR-abc123...` |
| **Access Token** | `.env` (Back) | `APP_USR-xyz789...` |

---

## 🧪 Testar com Cartões

| Tipo | Número | Validade | CVV | Resultado |
|------|--------|----------|-----|-----------|
| VISA OK | 4111111111111111 | 11/25 | 123 | ✅ Aprovado |
| VISA Falha | 4000000000000002 | 11/25 | 123 | ❌ Recusado |

---

## 📡 Fluxo de Pagamento

```
┌─────────────────────────────────────────┐
│ 1. Usuário preenche formulário           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. SDK Mercado Pago gera TOKEN          │
│    (Dados do cartão não saem do browser) │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. Envia TOKEN + dados para seu Backend  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. Backend processa com Access Token     │
│    Chama API Mercado Pago                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. Salva resultado no PostgreSQL         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 6. Retorna status para o frontend        │
└─────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Criar Pagamento
```bash
POST /api/payments
Content-Type: application/json

{
  "orderId": "uuid-unico",
  "amount": 100.00,
  "token": "token-gerado-pelo-sdk",
  "paymentMethodId": "visa",
  "installments": 1,
  "email": "cliente@example.com",
  "description": "Compra no SORD"
}

Resposta:
{
  "success": true,
  "payment": {
    "id": 123456789,
    "status": "approved",
    "amount": 100.00
  }
}
```

### Consultar Status
```bash
GET /api/payments/:orderId

Resposta:
{
  "success": true,
  "payment": {
    "orderId": "uuid-unico",
    "amount": 100.00,
    "status": "approved",
    "statusDetail": "accredited",
    "createdAt": "2025-12-23T10:30:00Z"
  }
}
```

### Listar Pagamentos
```bash
GET /api/payments?status=approved&limit=10

Resposta:
{
  "success": true,
  "payments": [...],
  "total": 5
}
```

---

## 🔔 Webhook

Recebe notificações quando um pagamento muda de status.

**Configure em**: https://www.mercadopago.com.br → Webhooks

**URL**: `https://seu-site.com/api/webhooks/mercadopago`

**Testando em desenvolvimento**:
```bash
# Terminal 1
npm run dev

# Terminal 2 (em outro console)
curl -X POST http://localhost:3001/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "seu-order-id",
    "status": "approved"
  }'
```

---

## 📊 Estrutura Banco de Dados

### Tabela: payments
```sql
id              UUID PRIMARY KEY
order_id        VARCHAR UNIQUE
amount          DECIMAL(10,2)
status          VARCHAR (pending|approved|rejected|cancelled)
status_detail   VARCHAR
mercado_pago_id BIGINT
payer_email     VARCHAR
card_last_four  VARCHAR(4)
installments    INT
metadata        JSONB (resposta completa da API)
created_at      TIMESTAMP
updated_at      TIMESTAMP
processed_at    TIMESTAMP (quando foi aprovado/rejeitado)
```

### Tabela: payment_logs
```sql
id              UUID PRIMARY KEY
payment_id      UUID REFERENCES payments(id)
event_type      VARCHAR (payment_processed|webhook_received|etc)
status_after    VARCHAR
request_body    JSONB
response_body   JSONB
ip_address      VARCHAR
created_at      TIMESTAMP
```

---

## ⚠️ Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Chave pública não configurada" | `.env.local` vazio | Copiar `APP_USR-xxx` para `VITE_MERCADO_PAGO_PUBLIC_KEY` |
| "CORS error" | Back-end não permite origem | Verificar `FRONTEND_URL` em `.env` |
| "Cartão recusado" | Teste com cartão válido | Usar `4111111111111111` |
| "Token expirado" | Esperar muito entre gerar e enviar | Gerar token e enviar IMEDIATAMENTE |
| "PostgreSQL não conecta" | Credenciais erradas | Verificar `.env`: `DB_USER`, `DB_PASSWORD`, `DB_NAME` |

---

## 🔒 Segurança - Checklist

- ✅ Tokens gerados NO FRONT-END (dados de cartão nunca tocam servidor)
- ✅ Access Token armazenado APENAS no Back-end (.env)
- ✅ Sensível validar webhook consultando API do Mercado Pago
- ✅ Logs de auditoria em banco de dados
- ✅ HTTPS em produção (obrigatório para cartões)
- ✅ NUNCA armazenar dados do cartão completo

---

## 📞 Recursos

- [Documentação Oficial](https://www.mercadopago.com.br/developers)
- [API Reference](https://www.mercadopago.com.br/developers/pt-br/reference)
- [Status do Mercado Pago](https://status.mercadopago.com)

---

## 🎯 Próximos Passos

1. ✅ Implementar pagamentos
2. ⏳ Adicionar notificações em tempo real (WebSocket)
3. ⏳ Gerar recibos em PDF
4. ⏳ Integrar com email (nodemailer)
5. ⏳ Relatórios de vendas/pagamentos
6. ⏳ Integração com gestão de clientes

---

**Desenvolvido com ❤️ para o SORD**
