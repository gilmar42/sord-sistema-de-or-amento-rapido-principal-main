# 🚀 Quick Start - Sistema SORD

## Status da Inicialização ✅

✅ Configurações (.env) ajustadas para desenvolvimento local
✅ Dependências instaladas (backend e frontend)
❌ MongoDB não está rodando localmente

---

## 🔧 PRÓXIMOS PASSOS

### Opção 1: Usar MongoDB Atlas (Recomendado - Mais Rápido) 🌟

1. **Ir para**: https://www.mongodb.com/cloud/atlas
2. **Crie uma conta gratuita** (se não tiver)
3. **Crie um cluster M0** (free tier):
   - Clique em "Create" → "Cluster"
   - Escolha "Shared" (gratuito)
   - Escolha a região mais próxima
   - Clique em "Create"

4. **Conecte sua aplicação**:
   - Clique em "Connect" no seu cluster
   - Escolha "Drivers"
   - Copie a connection string
   - Substitua `<username>:<password>` com suas credenciais

5. **Atualize o `.env` do backend**:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@seu-cluster.mongodb.net/sord_db?retryWrites=true&w=majority
   ```

---

### Opção 2: Instalar MongoDB Localmente (Mais Rápido para Depois)

**Windows**:
1. Download: https://www.mongodb.com/try/download/community
2. Execute o instalador (next, next, finish)
3. MongoDB estará em: `C:\Program Files\MongoDB`
4. Inicie com: `mongod`

---

## 🎯 Uma Vez Configurado o MongoDB

### Terminal 1 - Backend
```powershell
cd sord-backend
npm run dev
```

Deve mostrar:
```
🚀 Servidor rodando na porta 3001
✅ Conectado ao MongoDB
```

### Terminal 2 - Frontend
```powershell
cd sord-frontend
npm run dev
```

Deve mostrar:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 Testar Integração Mercado Pago

1. Abra: http://localhost:5173
2. Clique em **"Pagamentos"**
3. Preencha um formulário de pagamento teste
4. Clique em **"Pagar"**

As credenciais de teste (TEST-) funcionarão com qualquer valor.

---

## 📱 Credenciais de Teste (Válidas)

```
Cartão: 4111 1111 1111 1111
Data: 11/25
CVV: 123
```

---

## ⚠️ Troubleshooting

**Problema**: Backend diz "Não conectado ao MongoDB"
**Solução**: 
1. Verifique o `MONGODB_URI` no `.env`
2. Certifique-se de que o MongoDB está rodando (Atlas ou local)
3. Tente um novo cluster no Atlas

**Problema**: Frontend não carrega
**Solução**:
1. Verifique se backend está rodando na porta 3001
2. Verifique `VITE_API_URL` no `.env` do frontend
3. Limpe o cache: `npm run dev` no frontend novamente

---

## 📚 Documentação

- **Backend**: [sord-backend/API_DOCUMENTATION.md](sord-backend/API_DOCUMENTATION.md)
- **Pagamentos**: [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)
- **Mercado Pago**: [PRODUCAO_MERCADO_PAGO.md](PRODUCAO_MERCADO_PAGO.md)

---

**Status**: Aguardando configuração de MongoDB para inicializar o sistema ⏳
