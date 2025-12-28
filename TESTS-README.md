# 📋 GUIA DE TESTES AUTOMATIZADOS - SORD

## 📊 Visão Geral

O SORD possui uma suite completa de testes automatizados cobrindo:
- ✅ **Backend** - Controllers, Services, Utils (Node.js + TypeScript)
- ✅ **Frontend** - Components, Services (React)
- ✅ **Integração** - Fluxos de autenticação e pagamento

---

## 🚀 Começando com Testes

### Instalação
```bash
# Instalar dependências (já feito)
npm install

# Backend
cd sord-backend && npm install

# Frontend
cd sored-novo && npm install
```

### Executar Todos os Testes
```bash
# Do diretório raiz
npm run test:all

# Com cobertura
npm run test:coverage

# Em modo watch (desenvolvedor)
npm run test:watch
```

---

## 🏢 Backend Tests

**Localização:** `sord-backend/src/__tests__`

### Estrutura
```
__tests__/
├── controllers/
│   └── authController.test.ts      # Testes de autenticação
├── services/
│   ├── planService.test.ts         # Testes de planos
│   └── paymentService.test.ts      # Testes de pagamentos
└── utils/
    └── auth.test.ts                # Testes de JWT e middleware
```

### Executar Testes Backend
```bash
cd sord-backend

# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura de código
npm run test:coverage

# CI/CD mode
npm run test:ci
```

### 🧪 Testes de Controllers

#### **authController.test.ts**
- ✅ Registrar novo usuário com plano
- ✅ Validar email único
- ✅ Validar campos obrigatórios
- ✅ Login com credenciais corretas
- ✅ Rejeitar senha incorreta
- ✅ Rejeitar email não encontrado

```bash
npm test -- authController
```

### 🧪 Testes de Services

#### **planService.test.ts**
- ✅ Obter planos ativos
- ✅ Obter plano por ID
- ✅ Obter plano por nome
- ✅ Inicializar planos padrão
- ✅ Lidar com erros de banco de dados

```bash
npm test -- planService
```

#### **paymentService.test.ts**
- ✅ Processar pagamento válido
- ✅ Validar valor do pagamento
- ✅ Validar email
- ✅ Suportar até 12 parcelas
- ✅ Obter status do pagamento
- ✅ Retornar erro para pagamento não encontrado

```bash
npm test -- paymentService
```

### 🧪 Testes de Utils

#### **auth.test.ts**
- ✅ Gerar token JWT válido
- ✅ Verificar middleware de autenticação
- ✅ Extrair token do header Authorization
- ✅ Rejeitar token inválido
- ✅ Rejeitar token expirado
- ✅ Anexar dados do usuário ao request

```bash
npm test -- auth.test
```

### Exemplo de Teste
```typescript
it('deve registrar novo usuário com plano mensal', async () => {
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    billingCycle: 'monthly'
  };

  const result = await authAPI.register(userData);

  expect(result.success).toBe(true);
  expect(result.data.token).toBeDefined();
});
```

---

## 🎨 Frontend Tests

**Localização:** `sored-novo/src/__tests__`

### Estrutura
```
__tests__/
├── components/
│   ├── PlansList.test.tsx          # Testes de exibição de planos
│   └── QuoteCalculator.test.tsx    # Testes de calculadora
├── services/
│   └── api.test.ts                 # Testes de chamadas API
└── utils/
    └── (testes adicionais)
```

### Executar Testes Frontend
```bash
cd sored-novo

# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura de código
npm run test:coverage

# CI/CD mode
npm run test:ci
```

### 🧪 Testes de Componentes

#### **PlansList.test.tsx**
- ✅ Carregar e exibir planos
- ✅ Mostrar preços corretos (R$ 100/R$ 1.100)
- ✅ Exibir "Melhor Economia" para plano anual
- ✅ Exibir 8% de economia
- ✅ Listar features dos planos
- ✅ Chamar callback ao selecionar plano
- ✅ Exibir erro ao falhar carregamento
- ✅ Fazer fetch para API correta

```bash
npm test -- PlansList
```

#### **QuoteCalculator.test.tsx**
- ✅ Renderizar componente
- ✅ Inserir nome do cliente
- ✅ Ajustar margem de lucro
- ✅ Ativar/desativar frete
- ✅ Calcular custos
- ✅ Resetar formulário
- ✅ Carregar orçamento para edição
- ✅ Permitir inserir custo de mão de obra
- ✅ Gerar PDF

```bash
npm test -- QuoteCalculator
```

### 🧪 Testes de Services

#### **api.test.ts**
- ✅ Registrar usuário
- ✅ Fazer login
- ✅ Obter perfil (com autenticação)
- ✅ Buscar planos
- ✅ Criar pagamento
- ✅ Enviar token de autenticação
- ✅ Lidar com erros de rede
- ✅ Usar mensagem de erro padrão

```bash
npm test -- api.test
```

### Exemplo de Teste
```typescript
it('deve carregar e exibir planos', async () => {
  render(<PlansList />);

  await waitFor(() => {
    expect(screen.getByText('Plano Mensal')).toBeInTheDocument();
    expect(screen.getByText('Plano Anual')).toBeInTheDocument();
  });

  expect(screen.getByText('R$ 100')).toBeInTheDocument();
});
```

---

## 📊 Cobertura de Código

### Exibir Cobertura
```bash
# Backend
cd sord-backend && npm run test:coverage

# Frontend
cd sored-novo && npm run test:coverage

# Ambos
npm run test:coverage
```

### Limites Mínimos
Configurado em `jest.config.cjs`:
- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 50%
- **Statements:** 50%

### Relatório HTML
Após executar cobertura, veja o relatório em:
```
# Backend
sord-backend/coverage/lcov-report/index.html

# Frontend
sored-novo/coverage/lcov-report/index.html
```

---

## 🔄 Integração Contínua (CI/CD)

### GitHub Actions / Azure Pipelines
```bash
# Modo CI
npm run test:ci

# Apenas Backend
npm run test:backend:ci

# Apenas Frontend
npm run test:frontend:ci
```

### Configuração do Jest para CI
- Máximo 2 workers
- Coverage habilitado
- Modo não-watch

---

## 🛠️ Mocks Utilizados

### Backend
- **Mongoose Models:** `jest.mock('../../db/models.js')`
- **Logger:** `jest.mock('../../utils/logger.js')`
- **JWT:** `jest.mock('jsonwebtoken')`

### Frontend
- **Fetch Global:** `global.fetch = jest.fn()`
- **Context:** `jest.mock('../../context/DataContext')`
- **Serviços:** `jest.mock('../../services/...')`

---

## 📝 Escrevendo Novos Testes

### Template Backend
```typescript
import { functionToTest } from '../../path/file.js';

jest.mock('../../path/dependency.js');

describe('FunctionName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve fazer algo específico', async () => {
    const input = { /* dados */ };
    const result = await functionToTest(input);
    
    expect(result).toEqual(expected);
  });
});
```

### Template Frontend
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from '../../components/Component';

describe('Component', () => {
  it('deve renderizar corretamente', () => {
    render(<Component />);
    expect(screen.getByText(/text/i)).toBeInTheDocument();
  });

  it('deve responder a interações', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});
```

---

## 🐛 Troubleshooting

### Testes não encontram módulos
```bash
# Limpar cache
npm test -- --clearCache

# Reconstruir
tsc
```

### Problema com imports ESM no backend
- Usar `--loader ts-node/esm` (já configurado)
- Usar extensões `.js` nas imports
- Confirmar `"type": "module"` em package.json

### Testes timeout
```bash
# Aumentar timeout (em jest.setup.cjs)
testTimeout: 20000
```

### Mock não funciona
```typescript
// Verificar que mock está ANTES da import
jest.mock('module');
import { function } from 'module';
```

---

## 📈 Próximos Passos

### Testes E2E (Opcional)
```bash
# Instalar Cypress/Playwright
npm install --save-dev cypress playwright

# Criar testes E2E
mkdir e2e && mkdir e2e/tests
```

### Testes de Carga
```bash
npm install --save-dev k6 @loadimpact/k6
```

### Coverage Reporter
```bash
npm install --save-dev coveralls
```

---

## 📚 Documentação Útil

- [Jest Docs](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ Checklist de Testes

- [x] Testes de controllers (Auth, Payment, Plans)
- [x] Testes de services (Plans, Payment)
- [x] Testes de utilidades (Auth, JWT)
- [x] Testes de componentes React (PlansList, QuoteCalculator)
- [x] Testes de API (Frontend)
- [x] Cobertura de código configurada
- [x] Scripts de teste no package.json
- [x] Jest configurado para ambos os projetos
- [ ] Testes E2E (futuro)
- [ ] Testes de carga (futuro)

---

**Última atualização:** Dezembro 2025  
**Status:** ✅ Pronto para uso
