# 🚀 Guia de Configuração Final - SORD Sistema

## ⚡ Passo a Passo para Iniciar o Sistema

### 1️⃣ Configurar MongoDB

#### Opção A: MongoDB Local (Windows)
```powershell
# Download e instale: https://www.mongodb.com/try/download/community
# Após instalação, inicie o serviço:
net start MongoDB

# Verifique se está rodando:
mongo --eval "db.version()"
```

#### Opção B: MongoDB Atlas (Cloud - Recomendado) 🌟
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie conta gratuita
3. Crie um cluster (M0 - Free Tier)
4. Clique em "Connect" → "Connect your application"
5. Copie a string de conexão:
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/sord?retryWrites=true&w=majority
   ```

### 2️⃣ Configurar Backend

#### Criar arquivo `.env` no backend
```powershell
cd sord-backend
New-Item -ItemType File -Path .env
```

#### Editar `.env` com suas configurações:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sord
# OU para Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/sord

# JWT Secret (gere uma chave aleatória forte)
JWT_SECRET=minha_chave_super_secreta_de_no_minimo_32_caracteres_1234567890

# Mercado Pago (obtenha em: https://www.mercadopago.com.br/developers)
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-token-aqui

# CORS
FRONTEND_URL=http://localhost:5173

# Porta
PORT=3001
```

#### Gerar JWT_SECRET forte:
```powershell
# PowerShell - Gerar chave aleatória de 32 bytes
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3️⃣ Configurar Frontend

#### Criar arquivo `.env` na raiz do projeto
```powershell
cd ..
New-Item -ItemType File -Path .env
```

#### Editar `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4️⃣ Instalar Dependências

#### Backend
```powershell
cd sord-backend
npm install
```

#### Frontend
```powershell
cd ..
npm install
```

### 5️⃣ Iniciar o Sistema

#### Terminal 1 - Backend
```powershell
cd sord-backend
npm run dev
```

**Saída esperada:**
```
🚀 Servidor rodando na porta 3001
✅ Conectado ao MongoDB
```

#### Terminal 2 - Frontend
```powershell
# Na raiz do projeto
npm run dev
```

**Saída esperada:**
```
VITE ready in Xms
➜ Local: http://localhost:5173/
```

### 6️⃣ Testar o Sistema

1. **Abra o navegador:** http://localhost:5173
2. **Crie uma nova conta:**
   - Nome da Empresa: "Minha Empresa"
   - Email: "admin@minhaempresa.com"
   - Senha: "senha123"
3. **Faça login** com as credenciais criadas
4. **Verifique o console do navegador** (F12) para logs
5. **Verifique o console do backend** para logs de API

## ✅ Verificação de Funcionamento

### Backend
```bash
# Teste de saúde
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok"}

# Teste de registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'
# Deve retornar: {"token":"...", "user":{...}}
```

### Frontend
- ✅ Tela de login/registro carrega
- ✅ Ao criar conta, redireciona para dashboard
- ✅ Token JWT visível em: `localStorage.getItem('sored_jwt_token')`
- ✅ Navegação funciona sem logout

## 🐛 Troubleshooting Comum

### ❌ Backend: "Error: connect ECONNREFUSED"
**Problema:** MongoDB não está rodando
**Solução:**
```powershell
# Windows - Inicie o serviço
net start MongoDB

# Ou verifique se o URI do Atlas está correto
```

### ❌ Backend: "JWT_SECRET is required"
**Problema:** `.env` não configurado ou faltando JWT_SECRET
**Solução:**
```powershell
# Verifique se o arquivo .env existe em sord-backend/
# Adicione a linha:
JWT_SECRET=sua_chave_secreta_aqui
```

### ❌ Frontend: "Network Error" ou "Failed to fetch"
**Problema:** Backend não está rodando ou CORS configurado errado
**Solução:**
```powershell
# 1. Verifique se backend está rodando em http://localhost:3001
# 2. Verifique FRONTEND_URL no backend/.env:
FRONTEND_URL=http://localhost:5173
```

### ❌ Frontend: "401 Unauthorized"
**Problema:** Token JWT inválido ou expirado
**Solução:**
```javascript
// Console do navegador (F12):
localStorage.removeItem('sored_jwt_token')
// Depois faça login novamente
```

### ❌ MongoDB: "Authentication failed"
**Problema:** Credenciais do MongoDB Atlas incorretas
**Solução:**
```env
# Verifique a string de conexão
# Troque <password> pela senha real (sem <>)
mongodb+srv://usuario:minhasenha@cluster0.xxxxx.mongodb.net/sord
```

## 📊 Estrutura de Dados MongoDB

Após o primeiro registro, o MongoDB terá:

```javascript
// Database: sord

// Collection: users
{
  _id: ObjectId("..."),
  email: "admin@empresa.com",
  password: "$2b$10$...", // Bcrypt hash
  name: "Minha Empresa",
  tenantId: "tenant_1234567890",
  role: "admin",
  active: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

// Collection: clients (vazio inicialmente)
// Collection: payments (vazio inicialmente)
// Collection: quotes (vazio inicialmente)
// Collection: materials (vazio inicialmente)
```

## 🔒 Segurança em Produção

### Checklist Antes do Deploy
- [ ] Trocar `JWT_SECRET` por uma chave forte e única
- [ ] Usar token de produção do Mercado Pago (não TEST)
- [ ] Configurar HTTPS (não HTTP)
- [ ] Configurar `FRONTEND_URL` para domínio real
- [ ] Usar MongoDB Atlas com IP whitelist
- [ ] Configurar variáveis de ambiente no servidor (não .env em repo)
- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Configurar rate limiting no backend
- [ ] Habilitar logs de produção
- [ ] Configurar backup automático do MongoDB

## 🎉 Pronto!

Sistema configurado e funcional com:
- ✅ Autenticação JWT
- ✅ MongoDB
- ✅ Multi-tenant
- ✅ Mercado Pago
- ✅ Frontend + Backend integrados

### Próximos Passos
1. Testar criação de clientes
2. Testar criação de orçamentos
3. Testar processamento de pagamentos
4. Personalizar configurações da empresa
5. Deploy em produção

---

**Dúvidas?** Consulte:
- [API_DOCUMENTATION.md](sord-backend/API_DOCUMENTATION.md) - Documentação completa da API
- [FRONTEND_JWT_INTEGRATION.md](FRONTEND_JWT_INTEGRATION.md) - Detalhes da integração JWT
