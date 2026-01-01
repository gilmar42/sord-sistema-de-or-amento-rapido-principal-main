# 🧪 Testes Automatizados - Guia Rápido

## ⚡ Executar Testes Rapidamente

### Frontend

```bash
cd sord-frontend

# Teste uma vez
npm test

# Teste em modo watch (reexecuta ao salvar)
npm run test:watch

# Teste com cobertura
npm run test:coverage

# Teste em CI (sem watch)
npm run test:ci
```

### Backend

```bash
cd sord-backend

# Teste uma vez
npm test

# Teste em modo watch
npm run test:watch

# Teste com cobertura
npm run test:coverage

# Teste em CI
npm run test:ci
```

## 📊 Testes Implementados

### Frontend (24 testes)
✅ **LandingPage.test.tsx** (9 testes)
- Renderização do título
- Navbar com branding
- Cards de funcionalidades
- Seção de benefícios
- Botões CTA
- Efeito 3D do mouse
- Footer
- Layout responsivo

✅ **PaymentPage.test.tsx** (10 testes)
- Renderização do formulário
- Estado de carregamento
- Inputs de nome/email
- Submissão com dados válidos
- Validação de campos
- Tratamento de erros
- Desabilitação durante processamento
- Modo teste notice
- Contato de suporte

✅ **App.test.tsx** (5 testes)
- Landing page inicial
- Navegação para pagamento
- Navegação para auth
- Retorno após erro
- MainLayout quando autenticado

### Backend (7+ testes)
✅ **mercadoPagoService.test.ts**
- Validação de campos obrigatórios
- Aceitação de requisição válida
- Rejeição de email inválido
- Rejeição de valor zero
- Rejeição de parcelas inválidas
- Cálculo de taxa
- Cálculo de parcela

## 📈 Cobertura Mínima

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🎯 Como os Testes Funcionam

### Frontend (Jest + React Testing Library)
```typescript
// Renderiza componente
render(<LandingPage onNavigateToAuth={mockFn} />);

// Procura elementos
expect(screen.getByText('SORED')).toBeInTheDocument();

// Simula interações
await user.click(screen.getByRole('button'));

// Verifica chamadas
expect(mockFn).toHaveBeenCalled();
```

### Backend (Jest + Node)
```typescript
// Valida entrada
expect(() => service.validate({})).toThrow();

// Processa dados
const result = service.process({ valid: true });

// Verifica resultado
expect(result).toBeDefined();
```

## 📁 Estrutura

```
sord-frontend/
├── src/
│   └── components/
│       └── __tests__/
│           ├── App.test.tsx
│           ├── LandingPage.test.tsx
│           ├── PaymentPage.test.tsx
│           └── [outros testes]
└── coverage/
    └── index.html          # Relatório HTML

sord-backend/
├── src/
│   └── __tests__/
│       ├── controllers/
│       ├── services/
│       │   └── mercadoPagoService.test.ts
│       └── utils/
└── coverage/
    └── index.html          # Relatório HTML
```

## 🔧 Configuração

- **Frontend**: `jest.config.cjs` + `jest.setup.cjs`
- **Backend**: `jest.config.cjs` + `jest.setup.cjs`
- **Build**: Vite (dev) + TypeScript (build)

## 🚀 CI/CD

Para usar em pipelines (GitHub Actions, GitLab CI, etc):

```bash
npm run test:ci
```

Isso executa:
- Testes sem modo watch
- Coleta cobertura
- Limite de workers (2)
- Output em formato CI

## 📊 Verificar Cobertura

Após rodar testes com cobertura:

```bash
# Frontend
cd sord-frontend && npm run test:coverage
# Abre: ./coverage/index.html

# Backend
cd sord-backend && npm run test:coverage
# Abre: ./coverage/index.html
```

## ⚠️ Troubleshooting

### Teste não roda
```bash
npm test -- --clearCache
```

### Timeout
```typescript
it('async test', async () => {
  // aumentar timeout para 10 segundos
}, 10000);
```

### Módulo não encontrado
```bash
rm -rf node_modules
npm install
npm test
```

## 📚 Recursos

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Testes implementados em**: 01/01/2026
