#!/bin/bash

# Script de test de l'API Jure AI

API_URL="http://localhost:8787"
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${BOLD}🧪 Test de l'API Jure AI${NC}\n"

# Test 1: Health check
echo -e "${BOLD}1. Test du endpoint /health${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✅ Health check: OK${NC}\n"
else
  echo -e "${RED}❌ Health check: FAILED (code: $response)${NC}\n"
  exit 1
fi

# Test 2: Root endpoint
echo -e "${BOLD}2. Test du endpoint racine${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/)
if [ $response -eq 200 ]; then
  echo -e "${GREEN}✅ Root endpoint: OK${NC}\n"
else
  echo -e "${RED}❌ Root endpoint: FAILED (code: $response)${NC}\n"
  exit 1
fi

# Test 3: Inscription
echo -e "${BOLD}3. Test d'inscription${NC}"
EMAIL="test_$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test123!\",
    \"name\": \"Utilisateur Test\",
    \"role\": \"CLIENT\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ Inscription: OK${NC}"
  echo -e "${YELLOW}📧 Email: $EMAIL${NC}"
  echo -e "${YELLOW}🔑 Token généré${NC}\n"
else
  echo -e "${RED}❌ Inscription: FAILED${NC}\n"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

# Test 4: Récupération du profil
echo -e "${BOLD}4. Test de récupération du profil${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/auth/profile \
  -H "Authorization: Bearer $TOKEN")

if [ $response -eq 200 ]; then
  echo -e "${GREEN}✅ Profil récupéré: OK${NC}\n"
else
  echo -e "${RED}❌ Profil: FAILED (code: $response)${NC}\n"
  exit 1
fi

# Test 5: Création d'un projet
echo -e "${BOLD}5. Test de création d'un projet${NC}"
PROJECT_RESPONSE=$(curl -s -X POST $API_URL/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Projet de test",
    "description": "Description du projet de test",
    "priority": "MEDIUM"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PROJECT_ID" ]; then
  echo -e "${GREEN}✅ Projet créé: OK${NC}"
  echo -e "${YELLOW}🆔 ID du projet: $PROJECT_ID${NC}\n"
else
  echo -e "${RED}❌ Création de projet: FAILED${NC}\n"
  echo "$PROJECT_RESPONSE"
  exit 1
fi

# Test 6: Création d'une session de conversation
echo -e "${BOLD}6. Test de création d'une session de conversation${NC}"
SESSION_RESPONSE=$(curl -s -X POST $API_URL/api/conversations/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Test conversation\",
    \"projectId\": \"$PROJECT_ID\"
  }")

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$SESSION_ID" ]; then
  echo -e "${GREEN}✅ Session créée: OK${NC}"
  echo -e "${YELLOW}🆔 ID de la session: $SESSION_ID${NC}\n"
else
  echo -e "${RED}❌ Création de session: FAILED${NC}\n"
  echo "$SESSION_RESPONSE"
  exit 1
fi

# Test 7: Envoi d'un message
echo -e "${BOLD}7. Test d'envoi de message${NC}"
MESSAGE_RESPONSE=$(curl -s -X POST $API_URL/api/conversations/sessions/$SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Bonjour, ceci est un message de test",
    "useRAG": false
  }')

ASSISTANT_MESSAGE=$(echo $MESSAGE_RESPONSE | grep -o '"assistantMessage"')

if [ ! -z "$ASSISTANT_MESSAGE" ]; then
  echo -e "${GREEN}✅ Message envoyé et réponse reçue: OK${NC}\n"
else
  echo -e "${RED}❌ Envoi de message: FAILED${NC}\n"
  echo "$MESSAGE_RESPONSE"
  exit 1
fi

# Résumé
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ Tous les tests sont passés avec succès!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Informations de test:${NC}"
echo -e "  📧 Email: $EMAIL"
echo -e "  🔑 Token: $TOKEN"
echo -e "  🆔 Project ID: $PROJECT_ID"
echo -e "  🆔 Session ID: $SESSION_ID"
echo ""
