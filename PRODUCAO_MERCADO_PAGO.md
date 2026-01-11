,,,,,,,,,,,,,,,,,,,,,,,,,# 🚀 Guia de Implantação - Mercado Pago em Produção

Este guia detalha os passos necessários para ativar o Mercado Pago em ambiente de produção.

## 📋 Pré-requisitos

1. ✅ Conta no Mercado Pago verificada
2. ✅ Aplicação criada no painel do Mercado Pago
3. ✅ Conta bancária cadastrada para receber pagamentos
4. ✅ MongoDB Atlas configurado (produção)
5. ✅ Domínio próprio para o frontend e backend

---

## 🔑 Passo 1: Obter Credenciais de Produção

### 1.1. Acesse o Painel do Mercado Pago

Visite: [https://www.mercadopago.com.br/developers/panel/credentials](https://www.mercadopago.com.br/developers/panel/credentials)

### 1.2. Selecione suas Credenciais de Produção

- Vá na aba **"Credenciais de produção"**
- Copie:
  - **Public Key** (começa com `APP_USR-`)
  - **Access Token** (começa com `APP_USR-`)

⚠️ **IMPORTANTE**: Nunca compartilhe seu Access Token publicamente!

---

## ⚙️ Passo 2: Configurar Backend (sord-backend)

### 2.1. Editar arquivo `.env`

Abra o arquivo `sord-backend/.env` e configure:

```env
# Ambiente de Produção
NODE_ENV=production

# MongoDB Atlas (Produção)
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/sord_db?retryWrites=true&w=majority

# Mercado Pago - PRODUÇÃO
MERCADO_PAGO_PUBLIC_KEY=APP_USR-1234567890123456  # Sua chave pública REAL
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890123456  # Seu token REAL

# URL do Frontend (seu domínio)
FRONTEND_URL=https://seuapp.com.br

# JWT Secret (gere uma chave forte)
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_minimo_32_caracteres

# Webhook Secret (gere uma chave aleatória forte)
WEBHOOK_SECRET=outra_chave_secreta_diferente_para_webhooks
```

### 2.2. Gerar Chaves Secretas Fortes

Use o seguinte comando no terminal para gerar chaves seguras:

```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 🌐 Passo 3: Configurar Frontend (sord-frontend)

### 3.1. Editar arquivo `.env`

Abra o arquivo `sord-frontend/.env` e configure:

```env
# URL da API Backend (seu domínio do backend)
VITE_API_URL=https://api.seuapp.com.br/api

# Mercado Pago - Public Key de PRODUÇÃO
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-1234567890123456  # Mesma chave do backend
```

---

## 🔔 Passo 4: Configurar Webhooks (Notificações Automáticas)

### 4.1. Criar Endpoint de Webhook

O backend já possui a rota para webhooks em:
- **URL**: `https://api.seuapp.com.br/api/webhooks/mercadopago`

### 4.2. Configurar no Painel do Mercado Pago

1. Acesse: [https://www.mercadopago.com.br/developers/panel/notifications](https://www.mercadopago.com.br/developers/panel/notifications)
2. Clique em **"Configurar notificações"**
3. Configure:
   - **URL de produção**: `https://api.seuapp.com.br/api/webhooks/mercadopago`
   - **Eventos**: Selecione "Pagamentos" (payment)
4. Clique em **"Salvar"**

### 4.3. Testar Webhook

O Mercado Pago enviará uma requisição de teste. Verifique os logs do backend.

---

## 🧪 Passo 5: Testar em Produção

### 5.1. Fazer um Pagamento de Teste Real

⚠️ **ATENÇÃO**: Em produção, os pagamentos são REAIS e cobram dinheiro real!

1. Acesse seu sistema em produção
2. Selecione um plano de assinatura
3. Faça um pagamento com um valor baixo (ex: R$ 1,00) para testar
4. Verifique se o pagamento foi processado corretamente

### 5.2. Verificar Logs

Monitore os logs do backend para garantir que tudo está funcionando:

```bash
# Ver logs do servidor
pm2 logs sord-backend
```

---

## 📊 Passo 6: Monitoramento

### 6.1. Verificar Pagamentos no Painel do Mercado Pago

Acesse: [https://www.mercadopago.com.br/balance/funds](https://www.mercadopago.com.br/balance/funds)

- Visualize todos os pagamentos recebidos
- Verifique status (aprovado, pendente, rejeitado)
- Acompanhe repasses bancários

### 6.2. Verificar no MongoDB

Conecte ao MongoDB Atlas e verifique a collection `payments`:

```javascript
db.payments.find().sort({ createdAt: -1 }).limit(10)
```

---

## 🔒 Segurança em Produção

### ✅ Checklist de Segurança

- [ ] Credenciais de produção do Mercado Pago configuradas
- [ ] JWT_SECRET forte e único (mínimo 32 caracteres)
- [ ] WEBHOOK_SECRET configurado
- [ ] MongoDB Atlas com IP whitelist configurado
- [ ] HTTPS habilitado no frontend e backend
- [ ] CORS configurado apenas para seu domínio
- [ ] Variáveis de ambiente nunca expostas no código
- [ ] Logs de erro configurados
- [ ] Backup do banco de dados agendado

---

## 🚨 Solução de Problemas

### Erro: "Token de teste em produção"

**Sintoma**: Aviso no console do backend sobre token TEST em produção

**Solução**: 
- Verifique se você está usando credenciais que começam com `APP_USR-` (não `TEST-`)
- Reinicie o servidor após alterar o `.env`

### Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"

**Sintoma**: Erro ao processar pagamentos

**Solução**:
1. Verifique se o `.env` tem a variável `MERCADO_PAGO_ACCESS_TOKEN`
2. Certifique-se de que não há espaços antes ou depois do valor
3. Reinicie o servidor

### Pagamentos não aparecem no banco

**Sintoma**: Pagamento processado mas não salvo no MongoDB

**Solução**:
1. Verifique a conexão com MongoDB Atlas
2. Verifique os logs do backend para erros
3. Confirme que o MONGODB_URI está correto

### Webhook não recebe notificações

**Sintoma**: Status do pagamento não atualiza automaticamente

**Solução**:
1. Verifique se a URL do webhook está acessível publicamente
2. Teste a URL manualmente: `https://api.seuapp.com.br/api/webhooks/mercadopago`
3. Verifique logs do Mercado Pago no painel de desenvolvedores

---

## 💰 Taxas do Mercado Pago

O Mercado Pago cobra taxas sobre cada transação:

### Taxas Atuais (verificar site oficial)

- **PIX**: ~1% por transação
- **Cartão de Crédito**: ~4.99% + R$0.39 por transação
- **Boleto**: ~3.49% por transação

**Exemplo**: 
- Venda de R$100,00 via PIX → Você recebe ~R$99,00
- Venda de R$100,00 via Cartão → Você recebe ~R$95,01

⚠️ Considere as taxas ao definir os preços dos seus planos!

---

## 📞 Suporte

### Mercado Pago
- Documentação: [https://www.mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
- Suporte: Através do painel de desenvolvedores

### MongoDB Atlas
- Documentação: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Suporte: [https://support.mongodb.com](https://support.mongodb.com)

---

## ✅ Checklist Final de Deploy

Antes de colocar em produção, confirme:

- [ ] Credenciais de produção do Mercado Pago configuradas em ambos `.env`
- [ ] MongoDB Atlas configurado e acessível
- [ ] FRONTEND_URL aponta para domínio de produção
- [ ] VITE_API_URL aponta para API de produção
- [ ] Webhooks configurados no painel do Mercado Pago
- [ ] HTTPS habilitado no domínio
- [ ] Teste de pagamento real realizado com sucesso
- [ ] Logs sendo monitorados
- [ ] Backup do banco de dados configurado

---

## 🎉 Pronto!

Seu sistema agora está configurado para aceitar pagamentos REAIS via Mercado Pago!

Monitore constantemente os pagamentos e ajuste conforme necessário.

**Boa sorte com suas vendas! 💪**
