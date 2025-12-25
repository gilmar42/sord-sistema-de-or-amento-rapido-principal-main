# 🚀 SORD Backend API - Documentação Completa

Sistema de backend completo com **autenticação JWT**, **MongoDB**, **multi-tenant** e **integração Mercado Pago**.

---

## 📋 Índice
- [Autenticação](#-autenticação)
- [Clientes](#-clientes)
- [Pagamentos](#-pagamentos)
- [Estrutura](#-estrutura-de-dados)

---

## 🔐 Autenticação

### POST /api/auth/register
Registrar novo usuário/empresa.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123",
  "companyName": "Minha Empresa LTDA"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "companyName": "Minha Empresa LTDA",
      "tenantId": "T-1234567890-abc123",
      "role": "admin"
    }
  }
}
```

---

### POST /api/auth/login
Fazer login.

**Request:**
```json
{
  "email": "joao@empresa.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "companyName": "Minha Empresa LTDA",
      "tenantId": "T-1234567890-abc123",
      "role": "admin"
    }
  }
}
```

---

### GET /api/auth/profile
Obter perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "companyName": "Minha Empresa LTDA",
    "tenantId": "T-1234567890-abc123",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 👥 Clientes

### POST /api/clients
Criar novo cliente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Cliente Exemplo LTDA",
  "email": "contato@cliente.com",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "notes": "Cliente VIP"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "name": "Cliente Exemplo LTDA",
    "email": "contato@cliente.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "address": { "..." },
    "active": true,
    "tenantId": "T-1234567890-abc123",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /api/clients
Listar clientes.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `active` (optional): `true` ou `false`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "name": "Cliente Exemplo LTDA",
      "email": "contato@cliente.com",
      "phone": "(11) 98765-4321",
      "active": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/clients/:id
Obter cliente específico.

**Headers:**
```
Authorization: Bearer {token}
```

---

### PUT /api/clients/:id
Atualizar cliente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:** (mesma estrutura do POST)

---

### DELETE /api/clients/:id
Desativar cliente (soft delete).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cliente desativado com sucesso"
}
```

---

## 💳 Pagamentos

### POST /api/payments
Processar pagamento via Mercado Pago.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "orderId": "ORD-2024-001",
  "amount": 150.00,
  "token": "card_token_from_mercadopago",
  "paymentMethodId": "visa",
  "installments": 3,
  "email": "cliente@email.com",
  "description": "Pagamento Orçamento #001",
  "issuerId": "123",
  "metadata": {
    "quoteId": "507f191e810c19729de860ea"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "payment": {
    "id": "123456789",
    "status": "approved",
    "status_detail": "accredited",
    "amount": 150.00,
    "description": "Pagamento Orçamento #001"
  }
}
```

---

### GET /api/payments/:orderId
Obter status do pagamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "orderId": "ORD-2024-001",
    "amount": 150.00,
    "status": "approved",
    "description": "Pagamento Orçamento #001",
    "paymentMethod": "visa",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /api/payments
Listar pagamentos.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `status` (optional): `pending`, `approved`, `rejected`, etc.
- `limit` (optional): número de registros (default: 20)
- `offset` (optional): paginação (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

---

## 📊 Estrutura de Dados

### User (Usuário)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string (hashed),
  companyName: string,
  tenantId: string,
  role: 'admin' | 'user',
  active: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Client (Cliente)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  cpf?: string,
  cnpj?: string,
  address?: {
    street: string,
    number: string,
    complement?: string,
    neighborhood: string,
    city: string,
    state: string,
    zipCode: string
  },
  notes?: string,
  active: boolean,
  tenantId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment (Pagamento)
```typescript
{
  _id: ObjectId,
  paymentId: string,
  orderId: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded',
  amount: number,
  description: string,
  paymentMethod?: string,
  installments: number,
  payer: {
    email: string,
    identification?: {
      type: string,
      number: string
    },
    name?: string
  },
  tenantId: string,
  metadata?: any,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Segurança

### Autenticação JWT
- Token válido por 7 dias
- Incluir no header: `Authorization: Bearer {token}`
- Todas as rotas (exceto auth) requerem autenticação

### Multi-Tenant
- Cada empresa tem um `tenantId` único
- Dados isolados por tenant
- Usuários só acessam dados do próprio tenant

---

## 🚀 Inicializar

1. Configure MongoDB:
```bash
MONGODB_URI=mongodb://localhost:27017/sord_db
```

2. Configure JWT:
```bash
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres
```

3. Configure Mercado Pago:
```bash
MERCADO_PAGO_ACCESS_TOKEN=TEST-your-token
```

4. Inicie o servidor:
```bash
npm run dev
```

---

## 📝 Códigos de Erro

- `400` - Requisição inválida
- `401` - Não autenticado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

---

## 🧪 Testando a API

### 1. Registrar:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@test.com","password":"123456","companyName":"Minha Empresa"}'
```

### 2. Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@test.com","password":"123456"}'
```

### 3. Criar Cliente:
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Cliente Teste","email":"cliente@test.com","phone":"11999999999"}'
```
