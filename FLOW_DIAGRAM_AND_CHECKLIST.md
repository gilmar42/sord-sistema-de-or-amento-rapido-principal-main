# 🎯 Diagrama de Fluxo e Checklist - Implementação Mercado Pago

## 📊 Fluxo de Pagamento Detalhado

```
┌─────────────────────────────────────────────────────────────────────┐
│                        1. USUÁRIO NO FRONTEND                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Abre página de pagamento]                                         │
│         ↓                                                            │
│  [PaymentForm.tsx carrega]                                          │
│         ↓                                                            │
│  [SDK Mercado Pago é carregado dinamicamente]                      │
│  <script src="https://sdk.mercadopago.com/js/v2"></script>        │
│         ↓                                                            │
│  const mp = new MercadoPago(PUBLIC_KEY)                           │
│         ↓                                                            │
│  [Usuário preenche dados do cartão]                                │
│  - Número do cartão: 4111111111111111                              │
│  - Nome: João Silva                                                │
│  - Validade: 11/25                                                 │
│  - CVV: 123                                                        │
│  - Email: joao@example.com                                         │
│  - Parcelamento: 3x                                                │
│         ↓                                                            │
│  [Usuário clica em "Pagar"]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                2. GERAÇÃO SEGURA DE TOKEN (FRONTEND)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SDK Mercado Pago gera TOKEN criptografado:                       │
│                                                                     │
│  mp.createCardToken({                                              │
│    cardNumber: "4111111111111111",    ← Dados do cartão           │
│    cardholderName: "João Silva",                                   │
│    cardExpirationMonth: "11",                                      │
│    cardExpirationYear: "25",                                       │
│    securityCode: "123"                                             │
│  })                                                                 │
│                                                                     │
│  🔒 IMPORTANTE: Dados do cartão NUNCA saem do browser!            │
│     Apenas o TOKEN é gerado e enviado para o servidor             │
│                                                                     │
│         ↓                                                            │
│  TOKEN = "ABC123XYZ789..." (válido por 7 dias)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              3. ENVIO SEGURO PARA BACKEND (HTTPS)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  POST /api/payments                                                │
│  Content-Type: application/json                                    │
│                                                                     │
│  {                                                                  │
│    "orderId": "uuid-1234-5678",                                   │
│    "amount": 300.00,                                               │
│    "token": "ABC123XYZ789...",  ← TOKEN (seguro)                 │
│    "paymentMethodId": "visa",   ← Tipo de cartão                 │
│    "installments": 3,           ← Parcelamento                    │
│    "email": "joao@example.com",                                   │
│    "description": "Orçamento de Materiais"                        │
│  }                                                                  │
│                                                                     │
│  🔒 Dados do cartão NUNCA foram enviados!                         │
│     Apenas TOKEN + metadados necessários                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              4. PROCESSAMENTO NO BACKEND (Node.js)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  paymentController.ts recebe requisição                           │
│         ↓                                                            │
│  [Validar com Joi]                                                │
│  - orderId obrigatório                                             │
│  - amount > 0                                                      │
│  - token válido                                                    │
│  - email válido                                                    │
│  - installments entre 1 e 12                                       │
│         ↓                                                            │
│  mercadoPagoService.processPayment({                               │
│    transaction_amount: 300.00,                                     │
│    token: "ABC123XYZ789...",    ← TOKEN recebido                 │
│    payment_method_id: "visa",                                      │
│    installments: 3,                                                │
│    payer: {                                                        │
│      email: "joao@example.com"                                     │
│    },                                                              │
│    metadata: {                                                     │
│      order_id: "uuid-1234-5678"                                   │
│    }                                                               │
│  })                                                                │
│                                                                     │
│  🔒 Chave de Idempotência gerada:                                │
│     Evita cobrança duplicada se houver erro de rede               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              5. API MERCADO PAGO (HTTPS Seguro)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  const client = new MercadoPagoConfig({                           │
│    accessToken: 'APP_USR-...'  ← ACCESS TOKEN (seguro no .env)  │
│  })                                                                │
│                                                                     │
│  payment.create({                                                  │
│    body: { ... },                                                 │
│    requestOptions: {                                               │
│      idempotencyKey: 'uuid-1234...'  ← Evita duplicatas          │
│    }                                                               │
│  })                                                                │
│                                                                     │
│  API Mercado Pago processa:                                       │
│  1. Valida TOKEN                                                  │
│  2. Comunica com rede de bandeira (Visa, Mastercard, etc.)       │
│  3. Retorna status: "approved", "pending", "rejected"             │
│         ↓                                                            │
│  Resposta:                                                         │
│  {                                                                  │
│    "id": 123456789,              ← ID único do pagamento         │
│    "status": "approved",          ← Pagamento aprovado             │
│    "status_detail": "accredited", ← Detalhes                     │
│    "transaction_amount": 300.00,                                   │
│    "card": {                                                       │
│      "last_four_digits": "1111"  ← Últimos 4 dígitos             │
│    }                                                               │
│  }                                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              6. SALVAR NO BANCO DE DADOS (PostgreSQL)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INSERT INTO payments (                                            │
│    order_id,                  = 'uuid-1234-5678'                  │
│    amount,                    = 300.00                             │
│    payment_method_id,         = 'visa'                            │
│    status,                    = 'approved'                         │
│    status_detail,             = 'accredited'                      │
│    mercado_pago_id,           = 123456789                         │
│    payer_email,               = 'joao@example.com'                │
│    card_last_four,            = '1111'                            │
│    metadata                   = {resposta completa API}           │
│  )                                                                  │
│                                                                     │
│  LOG DE AUDITORIA:                                                 │
│  INSERT INTO payment_logs (                                        │
│    payment_id,                ← FK para payments                   │
│    event_type,                = 'payment_processed'               │
│    status_after,              = 'approved'                        │
│    request_body,              = {JSON da requisição}              │
│    response_body,             = {JSON da resposta}                │
│    ip_address                 = '192.168.1.100'                   │
│  )                                                                  │
│                                                                     │
│  ✅ Dados salvos com segurança e rastreabilidade                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              7. RETORNO PARA FRONTEND                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HTTP 201 Created                                                  │
│  {                                                                  │
│    "success": true,                                                │
│    "payment": {                                                    │
│      "id": 123456789,                                              │
│      "status": "approved",                                         │
│      "amount": 300.00,                                             │
│      "description": "Orçamento de Materiais"                      │
│    }                                                               │
│  }                                                                  │
│                                                                     │
│  ✅ Usuário vê mensagem de sucesso na tela                       │
│     Email de confirmação é enviado                                │
│     Recibo pode ser gerado                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              8. WEBHOOK - NOTIFICAÇÕES CONTÍNUAS                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Mercado Pago → Seu Servidor                                      │
│                                                                     │
│  POST /api/webhooks/mercadopago                                   │
│  {                                                                  │
│    "id": "123456789",          ← ID da notificação                │
│    "type": "payment",          ← Tipo de evento                   │
│    "data": {                                                       │
│      "id": 123456789           ← ID do pagamento                  │
│    }                                                               │
│  }                                                                  │
│                                                                     │
│  Seu servidor:                                                     │
│  1. Recebe notificação                                            │
│  2. ✅ VALIDA consultando API Mercado Pago (IMPORTANTE!)         │
│  3. Atualiza status no BD                                        │
│  4. Notifica usuário via email/push/WebSocket                    │
│                                                                     │
│  Casos de uso:                                                     │
│  - Pix: "pending" → "approved" (usuário confirma)                │
│  - Boleto: "pending" → "approved" (data de vencimento)           │
│  - Cartão em análise: "in_process" → "approved"                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              9. POLLING (OPCIONAL) - Atualização em Tempo Real      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Alternativa: Frontend faz polling cada 5 segundos                │
│                                                                     │
│  setInterval(async () => {                                         │
│    GET /api/payments/uuid-1234-5678                              │
│    {                                                               │
│      "payment": {                                                  │
│        "status": "approved"  ← Atualizado                        │
│      }                                                             │
│    }                                                               │
│  }, 5000)                                                          │
│                                                                     │
│  ✅ Usuário vê status atualizar em tempo real                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Completo

### 🔧 Pré-Requisitos
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 12+ instalado e rodando
- [ ] Conta no Mercado Pago criada
- [ ] Git configurado

### 📦 Setup Backend
- [ ] `cd sord-backend && npm install`
- [ ] `cp .env.example .env`
- [ ] Editar `.env` com credenciais:
  - [ ] `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - [ ] `MERCADO_PAGO_PUBLIC_KEY`
  - [ ] `MERCADO_PAGO_ACCESS_TOKEN`
  - [ ] `FRONTEND_URL=http://localhost:3000`
- [ ] `npm run migrate` (criar tabelas)
- [ ] `npm run dev` (teste conexão)
- [ ] Verificar: `GET http://localhost:3001/api/health` → "ok"

### 🎨 Setup Frontend
- [ ] `cp .env.local.example .env.local`
- [ ] Editar `.env.local`:
  - [ ] `VITE_API_URL=http://localhost:3001/api`
  - [ ] `VITE_MERCADO_PAGO_PUBLIC_KEY` (copiar do Mercado Pago)
- [ ] `npm install` (se não feito)
- [ ] `npm run dev`
- [ ] Verificar: `http://localhost:3000` carrega

### 🧪 Testes Iniciais
- [ ] Testar com cartão VISA aprovada: `4111111111111111`
  - [ ] Email: `test@example.com`
  - [ ] Validade: `11/25`
  - [ ] CVV: `123`
  - [ ] Parcelamento: `1x`
  - [ ] Clicar em "Pagar"
  - [ ] Verificar: Mensagem de sucesso
  - [ ] Verificar: Banco de dados → `SELECT * FROM payments;`

- [ ] Testar com cartão VISA recusada: `4000000000000002`
  - [ ] Esperado: Mensagem de erro "Cartão recusado"

- [ ] Testar webhook:
  ```bash
  curl -X POST http://localhost:3001/api/webhooks/test \
    -H "Content-Type: application/json" \
    -d '{"orderId": "test-123", "status": "approved"}'
  ```
  - [ ] Esperado: Status 200 + "success: true"

### 📊 Validar Banco de Dados
- [ ] Tabela `payments` existe
  ```sql
  SELECT * FROM information_schema.tables WHERE table_name = 'payments';
  ```
- [ ] Tabela `payment_logs` existe
- [ ] Índices criados corretamente
- [ ] Dados de teste visíveis

### 🔒 Validar Segurança
- [ ] Access Token NÃO está no código (apenas em `.env`)
- [ ] Public Key NÃO está no backend
- [ ] Tokens sempre enviados com HTTPS (em produção)
- [ ] Logs de auditoria salvando request/response
- [ ] Chave de idempotência implementada

### 📚 Documentação
- [ ] Ler `MERCADO_PAGO_SETUP.md`
- [ ] Ler `QUICK_START.md`
- [ ] Ler `PAYMENT_INTEGRATION_EXAMPLES.md`
- [ ] Entender fluxo de pagamento acima

### 🚀 Antes de Produção
- [ ] Alterar para credenciais PRODUÇÃO no Mercado Pago
- [ ] Testar com cartão real (pequeno valor)
- [ ] Configurar HTTPS
- [ ] Configurar webhook URL no painel Mercado Pago
- [ ] Testar webhook com ngrok
- [ ] Backup do banco de dados
- [ ] Aumentar recursos (CPU, memória, BD)
- [ ] Monitoramento/alertas configurados
- [ ] Logs centralizados (Datadog, Sentry, etc.)

### 📋 Integração com Aplicação Existente
- [ ] Decidir onde colocar botão "Pagar"
- [ ] Integrar `PaymentForm` no fluxo de orçamento
- [ ] Salvar `payment_id` na tabela de orçamentos
- [ ] Mostrar status do pagamento na dashboard
- [ ] Gerar recibos em PDF
- [ ] Enviar emails de confirmação

---

## 🎯 Próximas Etapas Recomendadas

### Fase 1: Validação (1-2 semanas)
- [ ] Testar extensamente em Sandbox
- [ ] Validar fluxo com usuários reais
- [ ] Corrigir bugs encontrados

### Fase 2: Otimizações (2-3 semanas)
- [ ] Implementar notificações em tempo real (Socket.io)
- [ ] Gerar recibos em PDF
- [ ] Enviar emails automáticos
- [ ] Dashboard de vendas

### Fase 3: Expansão (4+ semanas)
- [ ] Adicionar Pix
- [ ] Adicionar Boleto
- [ ] Assinaturas/recorrência
- [ ] Relatórios avançados

---

## 📞 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| CORS error | Verificar `FRONTEND_URL` em `.env` |
| "Token inválido" | Regenerar credenciais no Mercado Pago |
| PostgreSQL não conecta | `psql -U postgres` teste de conexão |
| Port 3001 em uso | `lsof -i :3001` e matar processo |
| SDK não carrega | Verificar `PUBLIC_KEY` em `.env.local` |

---

**Você está pronto para integrar pagamentos profissionalmente!** 🚀

Qualquer dúvida, consulte a documentação ou contate o suporte do Mercado Pago.
