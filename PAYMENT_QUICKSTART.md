# 🚀 GUIA RÁPIDO - ATIVAR MERCADO PAGO

## ⚡ 3 Passos para Começar

### 1️⃣ Obter Credenciais Mercado Pago

```bash
# Acesse:
https://www.mercadopago.com.br/developers/panel/credentials

# Copie:
- Public Key (começa com TEST- ou APP_USR-)
- Access Token (começa com TEST- ou APP_USR-)
```

### 2️⃣ Configurar Variáveis de Ambiente

**Backend** (sord-backend/.env):
```env
MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_ACCESS_TOKEN=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Frontend** (sord-frontend/.env ou .env.local):
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3️⃣ Testar o Fluxo

```bash
# Terminal 1 - Backend
cd sord-backend
npm run dev

# Terminal 2 - Frontend  
cd sord-frontend
npm run dev

# Acesse http://localhost:5173 e clique em "Começar Agora"
```

## ✅ Fluxo Completo

```
1. Landing Page (LandingPage.tsx)
   ↓ [Clica "Começar Agora"]
2. Página de Pagamento (PaymentPage.tsx)
   ↓ [Preenche nome/email]
   ├─ ✅ Sucesso → Auth Page
   └─ ❌ Erro → Volta para Landing
   ↓ [Login/Signup]
3. Sistema Principal (MainLayout.tsx)
```

## 🎯 O que foi Criado

| Arquivo | Descrição |
|---------|-----------|
| `PaymentPage.tsx` | Página de pagamento com Mercado Pago |
| `App.tsx` | Lógica de navegação atualizada |
| `.env` | Variáveis de ambiente |
| `.env.example` | Exemplo de configuração |
| `PAYMENT_INTEGRATION.md` | Documentação completa |

## 🧪 Dados de Teste

Para testar em modo de desenvolvimento:

**Cartão de Teste:**
- Número: 4111111111111111
- Vencimento: 11/25
- CVV: 123

**Dados Pessoais:**
- Nome: Qualquer nome
- Email: Qualquer email válido

## 📊 Status Atual

- ✅ Landing Page com logo 3D
- ✅ Página de Pagamento integrada
- ✅ Fluxo de navegação completo
- ✅ Tratamento de erros
- ✅ Modo teste funcional
- ⏳ Webhooks (próxima fase)
- ⏳ Planos de preço (próxima fase)

## 💡 Próximas Etapas (Opcional)

1. Substituir credenciais TEST pelas reais (APP_USR-)
2. Implementar webhooks para confirmar pagamentos
3. Adicionar diferentes planos de assinatura
4. Criar dashboard de pagamentos

## 🆘 Troubleshooting

### "Erro ao carregar Mercado Pago SDK"
- Verifique se a chave pública está correta
- Verifique conexão com internet

### "Erro ao processar pagamento"
- Verifique se o backend está rodando
- Verifique variáveis de ambiente

### "Página não encontrada"
- Execute `npm install` em ambos os diretórios
- Limpe cache do navegador (Ctrl+Shift+Del)

---

**Sistema de Pagamento: Pronto para Produção!** 🎉
