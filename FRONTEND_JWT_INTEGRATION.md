# 🔐 Integração JWT - Frontend & Backend

## ✅ Migração Completa de LocalStorage para JWT

O frontend foi completamente refatorado para usar autenticação JWT com o backend MongoDB.

## 📁 Arquivos Modificados/Criados

### Novos Arquivos

1. **`src/services/api.ts`** - Cliente API centralizado
   - Gerenciamento automático de tokens JWT
   - Interceptor para adicionar `Authorization: Bearer {token}` em todas as requisições
   - Auto-redirecionamento para login em caso de 401 (não autorizado)
   - Funções de autenticação (login, register, getProfile)
   - Funções de clientes (CRUD completo)
   - Funções de pagamentos (integração Mercado Pago)

2. **`.env.example`** - Variáveis de ambiente do frontend

### Arquivos Modificados

1. **`src/context/AuthContext.tsx`**
   - ❌ Removido: localStorage para usuários/senhas
   - ❌ Removido: hash de senha no frontend
   - ✅ Adicionado: Chamadas à API `/api/auth/login` e `/api/auth/register`
   - ✅ Adicionado: Carregamento automático do perfil ao iniciar
   - ✅ Adicionado: Estado `isLoading` para feedback visual
   - ✅ Token armazenado em `localStorage` como `sored_jwt_token`

2. **`src/services/paymentService.ts`**
   - Simplificado: Agora re-exporta funções da `api.ts`
   - Todas as requisições incluem automaticamente o token JWT

3. **`src/types.ts`**
   - Interface `User` atualizada com campos do backend (role, name)
   - Campo `passwordHash` agora opcional (compatibilidade)

4. **`src/App.tsx`**
   - Adicionado: Tela de loading enquanto verifica autenticação
   - Melhora experiência do usuário durante inicialização

## 🔄 Fluxo de Autenticação

### 1. Registro de Novo Usuário
```typescript
// Frontend: src/context/AuthContext.tsx
const signup = async (companyName, email, password) => {
  const response = await registerAPI({ name: companyName, email, password });
  // Backend cria usuário + tenant e retorna JWT
  setCurrentUser(response.user);
  // Token armazenado automaticamente em localStorage
};
```

**Backend:** `POST /api/auth/register`
- Cria usuário com senha hash (bcrypt)
- Cria tenant único
- Retorna JWT token + dados do usuário

### 2. Login
```typescript
// Frontend: src/context/AuthContext.tsx
const login = async (email, password) => {
  const response = await loginAPI({ email, password });
  // Backend valida credenciais e retorna JWT
  setCurrentUser(response.user);
  // Token armazenado automaticamente em localStorage
};
```

**Backend:** `POST /api/auth/login`
- Valida email e senha (bcrypt)
- Gera JWT token (7 dias de validade)
- Retorna token + dados do usuário

### 3. Carregamento Automático
```typescript
// Frontend: src/context/AuthContext.tsx (useEffect)
useEffect(() => {
  const token = TokenManager.getToken();
  if (token) {
    const user = await getProfileAPI(); // GET /api/auth/profile
    setCurrentUser(user);
  }
}, []);
```

**Backend:** `GET /api/auth/profile` (protegido)
- Valida JWT token
- Retorna dados atualizados do usuário

### 4. Requisições Autenticadas
```typescript
// Frontend: src/services/api.ts
async function fetchWithAuth(url, options) {
  const token = TokenManager.getToken();
  
  headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(url, { ...options, headers });
  
  // Se 401, limpa token e redireciona para login
  if (response.status === 401) {
    TokenManager.removeToken();
    window.location.href = '/login';
  }
}
```

Todas as requisições a endpoints protegidos incluem automaticamente o token:
- `POST /api/clients`
- `GET /api/clients`
- `POST /api/payments`
- `GET /api/payments`
- etc.

### 5. Logout
```typescript
// Frontend: src/context/AuthContext.tsx
const logout = () => {
  logoutAPI(); // Remove token do localStorage
  setCurrentUser(null);
};
```

## 🔒 Segurança Implementada

### Frontend
✅ Token armazenado em `localStorage` (pode migrar para `httpOnly cookie` depois)
✅ Token removido automaticamente em caso de 401
✅ Redirecionamento automático para login quando não autenticado
✅ Todas as senhas enviadas via HTTPS em produção (configure)
✅ Token incluído em todas as requisições via header `Authorization`

### Backend
✅ Senhas nunca armazenadas em texto puro (bcrypt com salt 10)
✅ JWT tokens com expiração de 7 dias
✅ Middleware de autenticação valida token em todas as rotas protegidas
✅ Multi-tenant: Dados isolados por `tenantId`
✅ Validação Joi em todos os endpoints

## 📡 API Endpoints Disponíveis

### Autenticação (Públicos)
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Autenticação (Protegidos)
- `GET /api/auth/profile` - Obter perfil do usuário

### Clientes (Todos Protegidos)
- `POST /api/clients` - Criar cliente
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obter cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente (soft delete)

### Pagamentos (Todos Protegidos)
- `POST /api/payments` - Processar pagamento
- `GET /api/payments/:orderId` - Status do pagamento
- `GET /api/payments` - Listar pagamentos

### Webhooks (Público - Mercado Pago)
- `POST /api/webhooks/mercadopago` - Receber notificações

## 🎯 Como Usar no Frontend

### Exemplo: Criar Cliente
```typescript
import { createClient } from '../services/api';

const handleCreateClient = async () => {
  try {
    const newClient = await createClient({
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      cpfCnpj: '123.456.789-00',
      address: {
        street: 'Rua Exemplo',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    });
    console.log('Cliente criado:', newClient);
  } catch (error) {
    console.error('Erro:', error.message);
  }
};
```

### Exemplo: Processar Pagamento
```typescript
import { createPayment } from '../services/paymentService';

const handlePayment = async () => {
  try {
    const payment = await createPayment({
      orderId: 'ORD-123',
      amount: 100.00,
      token: 'card_token_from_mp',
      paymentMethodId: 'visa',
      installments: 1,
      email: 'cliente@example.com',
      description: 'Compra de produto X'
    });
    console.log('Pagamento processado:', payment);
  } catch (error) {
    console.error('Erro:', error.message);
  }
};
```

## 🚀 Configuração

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/sord
JWT_SECRET=sua_chave_secreta_minimo_32_caracteres
MERCADO_PAGO_ACCESS_TOKEN=seu_token_mercado_pago
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## 🔄 Migração de Dados Antigos

Os dados antigos armazenados em `localStorage` (usuários, senhas hash) **não serão migrados automaticamente**.

**Opções:**
1. **Recomeçar do zero:** Usuários criam novas contas
2. **Migração manual:** Script para ler localStorage e criar via API

Para opção 2, criar script em `scripts/migrate-users.ts`:
```typescript
// Ler localStorage: sored_users, sored_tenants
// Para cada usuário, chamar POST /api/auth/register
// Nota: Senhas antigas não podem ser recuperadas (estão "hasheadas")
// Usuários precisarão redefinir senhas
```

## 📋 Checklist de Deploy

### Frontend
- [ ] Configure `VITE_API_URL` para URL de produção
- [ ] Configure HTTPS (essencial para segurança)
- [ ] Build: `npm run build`
- [ ] Deploy dos arquivos `dist/` para servidor

### Backend
- [ ] Configure MongoDB Atlas ou servidor MongoDB
- [ ] Configure variáveis de ambiente (`.env`)
- [ ] Configure `JWT_SECRET` forte (32+ caracteres aleatórios)
- [ ] Configure `MERCADO_PAGO_ACCESS_TOKEN` de produção
- [ ] Configure `FRONTEND_URL` correto para CORS
- [ ] Build: `npm run build`
- [ ] Start: `npm start` ou PM2

## 🐛 Troubleshooting

### "401 Unauthorized"
- ✅ Verifique se o token existe: `localStorage.getItem('sored_jwt_token')`
- ✅ Verifique se o backend está rodando
- ✅ Verifique se o `JWT_SECRET` é o mesmo no backend
- ✅ Tente fazer logout e login novamente

### "Network Error"
- ✅ Verifique se `VITE_API_URL` está correto
- ✅ Verifique se o backend está rodando na porta 3001
- ✅ Verifique CORS no backend (`FRONTEND_URL`)

### "Token inválido"
- ✅ Token pode ter expirado (7 dias)
- ✅ JWT_SECRET mudou no backend
- ✅ Limpe localStorage e faça login novamente

## 📚 Próximos Passos

1. **Refresh Tokens:** Implementar tokens de renovação para sessões mais longas
2. **Remember Me:** Opção para aumentar validade do token
3. **2FA:** Autenticação de dois fatores (email/SMS)
4. **Recuperação de Senha:** Endpoint para reset de senha via email
5. **HttpOnly Cookies:** Migrar token de localStorage para cookie seguro
6. **Rate Limiting:** Limitar tentativas de login (prevenir brute force)

---

✅ **Frontend 100% integrado com backend JWT!**
