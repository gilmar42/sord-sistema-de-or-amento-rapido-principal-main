# 🚀 Implementação Mercado Pago - SORD

Guia completo para configurar e usar o **Checkout Transparente** do Mercado Pago no projeto SORD.

## 📋 Índice

1. [Back-end Setup](#back-end-setup)
2. [Front-end Setup](#front-end-setup)
3. [Configuração do Mercado Pago](#configuração-do-mercado-pago)
4. [Webhooks](#webhooks)
5. [Testes](#testes)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Back-end Setup

### 1. Instalar Dependências

```bash
cd sord-backend
npm install
```

### 2. Configurar Banco de Dados PostgreSQL

#### Criar banco de dados:

```sql
CREATE DATABASE sord_db;
```

#### Criar usuário (opcional):

```sql
CREATE USER sord_user WITH PASSWORD 'sua_senha_aqui';
ALTER ROLE sord_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE sord_db TO sord_user;
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Servidor
PORT=3001
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=sord_db

# Mercado Pago (obtenha em: https://www.mercadopago.com.br/developers/pt-br)
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Front-end URL
FRONTEND_URL=http://localhost:3000
```

### 4. Inicializar Banco de Dados

```bash
npm run migrate
```

### 5. Executar Servidor

```bash
npm run dev
```

Sucesso! O servidor estará rodando em `http://localhost:3001`

---

## 🎨 Front-end Setup

### 1. Instalar Dependências do Mercado Pago

```bash
npm install mercadopago
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Usar o Componente PaymentForm

```tsx
import PaymentForm from './components/PaymentForm';

export default function App() {
  return (
    <PaymentForm
      amount={100.00}
      description="Orçamento de Material de Construção"
      onSuccess={(payment) => {
        console.log('Pagamento realizado:', payment);
        // Redirecionar ou atualizar interface
      }}
      onError={(error) => {
        console.error('Erro:', error);
      }}
    />
  );
}
```

---

## 🔐 Configuração do Mercado Pago

### 1. Criar Conta

1. Acesse [Mercado Pago Desenvolvedores](https://www.mercadopago.com.br/developers)
2. Faça login ou crie uma conta
3. Clique em **Suas Integrações** → **Credenciais**

### 2. Obter Credenciais

**Modo Sandbox (Testes)**:
- **Public Key**: Começa com `APP_USR-`
- **Access Token**: Começa com `APP_USR-`

**Modo Produção** (quando estiver pronto):
- Ativar modo produção no painel do Mercado Pago
- Gerar novas credenciais

### 3. Cartões de Teste

Use estes cartões para testar no Sandbox:

| Tipo | Número | Validade | CVV |
|------|--------|----------|-----|
| VISA (Aprovada) | 4111111111111111 | 11/25 | 123 |
| VISA (Recusada) | 4000000000000002 | 11/25 | 123 |
| Mastercard | 5555555555554444 | 11/25 | 123 |

---

## 🔔 Webhooks

### O que é?

Webhooks são notificações que o Mercado Pago envia para seu servidor quando o status de um pagamento muda.

**Estados possíveis:**
- `pending` - Aguardando processamento (ex: Pix aguardando confirmação)
- `approved` - Pagamento aprovado ✅
- `rejected` - Pagamento recusado ❌
- `cancelled` - Cancelado pelo usuário
- `in_process` - Em análise

### Configurar Webhook

1. Acesse o painel do Mercado Pago
2. Vá para **Suas Integrações** → **Webhooks**
3. Clique em **Adicionar novo webhook**
4. Configure:
   - **URL**: `https://seu-site.com.br/api/webhooks/mercadopago` (em produção)
   - **Tópico**: Selecione `payment`

### Testar Webhook em Desenvolvimento

Use ngrok para expor seu servidor local:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001
ngrok http 3001
```

Você receberá uma URL pública como: `https://abc123.ngrok.io`

Configure no Mercado Pago:
- URL: `https://abc123.ngrok.io/api/webhooks/mercadopago`

### Endpoint de Teste

Para testar sem usar ngrok:

```bash
curl -X POST http://localhost:3001/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "seu-order-id",
    "status": "approved"
  }'
```

---

## ✅ Testes

### 1. Testar Fluxo Completo

```bash
# Terminal 1: Executar back-end
cd sord-backend
npm run dev

# Terminal 2: Executar front-end
npm run dev
```

Acesse `http://localhost:3000`

### 2. Testar com Cartão de Teste

1. Use um dos cartões listados acima
2. Preencha o formulário
3. Clique em **Pagar**
4. Verifique os logs do servidor
5. Consulte o status em http://localhost:3001/api/payments/seu-order-id

### 3. Simular Pagamento Recusado

Use o cartão VISA recusada:
- **Número**: 4000000000000002
- **Resultado esperado**: Erro com mensagem "Cartão recusado"

---

## 🐛 Troubleshooting

### Erro: "Chave pública do Mercado Pago não configurada"

**Solução**: Verifique o arquivo `.env.local` (front-end) e `.env` (back-end)

```env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxx
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxx
```

### Erro: "Não consigo conectar ao PostgreSQL"

```bash
# Verificar status do PostgreSQL
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Verificar credenciais no .env
# Certificar que o banco de dados existe:
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='sord_db';"
```

### Erro: "CORS error"

Verifique em `.env` do back-end:

```env
FRONTEND_URL=http://localhost:3000  # Se front-end está em outra porta, mude
```

### Token de pagamento expirou

Tokens do Mercado Pago expiram em **7 dias**. O fluxo correto é:
1. Gerar token no front-end
2. Enviar token + dados para back-end IMEDIATAMENTE
3. Back-end processa antes de expirar

### Webhook não está sendo recebido

1. Verifique os logs do servidor: `npm run dev`
2. Confirme que a URL do webhook está correta
3. Use ngrok para testar em desenvolvimento
4. Verifique firewall/NAT se está bloqueando

---

## 📚 Documentação Oficial

- [Mercado Pago Checkout Transparente](https://www.mercadopago.com.br/developers/pt-br/docs/checkout-bricks/integration-guide)
- [API de Pagamentos](https://www.mercadopago.com.br/developers/pt-br/reference/payments/_payments/post)
- [Webhooks](https://www.mercadopago.com.br/developers/pt-br/docs/webhooks)

---

## 🔒 Segurança

✅ **O que você faz certo:**
- Tokens gerados no front-end (dados de cartão nunca tocam seu servidor)
- Processamento de pagamento no back-end (com Access Token seguro)
- Validação de webhooks consultando API do Mercado Pago
- Logs de auditoria em banco de dados

❌ **O que NUNCA fazer:**
- Enviar dados do cartão diretamente para seu servidor
- Expor Access Token no front-end
- Confiar apenas na notificação do webhook (sempre validar na API)
- Armazenar dados do cartão (PCI DSS)

---

## 📞 Suporte

Para dúvidas:
1. Consulte a documentação oficial do Mercado Pago
2. Verifique os logs do servidor
3. Use o Sandbox para testar antes de produção

Sucesso! 🚀
