# 📋 Passo a Passo Simples - Iniciar Sistema SORD

## O que falta?

MongoDB não está rodando no seu computador. Você tem 2 opções:

---

## ✅ OPÇÃO 1: MongoDB Atlas (Nuvem - Mais Fácil!) - 5 Minutos ⏱️

### Passo 1: Criar conta gratuita
- Acesse: https://www.mongodb.com/cloud/atlas
- Clique "Sign Up"
- Complete o formulário com seu email

### Passo 2: Criar um banco de dados
- Depois do login, clique em "Create" (botão verde)
- Escolha "Shared" (gratuito M0)
- Selecione qualquer região
- Clique "Create Deployment"
- **SALVE a senha que aparecer** ⚠️

### Passo 3: Obter a URL de conexão
- Clique em "Cluster" no menu
- Clique no botão "Connect"
- Escolha "Connect with MongoDB Compass or Drivers"
- Copie a URL que começa com: `mongodb+srv://...`

### Passo 4: Atualizar o arquivo `.env` do backend
Abra: `sord-backend/.env`

Encontre esta linha:
```
MONGODB_URI=mongodb://localhost:27017/sord_db
```

Substitua por (exemplo):
```
MONGODB_URI=mongodb+srv://sord:sua-senha-aqui@cluster0.xyz.mongodb.net/sord_db?retryWrites=true&w=majority
```

**Importante**: Substitua `sua-senha-aqui` pela senha que você salvou no Passo 2!

---

## 🔧 OPÇÃO 2: Instalar MongoDB Local (Mais Manual)

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Execute como Administrator
3. Próximo, próximo, próximo... Instalar
4. Abra PowerShell como Admin
5. Execute: `mongod`

Pronto! MongoDB estará rodando em `mongodb://localhost:27017`

---

## 🚀 Depois que o MongoDB estiver pronto:

### Terminal 1 (PowerShell/CMD):
```powershell
cd sord-backend
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 3001
✅ Conectado ao MongoDB
```

### Terminal 2 (PowerShell/CMD novo):
```powershell
cd sord-frontend  
npm run dev
```

Você verá algo como:
```
Local:   http://localhost:5173/
```

---

## ✨ Sistema Pronto!

Abra seu navegador em: **http://localhost:5173**

Você verá a tela inicial com:
- Dashboard de orçamentos
- Integração com Mercado Pago
- Gestão de planos

---

## 🧪 Testar Pagamento com Mercado Pago

1. Clique em "Pagamentos"
2. Preencha o formulário
3. Use estes dados de teste:
   ```
   Cartão: 4111 1111 1111 1111
   Data: 11/25
   CVV: 123
   ```
4. Clique em "Pagar"

---

## ❓ Dúvidas?

- **Backend não conecta**: Verifique a URL do MongoDB no `.env`
- **Frontend não carrega**: Reinicie o comando `npm run dev` do frontend
- **Dados não salvam**: Certifique-se que o MongoDB está rodando

**Feito!** Seu sistema está pronto para testar a integração Mercado Pago! 🎉
