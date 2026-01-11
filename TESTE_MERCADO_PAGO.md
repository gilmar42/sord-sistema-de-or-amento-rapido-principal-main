# 🧪 Testando Integração Mercado Pago

## ✅ Sistema Pronto!

```
Backend:  http://localhost:3001 ✅
Frontend: http://localhost:5173 ✅
MongoDB:  Conectado ✅
Mercado Pago: TESTE ✅
```

---

## 🎯 Passo a Passo para Testar

### 1. Abrir aplicação
```
http://localhost:5173
```

### 2. Clique em "Começar" ou "Pagamentos"
- Você será levado para a página de pagamento

### 3. Preencha o formulário
```
Nome: João Silva (qualquer nome)
Email: teste@exemplo.com (qualquer email)
```

### 4. Clique em "Pagar com Mercado Pago"
- Será redirecionado para o Checkout Pro do Mercado Pago
- Como está em TESTE (credenciais TEST-*), usará a versão sandbox

### 5. Use Cartão de Teste
```
Cartão:       4111 1111 1111 1111
Titular:      APRO
Data:         11/25
CVV:          123
```

### 6. Completar Pagamento
- Clique em "Pagar"
- Será redirecionado para: `http://localhost:5173/checkout/sucesso`

---

## 🔍 Verificar Pagamento

### No Backend (Logs):
```
[MercadoPago] Processando pagamento order_XXXXX - R$ 100.00
[MercadoPago] Pagamento order_XXXXX processado em XXXms - Status: approved
```

### No MongoDB:
- Acessar `sord_db.payments`
- Ver documento com:
  - `status: "approved"`
  - `transaction_amount: 100`
  - `email: teste@exemplo.com`

---

## 📱 URLs de Retorno Após Pagamento

**Sucesso:**
```
http://localhost:5173/checkout/sucesso
```

**Erro:**
```
http://localhost:5173/checkout/erro
```

**Pendente:**
```
http://localhost:5173/checkout/pendente
```

---

## ⚙️ Configuração Atual

### Backend (.env)
```
MERCADO_PAGO_ACCESS_TOKEN=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🚀 Próximas Ações para Produção

Quando estiver pronto para produção:

1. **Obter credenciais REAIS do Mercado Pago**
   - Acessar: https://www.mercadopago.com.br/developers/panel/credentials
   - Copiar credenciais APP_USR-* (não TEST-*)

2. **Atualizar .env (backend)**
   ```
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXXXXX (sua chave real)
   MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXX (sua chave real)
   FRONTEND_URL=https://seu-dominio.com
   NODE_ENV=production
   ```

3. **Atualizar .env (frontend)**
   ```
   VITE_API_URL=https://seu-backend.com/api
   VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXX (sua chave real)
   ```

4. **Configurar Webhooks no Mercado Pago**
   - URL: `https://seu-backend.com/api/webhooks/mercadopago`
   - Eventos: `payment` e `merchant_order`

---

## ❓ Troubleshooting

### "Erro ao criar checkout"
- ✅ Verificar se backend está rodando em http://localhost:3001
- ✅ Checar logs do backend
- ✅ Certificar que `VITE_API_URL` está correto no frontend

### "Mercado Pago SDK não carregou"
- ✅ Verificar console do navegador (F12)
- ✅ Checar se `VITE_MERCADO_PAGO_PUBLIC_KEY` está preenchido

### "Pagamento não aparece no banco de dados"
- ✅ Verificar se MongoDB está rodando
- ✅ Checar logs do backend para erros

---

**Status:** Sistema completamente funcional e pronto para testes! ✅
