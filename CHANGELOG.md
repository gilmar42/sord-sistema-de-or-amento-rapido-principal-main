# Changelog

## [2025-11-29] - Service Budget Feature & Corporate Theme

### ✨ Added
- **Orçamento de Serviços**: Nova página completa para orçamento de serviços
  - Interface em cards com campos: Título, Categoria, Descrição, Horas, R$/Hora, Custos Extra
  - Cálculo automático de totais por linha
  - Validações inline (título obrigatório, valores > 0, custos ≥ 0)
  - Feedback visual com bordas vermelhas em cards inválidos
  - Mensagem global de erro ao tentar salvar com problemas
  - Geração de PDF dedicada com colunas Serviço, Categoria, Descrição, Horas, R$/Hora, Custos Extra, Total
  - Persistência em LocalStorage

- **Tema Corporativo**: Substituição do modo claro legado por tema corporativo profissional
  - `corporate-dark`: Fundo neutro profundo com realces institucionais
  - `corporate-light`: Navbar azul escuro + superfícies claras com alto contraste
  - Tokens CSS dedicados (`--corp-*`) para cores, backgrounds, bordas, textos, acentos
  - Classes utilitárias: `corp-sidebar-*`, `corp-surface-*`, `corp-button-primary-*`, `corp-button-outline`, `corp-accent-badge`
  - Seletor de tema (`ThemeSelector`) com radio buttons para alternância
  - Hook `useTheme` com migração automática de preferências antigas (`dark` → `corporate-dark`, `light` → `corporate-light`)

### 🔄 Changed
- **ServiceLine Type**: Adicionados campos `title` (título do serviço) e `category` (categoria opcional)
- **ServiceQuoteCalculator**: 
  - Migrado de tabela para cards individuais
  - Removidos campos de margem e imposto da UI (defaults = 0%)
  - Layout responsivo melhorado
- **PDF de Serviços**: Inclui agora Serviço, Categoria e Descrição
- **README.md**: 
  - Removida seção legada "Modo Claro com Navbar Azul"
  - Adicionada documentação de Tema Corporativo
  - Atualizada data (29/11/2025)

### 🐛 Fixed
- Avisos de mocks duplicados do Jest eliminados (configurado `modulePathIgnorePatterns` para ignorar `sored-novo/`)
- Testes de `ServiceQuoteCalculator` ajustados para novo total sem margem/imposto (R$ 100.00)
- Testes de `ThemeSelector` atualizados para opções corporativas

### 🧪 Tests
- Todos os testes passando sem warnings
- Validação de cálculo de serviços confirmada
- Alternância de tema corporativo testada

### 📚 Documentation
- README consolidado com seções de tema moderno e corporativo
- Removidos artefatos de diff e conteúdo obsoleto
- Instruções claras sobre validações e estrutura de cards

---

## [Histórico Anterior]
Ver commits anteriores para features de orçamento de materiais, gestão de clientes, autenticação e tema moderno original.
