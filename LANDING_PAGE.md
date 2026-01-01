# 🎨 Landing Page SORD - Documentação

## 📋 Visão Geral

Uma landing page moderna e atraente foi implementada para o sistema SORD com:

### ✨ Características Principais

1. **Logo 3D Interativa**
   - Efeito de perspectiva 3D que segue o movimento do mouse
   - Animação suave com gradiente azul e ciano
   - Exibida na navbar e na seção hero
   - Sombra 3D realista com depth

2. **Navbar Estilizada**
   - Nome "SORED Orçamentos" em alto relevo com gradiente
   - Logo 3D interativa
   - Botão CTA "Começar Agora" com gradiente
   - Efeito glass-morphism quando o usuário faz scroll
   - Responsiva (mobile e desktop)

3. **Seção Hero**
   - Fundo animado com blobs que se movem
   - Título em gradiente de 5xl a 6xl
   - Subtítulo descritivo
   - Botão CTA grande e destacado
   - Indicador de scroll animado com bounce

4. **Seção de Funcionalidades**
   - 4 Cards mostrando cada função do sistema:
     - Cálculo de Orçamentos
     - Gerenciamento de Materiais
     - Orçamentos Salvos
     - Configurações Avançadas
   - Efeito hover com scale e shadow
   - Ícones coloridos

5. **Seção de Benefícios**
   - Lista de 6 benefícios principais
   - Ícones de check circle
   - Efeito hover nos textos

6. **Seção CTA Final**
   - Chamada para ação final
   - Fundo em gradiente com baixa opacidade

7. **Footer**
   - Créditos do sistema

## 🎯 Funcionalidades de Interação

### Rastreamento de Mouse
```typescript
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

// Usa mousePosition para animar a logo 3D
transform: `
  rotateX(${mousePosition.y * 20}deg) 
  rotateY(${-mousePosition.x * 20}deg)
`
```

### Detecção de Scroll
```typescript
const [isScrolled, setIsScrolled] = useState(false);
// Navbar muda de transparente para glass-card ao fazer scroll
```

### Animações CSS
- `animate-blob`: Anima elementos de fundo em movimento fluido
- `animate-bounce`: Faz o indicador de scroll pular
- `animate-slideIn`: Entrada suave dos componentes
- `animate-fadeUp`: Fade-in com movimento para cima

## 🎨 Estilos e Tema

A landing page segue a paleta de cores do sistema:
- **Primary**: #0f766e (teal escuro) / #22d3ee (cyan - dark mode)
- **Texto**: Variações de gray
- **Gradientes**: Primary → Blue → Cyan

## 🔄 Fluxo de Navegação

1. Usuário acessa a aplicação → Landing Page
2. Clica em "Começar Agora" → Esconde landing e mostra Auth Page
3. Faz login → MainLayout com funcionalidades do sistema

## 📱 Responsividade

- Mobile: Layout em coluna, navbar adaptada
- Desktop: Layout otimizado com espaçamento

## 🛠 Componentes Utilizados

- **LandingPage.tsx**: Componente principal
- **Icons.tsx**: Icons (CalculatorIcon, BoxIcon, DocumentTextIcon, CogIcon, ChevronDownIcon, SparklesIcon, CheckCircleIcon)

## 🎬 Animações Adicionadas

No `index.css`:
```css
@keyframes blob { /* Movimento fluido dos elementos de fundo */ }
@keyframes bounce { /* Pulo do indicador */ }
```

No `tailwind.config.js`:
```javascript
animation: {
  blob: 'blob 7s infinite',
  bounce: 'bounce 2s infinite',
}
```

## 💡 Pontos Técnicos

1. **3D Transform**: Usa `perspective` e `transform-style: preserve-3d`
2. **Mouse Tracking**: EventListener em `mousemove` para calcular ângulos
3. **Glass Morphism**: Utiliza `backdrop-filter: blur()` e opacity
4. **Gradientes**: Combinação de cores primária, blue e cyan
5. **Drop Shadows**: Sombras sutis que aumentam em hover

## 🚀 Próximas Melhorias Possíveis

- Adicionar seção de pricing
- Adicionar depoimentos de clientes
- Adicionar FAQ
- Integrar com email para newsletter
- Adicionar vídeo demonstrativo
- Animações no scroll (scroll reveal)

---

**Criada em**: 01/01/2026
**Versão**: 1.0
