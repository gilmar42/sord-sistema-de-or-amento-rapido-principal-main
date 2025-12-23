# 🔧 Configuração de Ambiente Completo

## 📋 Estrutura de Pastas Criada

```
sord-sistema-de-orçamento-rápido/
├── sord-backend/                          ← NOVO: Backend Node.js/Express
│   ├── src/
│   │   ├── server.ts                      (Servidor Express principal)
│   │   ├── controllers/
│   │   │   └── paymentController.ts       (Lógica de pagamentos)
│   │   ├── routes/
│   │   │   ├── payments.ts                (Rotas de pagamento)
│   │   │   └── webhooks.ts                (Webhook Mercado Pago)
│   │   ├── services/
│   │   │   └── mercadoPagoService.ts      (Integração Mercado Pago)
│   │   ├── db/
│   │   │   ├── connection.ts              (Conexão PostgreSQL)
│   │   │   └── migrate.ts                 (Schema do BD)
│   │   └── utils/
│   │       └── errorHandler.ts            (Middleware de erros)
│   ├── .env.example                       (Variáveis de exemplo)
│   ├── package.json                       (Dependências)
│   └── tsconfig.json                      (Config TypeScript)
│
├── src/
│   ├── components/
│   │   ├── PaymentForm.tsx                ← NOVO: Formulário de pagamento
│   │   ├── PaymentForm.test.tsx           ← NOVO: Testes
│   │   └── QuoteWithPayment.tsx           ← NOVO: Integração com orçamento
│   └── services/
│       └── paymentService.ts              ← NOVO: Cliente API de pagamentos
│
├── .env.local.example                     ← NOVO: Variáveis frontend
├── MERCADO_PAGO_SETUP.md                  ← NOVO: Guia completo
├── QUICK_START.md                         ← NOVO: Referência rápida
├── PAYMENT_INTEGRATION_EXAMPLES.md        ← NOVO: 6 exemplos práticos
├── IMPLEMENTATION_SUMMARY.md              ← NOVO: Sumário de implementação
├── FLOW_DIAGRAM_AND_CHECKLIST.md          ← NOVO: Fluxo e checklist
├── ENVIRONMENT_SETUP.md                   ← NOVO: Este arquivo
└── scripts-utils.sh                       ← NOVO: Scripts de desenvolvimento
```

---

## 🌍 Variáveis de Ambiente

### Backend (.env) - sord-backend/

```env
# ========== SERVIDOR ==========
PORT=3001
NODE_ENV=development

# ========== POSTGRESQL ==========
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=sord_db

# ========== MERCADO PAGO ==========
MERCADO_PAGO_PUBLIC_KEY=APP_USR-abc123xyz789...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-def456uvw012...

# ========== SEGURANÇA ==========
WEBHOOK_SECRET=sua_chave_secreta_muito_segura_aqui

# ========== CORS ==========
FRONTEND_URL=http://localhost:3000
```

**Onde obter:**
1. **Credenciais Mercado Pago**: https://www.mercadopago.com.br/developers
   - Acessar "Suas Integrações"
   - Copiar PUBLIC_KEY e ACCESS_TOKEN
   - Usar credenciais SANDBOX para testes

2. **PostgreSQL**:
   ```bash
   # Linux/Mac
   psql -U postgres -l
   
   # Windows (pgAdmin ou linha de comando)
   psql -U postgres
   ```

### Frontend (.env.local) - Raiz do projeto

```env
# ========== API BACKEND ==========
VITE_API_URL=http://localhost:3001/api

# ========== MERCADO PAGO (PUBLIC KEY APENAS) ==========
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-abc123xyz789...
```

**⚠️ IMPORTANTE:**
- Nunca coloque `ACCESS_TOKEN` no frontend
- `PUBLIC_KEY` é segura (pode estar pública no código)
- Usar `VITE_` como prefixo (padrão Vite)

---

## 🚀 Comandos de Configuração

### 1. Backend Inicial

```bash
# Entrar no diretório
cd sord-backend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais (usar editor favorito)
# Linux/Mac: nano .env
# Windows: notepad .env

# Criar banco de dados
psql -U postgres -c "CREATE DATABASE sord_db;"

# Ou com senha:
psql -U postgres -W -c "CREATE DATABASE sord_db;"

# Rodar migrações (criar tabelas)
npm run migrate

# Iniciar servidor
npm run dev

# Verificar saúde da API
curl http://localhost:3001/api/health
# Esperado: {"status":"ok","timestamp":"2025-12-23T..."}
```

### 2. Frontend Inicial

```bash
# Na raiz do projeto
cp .env.local.example .env.local

# Editar .env.local
# Linux/Mac: nano .env.local
# Windows: notepad .env.local

# Instalar dependências (se não feito)
npm install

# Iniciar servidor
npm run dev

# Acessar em: http://localhost:3000
```

### 3. Verificar Conexão entre Frontend e Backend

```bash
# Terminal 1: Backend
cd sord-backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Teste de conexão
curl -X GET http://localhost:3001/api/health
curl -X GET http://localhost:3000  # Deve carregar a página

# No console do browser (F12), deve ver:
# GET http://localhost:3001/api/health 200
```

---

## 🗄️ PostgreSQL Setup

### Instalação

**Windows:**
```powershell
# Usar installer de https://www.postgresql.org/download/windows/
# Ou com Chocolatey:
choco install postgresql
```

**macOS:**
```bash
# Com Homebrew:
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Teste de Conexão

```bash
# Conectar com usuário padrão
psql -U postgres

# Comando SQL para testar
SELECT version();

# Criar banco de dados para SORD
CREATE DATABASE sord_db;

# Listar bases
\l

# Sair
\q
```

### Alternativa: Docker (Recomendado)

```bash
# Instalar Docker de https://docker.com

# Rodar PostgreSQL em container
docker run --name sord-postgres \
  -e POSTGRES_PASSWORD=senha123 \
  -p 5432:5432 \
  -d postgres:15

# Verificar
docker ps

# Conectar
psql -h localhost -U postgres -d sord_db
```

---

## 🔑 Mercado Pago - Obter Credenciais

### Passo a Passo

1. **Acessar https://www.mercadopago.com.br**
2. **Criar conta ou fazer login**
3. **Clicar em "Suas Integrações"**
   - Link: https://www.mercadopago.com.br/developers
4. **Selecionar "Credenciais"**
5. **Escolher "Sandbox" para testes**
6. **Copiar:**
   - `Public Key` → `.env.local` (`VITE_MERCADO_PAGO_PUBLIC_KEY`)
   - `Access Token` → `.env` backend (`MERCADO_PAGO_ACCESS_TOKEN`)

### Cartões de Teste (Sandbox)

| Tipo | Número | Validade | CVV |
|------|--------|----------|-----|
| VISA (OK) | 4111111111111111 | 11/25 | 123 |
| VISA (Falha) | 4000000000000002 | 11/25 | 123 |
| Mastercard | 5555555555554444 | 11/25 | 123 |
| AMEX | 378282246310005 | 08/25 | 1234 |

---

## ✅ Checklist de Configuração

### Backend
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] PostgreSQL instalado (`psql --version`)
- [ ] `sord-backend/` criado
- [ ] `npm install` executado em `sord-backend/`
- [ ] `.env` criado com variáveis
- [ ] PostgreSQL rodando
- [ ] Banco de dados `sord_db` criado
- [ ] `npm run migrate` executado
- [ ] `npm run dev` iniciado com sucesso
- [ ] `GET http://localhost:3001/api/health` retorna 200

### Frontend
- [ ] React 18.2+ (`npm ls react`)
- [ ] TypeScript configurado
- [ ] `.env.local` criado
- [ ] Variáveis de ambiente preenchidas
- [ ] `npm install` executado
- [ ] `npm run dev` iniciado
- [ ] Página carrega em http://localhost:3000
- [ ] Componente `PaymentForm` visível

### Mercado Pago
- [ ] Conta criada
- [ ] PUBLIC_KEY obtida
- [ ] ACCESS_TOKEN obtida
- [ ] Modo Sandbox selecionado
- [ ] Cartões de teste validados

### Integração
- [ ] Backend + Frontend comunicando
- [ ] Formulário de pagamento abrindo
- [ ] SDK Mercado Pago carregando
- [ ] Pagamento de teste processado
- [ ] Banco de dados salvando dados
- [ ] Logs de auditoria registrados

---

## 🔒 Segurança - Variáveis Sensíveis

### O que NUNCA expor:

```
❌ ACCESS_TOKEN do Mercado Pago
❌ Senha do PostgreSQL
❌ Chaves de API
❌ Senhas de banco de dados
❌ URLs internas de banco de dados
```

### Arquivo .gitignore (já deve ter):

```
.env
.env.local
.env.*.local
node_modules/
dist/
sord-backend/node_modules/
sord-backend/dist/
```

**Verificar se está ignorando:**
```bash
git status
# Não deve listar .env ou .env.local
```

---

## 🔄 Reinicar após Problemas

### Reset Completo (Perda de Dados ⚠️)

```bash
# 1. Parar servidores (Ctrl+C nos terminals)

# 2. Deletar dependências
rm -rf node_modules sord-backend/node_modules

# 3. Deletar banco de dados
psql -U postgres -c "DROP DATABASE sord_db;"

# 4. Limpar variáveis
rm .env.local sord-backend/.env

# 5. Reinstalar tudo
npm install
cd sord-backend
npm install
cp .env.example .env
# ... editar .env

# 6. Recriar banco
psql -U postgres -c "CREATE DATABASE sord_db;"
npm run migrate

# 7. Iniciar novamente
npm run dev  # Frontend (terminal 1)
# Em terminal 2:
cd sord-backend && npm run dev
```

---

## 📚 Referências de Configuração

- [Node.js Setup](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Mercado Pago Docs](https://www.mercadopago.com.br/developers)
- [React Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Configuração completa pronta!** 🎉

Agora você pode começar a desenvolver com segurança e profissionalismo.
