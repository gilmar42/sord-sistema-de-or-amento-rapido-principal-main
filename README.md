# 🚀 SORD - Sistema de Orçamento Rápido

Sistema completo de gestão de orçamentos com cálculos automáticos, gestão de materiais, clientes e pagamentos via Mercado Pago.

---

## ✨ Funcionalidades Principais

- 📊 **Calculadora de Orçamentos** - Cálculos automáticos de custos e margem de lucro
- 🔧 **Gestão de Materiais** - Cadastro de materiais e componentes
- 👥 **Gestão de Clientes** - CRUD completo de clientes
- 💳 **Pagamentos** - Integração com Mercado Pago (Checkout Transparente)
- 📄 **Geração de PDF** - Orçamentos profissionais
- 💾 **Persistência Local** - Dados salvos no navegador
- 🎨 **Dark Mode** - Interface moderna
- 📱 **Responsivo** - Funciona em todos os dispositivos

---

## 🛠️ Tecnologias

### Frontend
- React 18.2 + TypeScript
- Vite 5.4
- Tailwind CSS v4

### Backend
- Node.js + Express
- **MongoDB** + Mongoose
- Mercado Pago SDK

---

## 🚀 Instalação e Uso

### 1. Frontend

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: http://localhost:3000

### 2. Backend

```bash
# Entrar na pasta do backend
cd sord-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Executar migrations
npm run migrate

# Iniciar servidor
npm run dev
```

Acesse: http://localhost:3001

---

## 💳 Configurar Mercado Pago

### Configuração Rápida

1. Obtenha suas credenciais em: https://www.mercadopago.com.br/developers

2. Configure no arquivo `.env.local` (frontend):
```env
VITE_API_URL=http://localhost:3001/api
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxx
```

3. Configure no arquivo `sord-backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/sord_db
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres-aqui
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Testar Pagamentos

Use cartões de teste do Mercado Pago:

**Aprovado:**
```
5031 4332 1540 6351 | 11/25 | 123
```

**Recusado:**
```
5031 7557 3453 0604 | 11/25 | 123
```

---

## 📡 API Backend

A API completa está documentada em [`sord-backend/API_DOCUMENTATION.md`](sord-backend/API_DOCUMENTATION.md).

### Endpoints Principais:

**Autenticação:**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil (requer token)

**Clientes:**
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Desativar cliente

**Pagamentos:**
- `POST /api/payments` - Processar pagamento
- `GET /api/payments/:orderId` - Status do pagamento
- `GET /api/payments` - Listar pagamentos

---

## 📁 Estrutura do Projeto

```
sord/
├── src/                    # Frontend (React)
│   ├── components/         # Componentes React
│   ├── context/           # Context API
│   ├── hooks/             # Custom hooks
│   ├── services/          # Serviços (API, PDF)
│   └── utils/             # Utilitários
│
├── sord-backend/          # Backend (Node.js)
│   └── src/
│       ├── controllers/   # Controllers
│       ├── routes/        # Rotas
│       ├── services/      # Serviços (Mercado Pago)
│       └── db/            # Database
│
├── package.json           # Dependências frontend
├── vite.config.ts         # Configuração Vite
├── tailwind.config.js     # Configuração Tailwind
└── tsconfig.json          # Configuração TypeScript
```

---

## 🔧 Scripts Disponíveis

### Frontend
```bash
npm run dev           # Desenvolvimento
npm run build         # Build produção
npm run preview       # Preview do build
```

### Backend
```bash
npm run dev           # Desenvolvimento
npm run build         # Compilar TypeScript
npm start             # Produção
npm run migrate       # Executar migrations
```

---

## 🌐 Deploy

### Vercel (Frontend)
```bash
vercel --prod
```

### Heroku (Backend)
```bash
git push heroku main
```

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a gestão de orçamentos.
