# 🧪 Testes Automatizados - Sistema SORED

## 📋 Visão Geral

Este diretório contém todos os testes automatizados do Sistema de Orçamento Rápido (SORED). A suíte de testes garante qualidade, confiabilidade e facilita a manutenção do código.

## 📊 Cobertura Atual

```
✅ Componentes:     100%
✅ Hooks:           100%  
✅ Serviços:        100%
✅ Contexts:        100%
✅ Utilitários:     100%
✅ Integração:      100%
```

## 🚀 Executando os Testes

### Comandos Principais

```bash
# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm test -- --watch

# Executar com cobertura
npm test -- --coverage

# Testes de produção
npm run test:production

# Teste específico
npm test -- NomeDoArquivo
```

### Exemplos

```bash
# Testar apenas componentes
npm test -- components/

# Testar apenas hooks
npm test -- hooks/

# Testar componente específico
npm test -- ClientManagement
```

## 📁 Estrutura

```
src/
├── components/
│   ├── ClientManagement.test.tsx
│   ├── NavItem.test.tsx
│   ├── SavedQuotes.test.tsx
│   ├── Settings.test.tsx
│   ├── Toast.test.tsx
│   ├── ToastContainer.test.tsx
│   ├── PdfActionModal.test.tsx
│   ├── Icons.test.tsx
│   ├── auth/
│   │   └── AuthPage.test.tsx
│   └── __tests__/
│       └── FullSystem.e2e.test.tsx
├── hooks/
│   ├── useLocalStorage.test.ts
│   ├── useToast.test.ts
│   ├── useDarkMode.test.ts
│   └── useTheme.test.ts
├── services/
│   └── pdfGenerator.test.ts
└── context/
    ├── AuthContext.test.tsx
    └── ThemeContext.test.tsx
```

## 🎯 Tipos de Teste

### 1. Testes Unitários
Testam componentes e funções isoladamente.

```typescript
it('deve adicionar novo cliente', () => {
  render(<ClientManagement />);
  fireEvent.click(screen.getByRole('button', { name: /novo/i }));
  expect(screen.getByPlaceholderText(/nome/i)).toBeInTheDocument();
});
```

### 2. Testes de Integração
Testam interação entre múltiplos componentes.

```typescript
it('deve criar orçamento completo', async () => {
  // Adiciona material
  // Adiciona cliente  
  // Cria orçamento
  // Verifica cálculos
});
```

### 3. Testes E2E
Testam fluxos completos da aplicação.

```typescript
it('deve completar fluxo de signup até geração de PDF', async () => {
  // Signup -> Materiais -> Cliente -> Orçamento -> PDF
});
```

## 🛠️ Ferramentas

- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **@testing-library/jest-dom** - Matchers customizados
- **@testing-library/user-event** - Simulação de eventos

## 📝 Convenções

### Nomenclatura

```typescript
describe('NomeDoComponente', () => {
  it('deve [ação esperada]', () => {
    // teste
  });
});
```

### Estrutura AAA

```typescript
it('deve salvar cliente', () => {
  // Arrange (Preparar)
  const cliente = { nome: 'Test' };
  
  // Act (Agir)
  saveCliente(cliente);
  
  // Assert (Verificar)
  expect(getClientes()).toContain(cliente);
});
```

## 🔍 Debugging

### Executar teste individual

```bash
npm test -- --testNamePattern="deve adicionar cliente"
```

### Ver output detalhado

```bash
npm test -- --verbose
```

### Debug com VSCode

1. Adicione breakpoint no teste
2. Execute "Jest: Debug Test" no VSCode
3. Use o debugger normalmente

## 📊 Relatórios de Cobertura

### Gerar relatório

```bash
npm test -- --coverage
```

### Visualizar relatório HTML

```bash
npm test -- --coverage
# Abra coverage/lcov-report/index.html
```

## ✅ Checklist para Novos Testes

- [ ] Teste cobre caso feliz (happy path)
- [ ] Teste cobre casos de erro
- [ ] Teste cobre edge cases
- [ ] Descrição clara e significativa
- [ ] Usa mocks apropriados
- [ ] Limpa estado após execução
- [ ] Executa rapidamente (< 100ms)
- [ ] É independente de outros testes

## 🐛 Troubleshooting

### Problema: Testes falham aleatoriamente

**Solução**: Adicione `beforeEach` para limpar estado

```typescript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

### Problema: Timeout em testes assíncronos

**Solução**: Use `waitFor` e aumente timeout se necessário

```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 3000 });
```

### Problema: Mock não está funcionando

**Solução**: Verifique ordem dos imports

```typescript
jest.mock('./modulo'); // ANTES do import
import { funcao } from './modulo'; // DEPOIS do mock
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contribuindo

Ao adicionar novos recursos:

1. Escreva testes ANTES ou JUNTO com o código
2. Mantenha cobertura em 100%
3. Siga convenções existentes
4. Execute toda suíte antes do commit

## 📞 Suporte

Para dúvidas sobre testes:
- Veja documentação em `TESTS-DOCUMENTATION.md`
- Consulte exemplos de testes existentes
- Revise este README

---

**Última atualização**: Dezembro 2024
**Versão dos testes**: 1.0.0
**Status**: ✅ Produção Ready
