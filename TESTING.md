# 🧪 Testes Automatizados - SORD

## 📋 Visão Geral

O projeto SORD possui testes automatizados abrangentes para garantir qualidade e confiabilidade do código. Os testes cobrem:

- ✅ **Frontend**: Componentes React (Landing Page, Payment Page, etc.)
- ✅ **Backend**: Serviços e APIs (Mercado Pago, Auth, etc.)
- ✅ **Integração**: Fluxo completo de navegação

## 🚀 Como Executar Testes

### Frontend (React/Jest)

```bash
cd sord-frontend

# Rodar testes uma vez
npm test

# Rodar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# CI/CD (para pipelines)
npm run test:ci
```

### Backend (Node/Jest)

```bash
cd sord-backend

# Rodar testes uma vez
npm test

# Rodar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# CI/CD
npm run test:ci
```

### Todos os Testes (Root)

```bash
cd sord-sistema-de-or-amento-rapido-principal-main

# Rodar testes frontend e backend sequencialmente
npm run test:all

# Ou execute em terminals separados
```

## 📊 Cobertura de Testes

### Frontend

#### Componentes Testados:
1. **LandingPage.test.tsx** (9 testes)
   - ✅ Renderização de título principal
   - ✅ Renderização de navbar com branding
   - ✅ Renderização de cards de funcionalidades
   - ✅ Renderização de seção de benefícios
   - ✅ Interação com botão CTA
   - ✅ Rastreamento de mouse para efeito 3D
   - ✅ Renderização de footer
   - ✅ Layout responsivo

2. **PaymentPage.test.tsx** (10 testes)
   - ✅ Renderização do formulário de pagamento
   - ✅ Estado de carregamento
   - ✅ Inputs de nome e email
   - ✅ Submissão com dados válidos
   - ✅ Validação de campos obrigatórios
   - ✅ Tratamento de erro de API
   - ✅ Desabilitação durante processamento
   - ✅ Modo teste notice
   - ✅ Contato de suporte

3. **App.test.tsx** (5 testes)
   - ✅ Renderização inicial (Landing Page)
   - ✅ Navegação para Payment Page
   - ✅ Navegação para Auth após pagamento
   - ✅ Retorno para Landing após erro
   - ✅ Renderização de MainLayout quando autenticado

#### Componentes Existentes:
- AuthPage.test.tsx
- QuoteCalculator.test.tsx
- PaymentForm.test.tsx
- PlansList.test.tsx

### Backend

#### Serviços Testados:
1. **mercadoPagoService.test.ts** (7 testes)
   - ✅ Validação de campos obrigatórios
   - ✅ Aceitação de requisição válida
   - ✅ Rejeição de email inválido
   - ✅ Rejeição de valor zero
   - ✅ Rejeição de parcelas inválidas
   - ✅ Cálculo de taxa por método
   - ✅ Cálculo de valor de parcela

#### Serviços Existentes:
- authController.test.ts
- paymentController.test.ts
- planController.test.ts
- paymentService.test.ts
- planService.test.ts
- auth.test.ts

## 📈 Relatório de Cobertura

### Limites Configurados

O projeto exige uma cobertura mínima de **70%** em:
- Branches (decisões no código)
- Functions (funções/métodos)
- Lines (linhas de código)
- Statements (instruções)

```javascript
// jest.config.cjs
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Gerar Relatório

```bash
npm run test:coverage
```

Abre um relatório em HTML:
- `./coverage/index.html`

## 🏗️ Estrutura de Testes

### Frontend
```
sord-frontend/src/
├── components/
│   └── __tests__/
│       ├── App.test.tsx
│       ├── AuthPage.test.tsx
│       ├── LandingPage.test.tsx
│       ├── PaymentPage.test.tsx
│       ├── PaymentForm.test.tsx
│       ├── PlansList.test.tsx
│       └── QuoteCalculator.test.tsx
├── context/
│   └── __tests__/
│       └── AuthContext.test.tsx
├── services/
│   └── __tests__/
│       └── api.test.ts
└── hooks/
    └── __tests__/
        └── useLocalStorage.test.ts
```

### Backend
```
sord-backend/src/
└── __tests__/
    ├── controllers/
    │   ├── authController.test.ts
    │   ├── clientController.extra.test.ts
    │   ├── paymentController.extra.test.ts
    │   └── planController.extra.test.ts
    ├── services/
    │   ├── mercadoPagoService.test.ts
    │   ├── paymentService.test.ts
    │   └── planService.test.ts
    └── utils/
        └── auth.test.ts
```

## 🔧 Configuração do Jest

### Frontend (jest.config.cjs)
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
}
```

### Backend (jest.config.cjs)
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

## 📝 Escrevendo Novos Testes

### Exemplo Frontend (React)

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render with text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click event', async () => {
    const user = userEvent.setup();
    const mockFn = jest.fn();
    
    render(<MyComponent onClick={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Exemplo Backend (Node)

```typescript
import { MyService } from '../MyService';

describe('MyService', () => {
  it('should validate input', () => {
    const service = new MyService();
    expect(() => service.validate({})).toThrow();
  });

  it('should process valid data', () => {
    const service = new MyService();
    const result = service.process({ valid: true });
    expect(result).toBeDefined();
  });
});
```

## 🎯 Melhores Práticas

1. **Teste Unitários**: Testa uma unidade de código isoladamente
2. **Testes de Integração**: Testa interação entre componentes
3. **Testes E2E**: Testa fluxo completo do usuário

4. **Naming**: Descreva claramente o que está sendo testado
   ```typescript
   it('should show error message when email is invalid')
   ```

5. **AAA Pattern** (Arrange-Act-Assert):
   ```typescript
   // Arrange: Setup
   const user = new User('test@example.com');
   
   // Act: Executa
   const isValid = user.validateEmail();
   
   // Assert: Verifica
   expect(isValid).toBe(false);
   ```

6. **Mocking**: Use mocks para dependências externas
   ```typescript
   jest.mock('../api', () => ({
     fetchData: jest.fn(() => Promise.resolve(data))
   }));
   ```

## 🔄 CI/CD Integration

### GitHub Actions (Exemplo)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      
      - run: npm install
      - run: npm run test:ci
      - run: npm run lint
```

## 📊 Próximas Melhorias

- [ ] Aumentar cobertura para 80%+
- [ ] Adicionar testes E2E com Playwright
- [ ] Implementar visual regression testing
- [ ] Setup de CI/CD pipeline
- [ ] Performance testing
- [ ] Load testing

## 🆘 Troubleshooting

### Testes não encontram componentes
```bash
# Limpe cache
npm test -- --clearCache
```

### Erro: "Cannot find module"
```bash
# Reinstale dependências
rm -rf node_modules
npm install
```

### Timeout em testes assíncronos
```typescript
it('async test', async () => {
  // Aumentar timeout
}, 10000);
```

---

**Criada em**: 01/01/2026
**Versão**: 1.0
