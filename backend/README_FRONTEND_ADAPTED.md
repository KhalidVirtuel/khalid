# Jure AI Backend - Adapté au Frontend jure-ax

Backend **100% compatible** avec le frontend jure-ax (React + TypeScript + Tailwind CSS + shadcn/ui).

## 🎯 Adaptations Principales

Ce backend a été spécialement adapté pour correspondre **exactement** au frontend jure-ax :

### ✅ Structure de Données Alignée
- **Folders** (Dossiers) au lieu de Projects
- **Conversations** au lieu de ConversationSessions
- **Attachments** (Pièces jointes)
- **Timeline** (Chronologie des événements)
- **Deadlines** (Échéances)
- **Generated Documents** (Documents générés)

### ✅ Modèle Utilisateur Adapté
```typescript
User {
  firstName       // Au lieu de "name"
  lastName
  lawFirm         // Cabinet d'avocat
  legalSpecialty  // Spécialité juridique
}
```

### ✅ API Endpoints Compatibles
Tous les endpoints correspondent aux hooks frontend :
- `useFolders` → `/api/folders`
- `useConversations` → `/api/chat/conversations`
- `useAuth` → `/api/auth`

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Docker Desktop installé
- Clés API : [Groq](https://console.groq.com/) et [OpenAI](https://platform.openai.com/api-keys)

### 2. Configuration

Modifiez `.env` :
```bash
GROQ_API_KEY=votre_cle_groq
OPENAI_API_KEY=votre_cle_openai
JWT_SECRET=votre_secret_jwt_fort
```

### 3. Démarrage

```bash
# Démarrer les services
docker-compose up -d

# Installer les dépendances
npm install

# Générer Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate
```

### 4. Tester

```bash
curl http://localhost:8787/health
```

---

## 📊 Structure de la Base de Données

```
users
├── id
├── email
├── password
├── firstName
├── lastName
├── lawFirm
└── legalSpecialty

folders
├── id
├── userId
├── name
├── description
├── color
├── attachments[]
├── timeline[]
├── documents[]
├── deadlines[]
└── conversations[]

conversations
├── id
├── userId
├── folderId
├── title
└── messages[]

messages
├── id
├── conversationId
├── role (USER | ASSISTANT)
└── content
```

---

## 🔌 Connexion avec le Frontend

### Configuration dans le Frontend

Dans votre fichier de configuration frontend (ex: `src/lib/api.ts`) :

```typescript
export const API_URL = "http://localhost:8787/api";

// Axios ou Fetch
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemples d'Utilisation

```typescript
// Authentification
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

// Récupérer les dossiers
const getFolders = async () => {
  const response = await api.get('/folders');
  return response.data.folders;
};

// Créer un dossier
const createFolder = async (name: string, color: string) => {
  const response = await api.post('/folders', { name, color });
  return response.data.folder;
};

// Envoyer un message
const sendMessage = async (conversationId: string, content: string) => {
  const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content
  });
  return response.data;
};
```

---

## 📚 Endpoints API Principaux

### Authentification
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Dossiers (Folders)
```
POST   /api/folders
GET    /api/folders
GET    /api/folders/:folderId
PUT    /api/folders/:folderId
DELETE /api/folders/:folderId
```

### Pièces Jointes
```
POST   /api/folders/:folderId/attachments
DELETE /api/folders/attachments/:attachmentId
```

### Chronologie
```
POST   /api/folders/:folderId/timeline
DELETE /api/folders/timeline/:entryId
```

### Échéances
```
POST   /api/folders/:folderId/deadlines
PATCH  /api/folders/deadlines/:deadlineId/status
DELETE /api/folders/deadlines/:deadlineId
```

### Documents Générés
```
POST   /api/folders/:folderId/documents
PUT    /api/folders/documents/:documentId
DELETE /api/folders/documents/:documentId
```

### Conversations (Chat)
```
POST   /api/chat/conversations
GET    /api/chat/conversations
GET    /api/chat/conversations/:conversationId
POST   /api/chat/conversations/:conversationId/messages
PATCH  /api/chat/conversations/:conversationId/move
DELETE /api/chat/conversations/:conversationId
```

Voir **API_FRONTEND_ADAPTED.md** pour la documentation complète.

---

## 🎨 Technologies

**Backend:**
- Node.js 20 + Express + TypeScript
- MySQL 8.0 avec Prisma ORM
- Docker + Docker Compose

**IA:**
- Groq (Mixtral-8x7b-32768) pour les conversations
- OpenAI (GPT-4o-mini) pour la génération de documents
- OpenAI (text-embedding-3-small) pour les embeddings

**Frontend Compatible:**
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f

# Base de données
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

---

## 📖 Documentation

- **API_FRONTEND_ADAPTED.md** - Documentation complète des endpoints
- **QUICK_START.md** - Guide de démarrage rapide
- **DEPLOYMENT.md** - Déploiement en production

---

## 🔄 Migration depuis l'Ancienne Version

Si vous utilisiez l'ancienne version du backend, voici les changements :

### Renommages
- `Project` → `Folder`
- `ConversationSession` → `Conversation`
- `User.name` → `User.firstName` + `User.lastName`

### Ajouts
- `Attachment` (pièces jointes)
- `TimelineEntry` (chronologie)
- `Deadline` (échéances)
- `GeneratedDocument` (documents générés)
- `User.lawFirm` et `User.legalSpecialty`

### Suppressions
- `Document` (remplacé par `Attachment` et `GeneratedDocument`)
- `Contract` (intégré dans `GeneratedDocument`)
- `ActivityLog` (peut être rajouté si nécessaire)

---

## ✅ Compatibilité Frontend

Ce backend est **100% compatible** avec :
- ✅ `useFolders` hook
- ✅ `useConversations` hook
- ✅ `useAuth` hook
- ✅ `useChatStore`
- ✅ Tous les types TypeScript du frontend

---

## 🆘 Support

Pour toute question :
- Consultez **API_FRONTEND_ADAPTED.md**
- Vérifiez les logs : `docker-compose logs -f`
- GitHub Issues

---

## 📝 Licence

MIT
