# Jure AI - Gestion de Cabinet d'Avocat avec Intelligence Artificielle

## Vue d'ensemble

**Jure AI** est une solution complète de gestion de cabinet d'avocat avec intelligence artificielle intégrée. Le système permet aux avocats de gérer leurs dossiers, converser avec une IA juridique, analyser des documents et générer des contrats automatiquement.

## Structure du Projet

```
khalid/
├── backend/              # Backend API (Node.js + Express + TypeScript)
│   ├── src/             # Code source
│   ├── prisma/          # Schéma de base de données
│   ├── scripts/         # Scripts utilitaires
│   └── docker-compose.yml
├── PROJECT_SUMMARY.md   # Résumé détaillé du projet
└── README.md           # Ce fichier
```

## Technologies

### Backend
- **Node.js 20** + **Express** + **TypeScript**
- **MySQL 8.0** avec **Prisma ORM**
- **Qdrant** pour la recherche vectorielle (RAG)
- **Docker** + **Docker Compose**

### Intelligence Artificielle
- **Groq** (Mixtral-8x7b-32768) - Conversations juridiques
- **OpenAI GPT-4o-mini** - Génération de contrats
- **OpenAI text-embedding-3-small** - Embeddings pour RAG
- **OpenAI Whisper** - Transcription audio

## Démarrage Rapide

### 1. Prérequis

- Docker Desktop installé et démarré
- Clés API : [OpenAI](https://platform.openai.com/api-keys) et [Groq](https://console.groq.com/)

### 2. Configuration

Modifier le fichier `backend/.env` et ajouter vos clés API :

```bash
# Remplacer ces valeurs
GROQ_API_KEY=votre_cle_groq_ici
OPENAI_API_KEY=votre_cle_openai_ici
JWT_SECRET=générer_un_secret_fort_ici
```

### 3. Démarrage

```bash
cd backend

# Démarrer tous les services (MySQL, Qdrant, Backend)
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f backend
```

### 4. Initialiser la base de données

```bash
cd backend

# Installer les dépendances (pour Prisma CLI)
npm install

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Initialiser avec des données de test (optionnel)
npm run db:init
```

### 5. Tester l'API

```bash
# Vérifier que l'API fonctionne
curl http://localhost:8787/health

# Tester les endpoints principaux
npm run test:api
```

**L'API sera disponible sur** : `http://localhost:8787`

## Fonctionnalités Principales

### 1. Authentification
- ✅ Inscription/Connexion avec JWT
- ✅ Gestion des rôles (Admin, Avocat, Client)
- ✅ Gestion de profil

### 2. Gestion de Projets
- ✅ CRUD complet pour les dossiers juridiques
- ✅ Statuts et priorités
- ✅ Historique d'activités

### 3. Conversations avec l'IA
- ✅ Chat avec assistant juridique
- ✅ Support texte et audio
- ✅ RAG avec recherche dans les documents
- ✅ WebSocket pour temps réel

### 4. Gestion de Documents
- ✅ Upload de documents (PDF, TXT, DOCX)
- ✅ Extraction automatique du texte
- ✅ Recherche sémantique
- ✅ Analyse avec l'IA

### 5. Génération de Contrats
- ✅ Génération automatique avec l'IA
- ✅ Édition et versioning
- ✅ Différents types de contrats

## Documentation Complète

### Backend
- 📘 [README Backend](backend/README.md) - Documentation complète
- 🚀 [Guide de Démarrage Rapide](backend/QUICK_START.md) - En 5 minutes
- 📚 [Documentation API](backend/API_DOCUMENTATION.md) - Tous les endpoints
- 🚢 [Guide de Déploiement](backend/DEPLOYMENT.md) - Production
- 🤝 [Guide de Contribution](backend/CONTRIBUTING.md)
- 📝 [Changelog](backend/CHANGELOG.md)

### Projet
- 📊 [Résumé du Projet](PROJECT_SUMMARY.md) - Vue d'ensemble détaillée

## API Endpoints Principaux

### Authentification
```bash
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
GET  /api/auth/profile      # Profil
```

### Projets
```bash
POST   /api/projects        # Créer un projet
GET    /api/projects        # Liste des projets
GET    /api/projects/:id    # Détails
PUT    /api/projects/:id    # Mettre à jour
DELETE /api/projects/:id    # Supprimer
```

### Conversations
```bash
POST /api/conversations/sessions                    # Nouvelle conversation
POST /api/conversations/sessions/:id/messages       # Envoyer un message
POST /api/conversations/sessions/:id/messages/audio # Message audio
```

### Documents
```bash
POST /api/documents/upload         # Upload un document
POST /api/documents/search         # Recherche sémantique
POST /api/documents/:id/analyze    # Analyser avec l'IA
```

### Contrats
```bash
POST /api/contracts/generate   # Générer un contrat
GET  /api/contracts            # Liste des contrats
PUT  /api/contracts/:id        # Mettre à jour
```

## Exemples d'Utilisation

### Inscription
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "avocat@example.com",
    "password": "Password123!",
    "name": "Jean Dupont",
    "role": "LAWYER"
  }'
```

### Conversation avec l'IA
```bash
# Créer une session
curl -X POST http://localhost:8787/api/conversations/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Consultation juridique"}'

# Envoyer un message
curl -X POST http://localhost:8787/api/conversations/sessions/SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Quels sont les délais de prescription en droit commercial ?",
    "useRAG": true
  }'
```

## Scripts NPM Utiles

```bash
# Développement
npm run dev              # Démarrer en mode dev
npm run build            # Build production

# Base de données
npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Appliquer migrations
npm run prisma:studio    # Interface graphique BD
npm run db:init          # Initialiser avec données test

# Docker
npm run docker:up        # Démarrer tous les services
npm run docker:down      # Arrêter tous les services
npm run docker:logs      # Voir les logs

# Tests
npm run test:api         # Tester l'API
npm run check:services   # Vérifier les services
```

## Architecture

### Services Docker
- **MySQL** (port 3306) - Base de données principale
- **Qdrant** (port 6333) - Base de données vectorielle
- **Backend API** (port 8787) - API REST + WebSocket

### Flux de Données RAG
1. Upload de document → Extraction de texte
2. Texte → Chunking intelligent
3. Chunks → OpenAI embeddings (text-embedding-3-small)
4. Embeddings → Stockage dans Qdrant
5. Question utilisateur → Recherche sémantique
6. Résultats + Question → Groq (Mixtral) → Réponse contextualisée

## Sécurité

- 🔒 Hashage bcrypt des mots de passe
- 🔑 Tokens JWT avec expiration (7 jours)
- ✅ Validation des entrées avec Zod
- 🛡️ Middleware d'authentification
- 🌐 CORS configuré

## Commandes Docker Utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Reconstruire les images
docker-compose up -d --build

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## Base de Données

### Connexion MySQL
```bash
# Depuis le host
docker exec -it jure-ai-mysql mysql -u jure -p
# Password: jur3pass

# Ou avec Prisma Studio (interface graphique)
npm run prisma:studio
```

### Sauvegarder la BD
```bash
docker exec jure-ai-mysql mysqldump -u jure -pjur3pass jure_ai > backup.sql
```

### Restaurer la BD
```bash
docker exec -i jure-ai-mysql mysql -u jure -pjur3pass jure_ai < backup.sql
```

## Résolution des Problèmes

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que MySQL est prêt
docker-compose ps

# Redémarrer MySQL
docker-compose restart mysql
```

### Port déjà utilisé
Modifier le port dans `backend/.env` :
```env
PORT=3000
```

### Erreur de connexion MySQL
Attendre 30-60 secondes que MySQL soit complètement démarré.

## Comptes de Test

Si vous avez exécuté `npm run db:init`, vous pouvez vous connecter avec :

**Avocat**
- Email: `avocat@jure-ai.com`
- Password: `Lawyer123!`

**Admin**
- Email: `admin@jure-ai.com`
- Password: `Admin123!`

## Prochaines Étapes

1. ✅ Connecter le frontend au backend
2. ✅ Tester l'upload de documents
3. ✅ Tester les conversations avec RAG
4. ✅ Générer des contrats
5. ✅ Déployer en production (voir [DEPLOYMENT.md](backend/DEPLOYMENT.md))

## Support

Pour toute question :
- 📖 Consulter la [documentation complète](backend/README.md)
- 🐛 Vérifier les logs : `docker-compose logs -f`
- 📝 Créer une Issue sur GitHub

## Licence

MIT - Voir le fichier [LICENSE](backend/LICENSE)

---

**Version**: 1.0.0
**Status**: Production Ready ✅

Développé avec ❤️ et [Claude Code](https://claude.com/claude-code)
