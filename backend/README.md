# Jure AI - Backend API

Backend pour la gestion de cabinet d'avocat avec intelligence artificielle.

## Fonctionnalités

- **Authentification JWT** : Inscription, connexion et gestion des profils
- **Gestion de projets** : Créer et gérer des dossiers juridiques
- **Conversations IA** : Chat avec l'assistant juridique (texte et audio)
- **Gestion de documents** : Upload, analyse et recherche de documents
- **RAG (Retrieval Augmented Generation)** : Recherche sémantique avec Qdrant
- **Génération de contrats** : Génération automatique de contrats avec l'IA
- **Historique d'activités** : Suivi des actions sur les projets

## Technologies

- **Node.js** + **Express** + **TypeScript**
- **MySQL** avec **Prisma ORM**
- **Qdrant** pour la recherche vectorielle
- **OpenAI** pour les embeddings (text-embedding-3-small)
- **Groq** pour le LLM (mixtral-8x7b-32768)
- **WebSocket** pour les conversations en temps réel

## Prérequis

- Node.js 20+
- Docker et Docker Compose
- Clés API: OpenAI et Groq

## Installation

### 1. Cloner le projet

```bash
git clone <repo-url>
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier `.env` et remplir les clés API :

```bash
cp .env.example .env
```

Modifier le fichier `.env` :

```env
# Vos clés API
GROQ_API_KEY=votre_cle_groq
OPENAI_API_KEY=votre_cle_openai

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_tres_securise
```

### 4. Démarrer avec Docker

```bash
docker-compose up -d
```

Cela va démarrer :
- MySQL sur le port 3306
- Qdrant sur le port 6333
- Backend API sur le port 8787

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Ou pousser directement le schéma (pour le développement)
npm run prisma:push
```

## Développement

### Mode développement (sans Docker)

1. Démarrer MySQL et Qdrant avec Docker :

```bash
docker-compose up mysql qdrant -d
```

2. Démarrer le serveur en mode développement :

```bash
npm run dev
```

### Commandes utiles

```bash
# Développement avec rechargement automatique
npm run dev

# Build
npm run build

# Production
npm start

# Prisma Studio (interface graphique pour la BD)
npm run prisma:studio

# Générer le client Prisma après modification du schéma
npm run prisma:generate
```

## Structure du projet

```
backend/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── config/                # Configuration (DB, env)
│   ├── controllers/           # Contrôleurs API
│   ├── middleware/            # Middlewares (auth, error)
│   ├── routes/                # Routes Express
│   ├── services/              # Services (LLM, Qdrant, Speech)
│   ├── types/                 # Types TypeScript
│   └── server.ts              # Point d'entrée
├── uploads/                   # Fichiers uploadés
├── .env                       # Variables d'environnement
├── docker-compose.yml         # Configuration Docker
├── Dockerfile                 # Image Docker
└── package.json
```

## API Endpoints

### Authentification (`/api/auth`)

- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /profile` - Profil utilisateur (authentifié)
- `PUT /profile` - Mise à jour du profil (authentifié)

### Projets (`/api/projects`)

- `POST /` - Créer un projet
- `GET /` - Liste des projets
- `GET /:projectId` - Détails d'un projet
- `PUT /:projectId` - Mettre à jour un projet
- `DELETE /:projectId` - Supprimer un projet
- `GET /:projectId/activity` - Historique d'activités

### Conversations (`/api/conversations`)

- `POST /sessions` - Créer une session
- `GET /sessions` - Liste des sessions
- `GET /sessions/:sessionId` - Messages d'une session
- `POST /sessions/:sessionId/messages` - Envoyer un message texte
- `POST /sessions/:sessionId/messages/audio` - Envoyer un message audio
- `DELETE /sessions/:sessionId` - Supprimer une session

### Documents (`/api/documents`)

- `POST /upload` - Upload un document
- `GET /` - Liste des documents
- `GET /:documentId` - Détails d'un document
- `GET /:documentId/download` - Télécharger un document
- `POST /:documentId/analyze` - Analyser un document avec l'IA
- `POST /search` - Recherche sémantique (RAG)
- `DELETE /:documentId` - Supprimer un document

### Contrats (`/api/contracts`)

- `POST /generate` - Générer un contrat avec l'IA
- `GET /` - Liste des contrats
- `GET /:contractId` - Détails d'un contrat
- `PUT /:contractId` - Mettre à jour un contrat
- `DELETE /:contractId` - Supprimer un contrat

## WebSocket

Connexion WebSocket disponible sur `ws://localhost:8787/ws` pour les conversations en temps réel.

## Exemples d'utilisation

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

### Connexion

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "avocat@example.com",
    "password": "Password123!"
  }'
```

### Créer un projet

```bash
curl -X POST http://localhost:8787/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Affaire Martin vs Société X",
    "description": "Litige commercial",
    "priority": "HIGH"
  }'
```

### Upload un document

```bash
curl -X POST http://localhost:8787/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/file.pdf" \
  -F "projectId=project-uuid" \
  -F "documentType=CONTRACT"
```

### Conversation avec l'IA

```bash
curl -X POST http://localhost:8787/api/conversations/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Consultation juridique",
    "projectId": "project-uuid"
  }'

# Envoyer un message
curl -X POST http://localhost:8787/api/conversations/sessions/SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Quels sont les délais de prescription en droit commercial ?",
    "useRAG": true
  }'
```

## Licence

MIT
