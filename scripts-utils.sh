#!/bin/bash

# 🚀 Scripts Úteis para Desenvolvimento

# ============================================
# SETUP INICIAL
# ============================================

echo "📦 Setup Inicial - SORD + Mercado Pago"
echo "======================================"

# 1. Backend
echo ""
echo "1️⃣ Configurando Backend..."
cd sord-backend
npm install
cp .env.example .env

echo ""
echo "⚠️ IMPORTANTE: Edite o arquivo .env com suas credenciais:"
echo "   - DB_USER, DB_PASSWORD, DB_NAME (PostgreSQL)"
echo "   - MERCADO_PAGO_PUBLIC_KEY"
echo "   - MERCADO_PAGO_ACCESS_TOKEN"
echo ""
read -p "Pressione ENTER após editar .env..."

# Criar banco de dados
echo ""
echo "2️⃣ Criando banco de dados PostgreSQL..."
psql -U postgres -c "CREATE DATABASE sord_db;" 2>/dev/null || echo "⚠️ Banco pode já existir"

# Rodar migrações
echo ""
echo "3️⃣ Executando migrações..."
npm run migrate

# 2. Frontend
echo ""
echo "4️⃣ Configurando Frontend..."
cd ..
cp .env.local.example .env.local

echo ""
echo "⚠️ IMPORTANTE: Edite o arquivo .env.local com sua chave pública:"
echo "   - VITE_MERCADO_PAGO_PUBLIC_KEY"
echo ""
read -p "Pressione ENTER após editar .env.local..."

echo ""
echo "✅ Setup Completo!"
echo ""
echo "Próximos passos:"
echo "1. cd sord-backend && npm run dev (Terminal 1)"
echo "2. npm run dev (Terminal 2, na raiz)"
echo "3. Acesse http://localhost:3000"

# ============================================
# DESENVOLVIMENTO
# ============================================

# Script para rodar ambos servidores em paralelo
dev-all() {
    echo "🚀 Iniciando Backend e Frontend..."
    
    # Backend em background
    (cd sord-backend && npm run dev) &
    BACKEND_PID=$!
    
    sleep 2
    
    # Frontend
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Servidores iniciados!"
    echo "   Backend: http://localhost:3001"
    echo "   Frontend: http://localhost:3000"
    echo ""
    echo "Pressione Ctrl+C para parar"
    
    wait
}

# Testar webhook manualmente
test-webhook() {
    ORDER_ID=${1:-"test-order-$(date +%s)"}
    STATUS=${2:-"approved"}
    
    echo "🧪 Testando webhook com:"
    echo "   Order ID: $ORDER_ID"
    echo "   Status: $STATUS"
    echo ""
    
    curl -X POST http://localhost:3001/api/webhooks/test \
      -H "Content-Type: application/json" \
      -d "{\"orderId\": \"$ORDER_ID\", \"status\": \"$STATUS\"}"
    
    echo ""
    echo "✅ Webhook testado!"
}

# Verificar status de um pagamento
check-payment() {
    ORDER_ID=$1
    
    if [ -z "$ORDER_ID" ]; then
        echo "❌ Uso: check-payment <order-id>"
        return 1
    fi
    
    echo "🔍 Consultando pagamento: $ORDER_ID"
    curl -s http://localhost:3001/api/payments/$ORDER_ID | jq .
}

# Listar todos os pagamentos
list-payments() {
    STATUS=${1:-""}
    
    if [ -z "$STATUS" ]; then
        echo "📋 Listando todos os pagamentos..."
        curl -s "http://localhost:3001/api/payments" | jq .
    else
        echo "📋 Listando pagamentos com status: $STATUS"
        curl -s "http://localhost:3001/api/payments?status=$STATUS" | jq .
    fi
}

# Resetar banco de dados
reset-db() {
    echo "⚠️ Aviso: Isso vai DELETAR todos os dados!"
    read -p "Digite 'sim' para confirmar: " CONFIRM
    
    if [ "$CONFIRM" != "sim" ]; then
        echo "Cancelado!"
        return 1
    fi
    
    echo ""
    echo "🗑️ Resetando banco de dados..."
    
    psql -U postgres -d sord_db -c "
        DROP TABLE IF EXISTS payment_logs CASCADE;
        DROP TABLE IF EXISTS payments CASCADE;
    " && echo "✅ Tabelas deletadas"
    
    cd sord-backend
    npm run migrate
    echo "✅ Banco resetado com sucesso!"
}

# ============================================
# PRODUÇÃO
# ============================================

# Build para produção
build-prod() {
    echo "🏗️ Buildando para produção..."
    
    # Frontend
    npm run build
    
    # Backend
    cd sord-backend
    npm run build
    
    echo "✅ Build concluído!"
    echo "   Frontend: dist/"
    echo "   Backend: sord-backend/dist/"
}

# Deploy para Vercel (Frontend)
deploy-vercel() {
    echo "🚀 Fazendo deploy no Vercel..."
    npm run build
    npx vercel --prod
}

# Deploy para Heroku (Backend)
deploy-heroku() {
    echo "🚀 Fazendo deploy no Heroku..."
    cd sord-backend
    git push heroku main
}

# ============================================
# TESTES
# ============================================

# Rodar testes
test-all() {
    echo "🧪 Executando testes..."
    npm test -- --watchAll=false
}

test-payment() {
    echo "🧪 Testando componente PaymentForm..."
    npm test -- PaymentForm.test.tsx --watchAll=false
}

# ============================================
# LIMPEZA
# ============================================

clean() {
    echo "🧹 Limpando arquivos temporários..."
    
    rm -rf node_modules sord-backend/node_modules
    rm -rf dist sord-backend/dist
    rm -rf .env .env.local sord-backend/.env
    
    echo "✅ Limpeza concluída!"
}

# ============================================
# HELP
# ============================================

show-help() {
    cat << EOF

🚀 Scripts Disponíveis:

SETUP:
  setup               - Configuração inicial completa

DESENVOLVIMENTO:
  dev-all             - Iniciar backend + frontend
  test-webhook [ORDER_ID] [STATUS]  - Testar webhook
  check-payment [ORDER_ID]  - Ver status de um pagamento
  list-payments [STATUS]    - Listar pagamentos

BANCO DE DADOS:
  reset-db            - Resetar banco de dados (⚠️ Delete tudo!)

TESTES:
  test-all            - Rodar todos os testes
  test-payment        - Testar apenas PaymentForm

PRODUÇÃO:
  build-prod          - Build para produção
  deploy-vercel       - Deploy frontend (Vercel)
  deploy-heroku       - Deploy backend (Heroku)

LIMPEZA:
  clean               - Remover node_modules e builds

Exemplos:
  test-webhook ordem-123 approved
  check-payment ordem-123
  list-payments pending

EOF
}

# ============================================
# EXECUTOR
# ============================================

if [ "$1" == "help" ] || [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show-help
elif [ -z "$1" ]; then
    show-help
else
    "$@"
fi
