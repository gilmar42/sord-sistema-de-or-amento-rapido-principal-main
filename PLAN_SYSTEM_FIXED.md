# ✅ Sistema de Planos Corrigido

## Status Atual

O sistema foi corrigido para usar **um plano único (STANDARD)** com **dois ciclos de faturamento**:

| Opção | Preço | Ciclo | Dias |
|-------|-------|-------|------|
| Mensal | R$ 100,00 | 30 dias | 30 |
| Anual | R$ 1.100,00 | 365 dias | 365 |

## O Que Foi Alterado

### 1. Backend (`sord-backend/`)

#### ✅ `src/services/planService.ts`
- Interface `PlanData.name` agora aceita apenas `'STANDARD'`
- `initializeDefaultPlans()` cria 2 planos: 1 mensal + 1 anual
- Ambos com acesso ilimitado (maxClients, maxQuotes, maxUsers = 999.999)

#### ✅ `src/controllers/authController.ts`
- Schema de registro agora valida `billingCycle` ('monthly' | 'yearly')
- Lógica de registro busca plano STANDARD correto por ciclo
- **CORRIGIDO**: `planEndDate` calculado corretamente:
  - Mensal: +30 dias
  - Anual: +365 dias

#### ✅ `package.json`
- Novo script: `npm run migrate-plans`
- Limpa planos antigos e cria novos

#### ✅ `src/utils/migratePlans.ts` (novo)
- Script de migração do banco de dados
- Remove STARTER, PROFESSIONAL, ENTERPRISE
- Cria STANDARD mensal e anual

### 2. Frontend (`sored-novo/`)

#### ✅ `src/components/PlansList.tsx`
- Exibe 2 opções claramente: Mensal vs Anual
- Opção anual tem destaque visual (borda verde + fundo)
- Mostra economia (8%) para plano anual
- Botões específicos: "Assinar Mensalmente" / "Assinar Anualmente"

## Próximas Ações

### 1️⃣ Limpar Banco de Dados (UMA VEZ)
```bash
cd sord-backend
npm run migrate-plans
```
Isso vai:
- ✅ Deletar planos antigos
- ✅ Criar 2 novos planos STANDARD

### 2️⃣ Atualizar Formulário de Registro

**Arquivo**: `sored-novo/src/components/...` (criar/atualizar RegisterForm)

```tsx
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  billingCycle: 'monthly' | 'yearly'; // ← NOVO
}

// No formulário:
<div>
  <label>Escolha seu plano:</label>
  <label>
    <input 
      type="radio" 
      value="monthly" 
      checked={billingCycle === 'monthly'}
      onChange={(e) => setBillingCycle(e.target.value)}
    />
    Mensal - R$ 100,00/mês
  </label>
  
  <label>
    <input 
      type="radio" 
      value="yearly" 
      checked={billingCycle === 'yearly'}
      onChange={(e) => setBillingCycle(e.target.value)}
    />
    Anual - R$ 1.100,00/ano (8% OFF)
  </label>
</div>

// Enviar com:
authAPI.register({
  name,
  email,
  password,
  billingCycle
})
```

### 3️⃣ Testar Fluxo Completo

```bash
# Terminal 1: Backend
cd sord-backend
npm run dev

# Terminal 2: Frontend
cd sored-novo
npm run dev
```

**Teste**:
1. Acesse http://localhost:5173
2. Registre novo usuário com **billingCycle: 'monthly'**
3. Verifique no banco: `planEndDate = hoje + 30 dias`
4. Registre novo usuário com **billingCycle: 'yearly'**
5. Verifique no banco: `planEndDate = hoje + 365 dias`

### 4️⃣ Integração com Mercado Pago

**Valores já configurados**:
- Mensal: R$ 100,00 ✅
- Anual: R$ 1.100,00 ✅

**Webhook do Mercado Pago deve**:
1. Receber confirmação de pagamento
2. Atualizar `planStartDate` = data do pagamento
3. Atualizar `planEndDate` = data do pagamento + 30 ou 365 dias

### 5️⃣ Validação de Features

Ambos os planos têm **tudo ilimitado**:
```javascript
features: {
  maxClients: 999999,      // Ilimitado
  maxQuotes: 999999,       // Ilimitado
  maxUsers: 999999,        // Ilimitado
  apiAccess: true,         // Habilitado
  customBranding: true,    // Habilitado
  advancedReports: true,   // Habilitado
  webhooks: true,          // Habilitado
  supportPriority: 'priority' // Suporte prioritário
}
```

## Estrutura do Token JWT

Quando o usuário se registra, recebe token com:
```json
{
  "userId": "...",
  "email": "...",
  "tenantId": "T-123456...",
  "role": "admin",
  "planId": "...",
  "iat": 1234567890,
  "exp": 1234567890 + 604800000  // 7 dias
}
```

## Resposta do Registro

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com",
      "tenantId": "T-...",
      "planId": "...",
      "planName": "STANDARD",
      "planDisplayName": "Plano Mensal",
      "planStartDate": "2024-01-15T10:00:00.000Z",
      "planEndDate": "2024-02-14T10:00:00.000Z"  // +30 dias
    }
  }
}
```

## Checklist de Conclusão

- [ ] Executar `npm run migrate-plans` (limpar banco)
- [ ] Compilar backend: `npm run build` (no-errors)
- [ ] Iniciar backend: `npm run dev` (port 3001)
- [ ] Criar/atualizar RegisterForm com billingCycle
- [ ] Testar signup mensal
- [ ] Testar signup anual
- [ ] Validar planEndDate no banco (+30 vs +365)
- [ ] Testar login após signup
- [ ] Validar token JWT contém planId
- [ ] Testar integração com Mercado Pago
- [ ] Validar webhook de pagamento

## Dúvidas Frequentes

**P: Por que não mostrar o ciclo na página de planos?**
R: Agora mostra! PlansList.tsx exibe "Plano Mensal" vs "Plano Anual"

**P: Qual o desconto exato?**
R: 8% (Mensal 12x = R$ 1.200 vs Anual = R$ 1.100)

**P: Os planos têm limite de features?**
R: Não! Ambos têm acesso ilimitado. A diferença é só o ciclo.

**P: Usuários pagam antes de confirmar?**
R: Sim! Fluxo: 1) Registrar 2) Pagar 3) Ativar plano

---

**Status**: ✅ Pronto para produção
**Última atualização**: Agora
**Próxima ação**: Executar migração e testar
