# 💳 Integração Mercado Pago - SORD

## 📋 Visão Geral

O sistema SORD agora possui um gateway de pagamento integrado com Mercado Pago de forma simples e segura. O fluxo é:

```
Landing Page → Pagamento → Auth/Login → Sistema
```

## 🔄 Fluxo de Navegação

1. **Landing Page**: Usuário vê a página inicial com informações do sistema
2. **Clique em "Começar Agora"**: Redireciona para página de pagamento
3. **Pagamento**: Usuário ativa a conta com pagamento simbólico (R$ 0,01)
   - ✅ Sucesso: Redireciona para login
   - ❌ Erro: Mostra mensagem e volta para landing page
4. **Login/Signup**: Usuário cria conta ou faz login
5. **Acesso ao Sistema**: Usuário tem acesso a todas as funcionalidades

## 🛠 Componentes Criados

### 1. **PaymentPage.tsx**
Página de pagamento encapsulada com:
- Carregamento do SDK do Mercado Pago
- Formulário simples (nome e email)
- Integração com API de pagamento
- Mensagens de sucesso/erro
- Modo teste para desenvolvimento

```typescript
interface PaymentPageProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}
```

### 2. **App.tsx (Atualizado)**
Controle de fluxo com 4 estados:
- Landing page
- Página de pagamento
- Autenticação
- Sistema completo

## 📝 Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_ENVIRONMENT=development
```

### Backend (.env)
```env
MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_ACCESS_TOKEN=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
WEBHOOK_SECRET=sua_chave_secreta_muito_segura
```

## 🔑 Obtendo Credenciais do Mercado Pago

### 1. Crie uma Conta
- Acesse: https://www.mercadopago.com.br/developers/panel/credentials
- Faça login ou crie uma conta

### 2. Copie as Credenciais
- **Public Key**: Para usar no frontend (começa com `TEST-` ou `APP_USR-`)
- **Access Token**: Para usar no backend (começa com `TEST-` ou `APP_USR-`)

### 3. Escolha o Ambiente
- **TESTE**: Use credenciais que começam com `TEST-`
- **PRODUÇÃO**: Use credenciais que começam com `APP_USR-`

## 🧪 Testando o Sistema

### Em Desenvolvimento (Modo Teste)

1. **Dados de Teste Mercado Pago**:
   ```
   Cartão: 4111111111111111
   Vencimento: 11/25
   CVV: 123
   ```

2. **Fluxo Simplificado**:
   - A página de pagamento atual usa um fluxo simplificado
   - Qualquer nome e email funcionam
   - O pagamento é processado com token de teste

3. **Testar Localmente**:
   ```bash
   # Terminal 1 - Backend
   cd sord-backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd sord-frontend
   npm run dev
   ```

4. **Acessar**:
   - Vá para http://localhost:5173
   - Clique em "Começar Agora"
   - Preencha nome e email
   - Clique em "Ativar Conta"

## 🔐 Segurança

### Práticas Implementadas
1. ✅ Chaves públicas/privadas separadas
2. ✅ Token seguro via JWT
3. ✅ Validação de entrada
4. ✅ CORS configurado
5. ✅ Variáveis sensíveis em .env

### Recomendações para Produção
1. Use credenciais reais (APP_USR-)
2. Configure webhook para receber notificações
3. Implemente validação de assinatura de webhook
4. Use HTTPS em produção
5. Revise e teste o fluxo completo

## 📡 API de Pagamento

### Endpoint POST `/api/payments`
```typescript
{
  transaction_amount: 0.01,        // Valor em reais
  token: "string",                 // Token do cartão
  description: "string",           // Descrição do pedido
  installments: 1,                 // Parcelas (1-12)
  payment_method_id: "visa",       // Método de pagamento
  cardholder: {
    name: "string",
    email: "string"
  }
}
```

### Resposta Sucesso
```json
{
  "id": "123456789",
  "status": "approved",
  "status_detail": "accredited",
  "amount": 0.01,
  "...": "outros_campos"
}
```

### Resposta Erro
```json
{
  "error": "Mensagem de erro",
  "status": 400
}
```

## 🎯 Próximas Melhorias

1. **Integração Completa de Cartão**:
   - Usar formulário Mercado Pago oficial
   - Criptografia nativa de dados do cartão
   - PCI compliance automático

2. **Webhooks**:
   - Receber notificações de pagamento
   - Atualizar status automaticamente
   - Registrar transações

3. **Planos de Assinatura**:
   - Diferentes tiers de acesso
   - Renovação automática
   - Gestão de cancelamento

4. **Dashboard Administrativo**:
   - Visualizar pagamentos
   - Exportar relatórios
   - Gerenciar clientes

5. **Integração com Banco de Dados**:
   - Armazenar histórico de pagamentos
   - Rastrear status de cliente
   - Analytics e métricas

## 📞 Suporte

Para dúvidas sobre Mercado Pago:
- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Centro de Ajuda: https://www.mercadopago.com.br/developers/pt/support

---

**Criada em**: 01/01/2026
**Versão**: 1.0
