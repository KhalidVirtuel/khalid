# Résumé du Projet - Jure AI Backend

## Vue d'ensemble

**Jure AI** est un backend complet pour la gestion de cabinet d'avocat avec intelligence artificielle. Le système permet aux avocats de gérer leurs dossiers, converser avec une IA juridique, analyser des documents et générer des contrats automatiquement.

## Architecture

### Stack Technologique

- **Backend**: Node.js 20 + Express + TypeScript
- **Base de données**: MySQL 8.0 avec Prisma ORM
- **Vector DB**: Qdrant pour la recherche sémantique (RAG)
- **IA/LLM**:
  - Groq (Mixtral-8x7b-32768) pour les conversations
  - OpenAI (GPT-4o-mini) pour les contrats
  - OpenAI (text-embedding-3-small) pour les embeddings
  - OpenAI Whisper pour la transcription audio
- **Conteneurisation**: Docker + Docker Compose
- **Authentification**: JWT

### Fonctionnalités Principales

#### 1. Authentification et Gestion des Utilisateurs
- Inscription/Connexion avec JWT
- 3 rôles : ADMIN, LAWYER, CLIENT
- Gestion de profil

#### 2. Gestion de Projets (Dossiers Juridiques)
- CRUD complet
- Statuts : OPEN, IN_PROGRESS, PENDING, CLOSED, ARCHIVED
- Priorités : LOW, MEDIUM, HIGH, URGENT
- Historique d'activités

#### 3. Conversations avec l'IA
- Sessions de conversation liées aux projets
- Messages texte et audio
- RAG (Retrieval Augmented Generation) pour contexte
- WebSocket pour temps réel
- Transcription audio automatique

#### 4. Gestion de Documents
- Upload de documents (PDF, TXT, DOCX, etc.)
- Extraction de texte automatique
- Indexation dans Qdrant
- Recherche sémantique
- Analyse de documents avec l'IA

#### 5. Génération de Contrats
- Génération automatique avec l'IA
- Versioning des contrats
- États : DRAFT, REVIEW, APPROVED, SIGNED, ARCHIVED
- Édition et mise à jour

## Structure du Projet

```
backend/
├── prisma/
│   └── schema.prisma           # Schéma de base de données
├── src/
│   ├── config/                 # Configuration (DB, env)
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/            # Contrôleurs API
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── conversation.controller.ts
│   │   ├── document.controller.ts
│   │   └── contract.controller.ts
│   ├── middleware/             # Middlewares
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/                 # Routes Express
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── conversation.routes.ts
│   │   ├── document.routes.ts
│   │   └── contract.routes.ts
│   ├── services/               # Services
│   │   ├── llm.service.ts      # Groq/GPT-4
│   │   ├── embedding.service.ts # OpenAI embeddings
│   │   ├── qdrant.service.ts   # Recherche vectorielle
│   │   ├── speech.service.ts   # Whisper STT/TTS
│   │   └── document.service.ts # Extraction de texte
│   ├── types/                  # Types TypeScript
│   │   └── index.ts
│   └── server.ts               # Point d'entrée
├── scripts/                    # Scripts utilitaires
│   ├── init-db.ts
│   ├── test-api.sh
│   ├── check-services.sh
│   └── reset-db.sh
├── docker-compose.yml          # Configuration Docker
├── Dockerfile
├── .env                        # Variables d'environnement
├── package.json
└── tsconfig.json
```

## Modèle de Données

### Entités Principales

1. **User** - Utilisateurs (avocats, clients, admin)
2. **Project** - Dossiers juridiques
3. **ConversationSession** - Sessions de chat
4. **Message** - Messages de conversation
5. **Document** - Documents uploadés
6. **Contract** - Contrats générés/édités
7. **ActivityLog** - Historique des actions

### Relations

- Un User peut avoir plusieurs Projects
- Un Project peut avoir plusieurs Documents, ConversationSessions, Contracts
- Une ConversationSession contient plusieurs Messages
- Tous les documents sont indexés dans Qdrant pour la recherche

## API Endpoints

### Authentification (`/api/auth`)
- POST `/register` - Inscription
- POST `/login` - Connexion
- GET `/profile` - Profil
- PUT `/profile` - Mise à jour profil

### Projets (`/api/projects`)
- POST `/` - Créer
- GET `/` - Lister
- GET `/:id` - Détails
- PUT `/:id` - Mettre à jour
- DELETE `/:id` - Supprimer
- GET `/:id/activity` - Historique

### Conversations (`/api/conversations`)
- POST `/sessions` - Nouvelle session
- GET `/sessions` - Lister
- GET `/sessions/:id` - Détails
- POST `/sessions/:id/messages` - Envoyer message
- POST `/sessions/:id/messages/audio` - Message audio
- DELETE `/sessions/:id` - Supprimer

### Documents (`/api/documents`)
- POST `/upload` - Upload
- GET `/` - Lister
- GET `/:id` - Détails
- GET `/:id/download` - Télécharger
- POST `/:id/analyze` - Analyser avec IA
- POST `/search` - Recherche sémantique
- DELETE `/:id` - Supprimer

### Contrats (`/api/contracts`)
- POST `/generate` - Générer avec IA
- GET `/` - Lister
- GET `/:id` - Détails
- PUT `/:id` - Mettre à jour
- DELETE `/:id` - Supprimer

## Services IA

### 1. LLM Service (Groq)
- Conversations juridiques
- Génération de contrats
- Analyse de documents
- Modèle : Mixtral-8x7b-32768

### 2. Embedding Service (OpenAI)
- Création d'embeddings pour RAG
- Modèle : text-embedding-3-small (1536 dimensions)

### 3. Qdrant Service
- Stockage des embeddings
- Recherche sémantique
- Chunking automatique des documents

### 4. Speech Service (OpenAI)
- Speech-to-Text (Whisper)
- Text-to-Speech (TTS)

## Démarrage Rapide

```bash
# 1. Configuration
cp .env.example .env
# Remplir les clés API

# 2. Démarrage avec Docker
docker-compose up -d

# 3. Initialisation de la BD
npm run prisma:generate
npm run prisma:migrate
npm run db:init

# 4. Test
npm run test:api
```

L'API sera disponible sur `http://localhost:8787`

## Documentation

- **README.md** - Documentation complète
- **QUICK_START.md** - Démarrage en 5 minutes
- **API_DOCUMENTATION.md** - Détails des endpoints
- **DEPLOYMENT.md** - Guide de déploiement production
- **CONTRIBUTING.md** - Guide de contribution
- **CHANGELOG.md** - Historique des versions

## Scripts NPM

```bash
npm run dev              # Développement avec rechargement
npm run build            # Build production
npm start                # Démarrer en production

npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Migrations
npm run prisma:studio    # Interface graphique BD

npm run db:init          # Initialiser avec données test
npm run test:api         # Tester les endpoints

npm run docker:up        # Démarrer Docker
npm run docker:down      # Arrêter Docker
npm run docker:logs      # Voir les logs
```

## Sécurité

- ✅ Hashage bcrypt pour les mots de passe
- ✅ Tokens JWT avec expiration (7 jours)
- ✅ Validation des entrées avec Zod
- ✅ Middleware d'authentification
- ✅ Gestion centralisée des erreurs
- ✅ CORS configuré
- ⚠️ Rate limiting (à implémenter)
- ⚠️ HTTPS en production (voir DEPLOYMENT.md)

## Prochaines Étapes

### À court terme
- [ ] Tests unitaires et d'intégration
- [ ] Rate limiting
- [ ] Système de notifications
- [ ] Export de documents (PDF)

### À moyen terme
- [ ] Dashboard analytics
- [ ] Calendrier intégré
- [ ] Système de facturation
- [ ] Webhooks

### À long terme
- [ ] Support multilingue
- [ ] Mobile app
- [ ] Intégrations tierces (Slack, etc.)
- [ ] IA avancée (fine-tuning)

## Performance

- Chunking intelligent des documents (1000 caractères)
- Indexation asynchrone dans Qdrant
- WebSocket pour les conversations temps réel
- Cache des embeddings
- Pagination des résultats

## Limites et Considérations

- Taille max des fichiers : 50MB
- Rate limit API (à configurer)
- Coûts API OpenAI/Groq (surveiller l'utilisation)
- Qdrant en mémoire par défaut (configurer persistence)

## Support et Contact

Pour toute question :
- Consulter la documentation dans `/docs`
- Créer une Issue sur GitHub
- Vérifier les logs : `docker-compose logs -f`

## Licence

MIT - Voir le fichier LICENSE

---

**Version**: 1.0.0
**Dernière mise à jour**: Janvier 2024
**Status**: Production Ready ✅
