#!/bin/bash

# Script pour réinitialiser complètement la base de données

BOLD="\033[1m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m"

echo -e "${RED}${BOLD}⚠️  ATTENTION: Cette action va supprimer toutes les données!${NC}"
echo -e "${YELLOW}Voulez-vous vraiment continuer? (yes/no)${NC}"
read -r response

if [ "$response" != "yes" ]; then
  echo "Opération annulée."
  exit 0
fi

echo -e "${BOLD}🗑️  Suppression de la base de données...${NC}"

# Arrêter les services
docker-compose down -v

# Redémarrer les services
docker-compose up -d

# Attendre que MySQL soit prêt
echo "⏳ Attente du démarrage de MySQL..."
sleep 10

# Appliquer les migrations
echo "📦 Application des migrations..."
npm run prisma:migrate

# Initialiser avec des données de test
echo "🌱 Initialisation avec des données de test..."
npx tsx scripts/init-db.ts

echo -e "${GREEN}✅ Base de données réinitialisée avec succès!${NC}"
