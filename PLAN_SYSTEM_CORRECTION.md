# Correção do Sistema de Planos

## Problema Original
O sistema estava configurado com **3 planos diferentes** (STARTER, PROFESSIONAL, ENTERPRISE), mas deveria ter apenas **1 plano (STANDARD)** com **2 opções de ciclo de faturamento**.

## Solução Implementada

### 1. **Backend - Serviço de Planos** (`sord-backend/src/services/planService.ts`)
✅ Atualizado para criar apenas 1 plano com 2 ciclos:
- **Plano Mensal**: R$ 100,00/mês
- **Plano Anual**: R$ 1.100,00/ano (8% de economia)

Ambos têm:
- Nome: `STANDARD`
- Acesso ilimitado a clientes, orçamentos e usuários
- Todas as features habilitadas
- Suporte priority

### 2. **Backend - Controlador de Autenticação** (`sord-backend/src/controllers/authController.ts`)
✅ Atualizado para:
- Acatar `billingCycle` ('monthly' | 'yearly') durante o registro
- Buscar o plano correto baseado no ciclo selecionado
- **Corrigir cálculo de `planEndDate`**:
  - **Mensal**: +30 dias
  - **Anual**: +365 dias

```typescript
const daysToAdd = billingCycle === 'yearly' ? 365 : 30;
planEndDate.setDate(planEndDate.getDate() + daysToAdd);
```

### 3. **Frontend - Lista de Planos** (`sored-novo/src/components/PlansList.tsx`)
✅ Atualizado para exibir claramente as 2 opções:
- **Opção Mensal**: "Plano Mensal - R$ 100,00/mês"
- **Opção Anual**: "Plano Anual - R$ 1.100,00/ano (8% de economia!)"
- Plano anual tem destaque visual com borda verde

### 4. **Script de Migração** (`sord-backend/src/utils/migratePlans.ts`)
✅ Criado para:
- Remover planos antigos (STARTER, PROFESSIONAL, ENTERPRISE)
- Criar os 2 novos planos STANDARD
- Executar: `npm run migrate-plans`

## Fluxo de Registro Atualizado

```
1. Usuário acessa formulário de registro
2. Vê 2 opções de ciclo:
   - Mensal R$ 100,00
   - Anual R$ 1.100,00
3. Seleciona um ciclo (billingCycle)
4. Envia: { name, email, password, billingCycle }
5. Backend:
   - Valida dados
   - Busca plano STANDARD com ciclo selecionado
   - Cria usuário com planId correto
   - Calcula planEndDate corretamente (+30 ou +365 dias)
6. Retorna token JWT com planId embedded
```

## Próximas Etapas

### Imediato
1. **Executar migração** (limpar banco de dados):
   ```bash
   cd sord-backend
   npm run migrate-plans
   ```

2. **Testar fluxo completo**:
   - Registrar novo usuário (mensal)
   - Verificar se planEndDate = hoje + 30 dias
   - Registrar novo usuário (anual)
   - Verificar se planEndDate = hoje + 365 dias

### Frontend
1. Atualizar componente de registro para:
   - Mostrar as 2 opções de ciclo
   - Capturar `billingCycle` selecionado
   - Enviar `billingCycle` ao invés de `planName`

2. Exemplo de chamada:
   ```typescript
   authAPI.register({
     name: 'João Silva',
     email: 'joao@example.com',
     password: 'senha123',
     billingCycle: 'monthly' // ou 'yearly'
   })
   ```

### Pagamentos
1. Validar que Mercado Pago recebe o valor correto:
   - Monthly: R$ 100,00
   - Yearly: R$ 1.100,00

2. Webhook deve atualizar `planEndDate` após pagamento confirmado

## Verificação de Status

### ✅ Completo
- planService.ts atualizado
- authController.ts corrigido (incluindo planEndDate)
- PlansList.tsx melhorado
- Migração criada
- Backend compilando sem erros

### 🟡 Próximas Ações
- Executar migração no banco
- Atualizar formulário de registro no frontend
- Testar signup→plano→pagamento flow
- Validar integração com Mercado Pago

## Valores Finais
- **Plano Mensal**: R$ 100,00 (renovação a cada 30 dias)
- **Plano Anual**: R$ 1.100,00 (renovação a cada 365 dias)
- **Desconto Anual**: 8% de economia vs 12x mensal

---
Status: ✅ **CORREÇÃO IMPLEMENTADA**
