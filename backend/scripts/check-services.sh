#!/bin/bash

# Script pour vérifier que tous les services sont opérationnels

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m"

echo -e "${BOLD}🔍 Vérification des services Jure AI${NC}\n"

# Vérifier MySQL
echo -e "${BOLD}1. MySQL${NC}"
if docker exec jure-ai-mysql mysqladmin ping -h localhost -u root -pjur3pass &> /dev/null; then
  echo -e "${GREEN}✅ MySQL est opérationnel${NC}\n"
else
  echo -e "${RED}❌ MySQL n'est pas accessible${NC}\n"
fi

# Vérifier Qdrant
echo -e "${BOLD}2. Qdrant${NC}"
qdrant_health=$(curl -s http://localhost:6333/health)
if [ ! -z "$qdrant_health" ]; then
  echo -e "${GREEN}✅ Qdrant est opérationnel${NC}\n"
else
  echo -e "${RED}❌ Qdrant n'est pas accessible${NC}\n"
fi

# Vérifier le Backend
echo -e "${BOLD}3. Backend API${NC}"
backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/health)
if [ "$backend_health" -eq 200 ]; then
  echo -e "${GREEN}✅ Backend API est opérationnel${NC}\n"
else
  echo -e "${RED}❌ Backend API n'est pas accessible (code: $backend_health)${NC}\n"
fi

# Afficher les containers Docker
echo -e "${BOLD}État des containers Docker:${NC}"
docker-compose ps

echo ""
