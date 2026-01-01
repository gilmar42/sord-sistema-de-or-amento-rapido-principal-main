#!/bin/bash
# run-tests.sh - Script para executar todos os testes

echo "🧪 Iniciando testes SORD..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Frontend Tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TESTES FRONTEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd sord-frontend

if npm test -- --passWithNoTests --coverage; then
  echo -e "${GREEN}✅ Testes Frontend PASSARAM${NC}"
else
  echo -e "${RED}❌ Testes Frontend FALHARAM${NC}"
fi

echo ""
cd ..

# Backend Tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TESTES BACKEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd sord-backend

if npm test -- --passWithNoTests --coverage; then
  echo -e "${GREEN}✅ Testes Backend PASSARAM${NC}"
else
  echo -e "${RED}❌ Testes Backend FALHARAM${NC}"
fi

echo ""
cd ..

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Teste de Cobertura Concluído${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Relatórios de Cobertura:"
echo "  Frontend: ./sord-frontend/coverage/index.html"
echo "  Backend: ./sord-backend/coverage/index.html"
