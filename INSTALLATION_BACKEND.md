# 🚀 Guide d'Installation - Backend Jure AI (Adapté Frontend)

## 📦 Fichier Téléchargé

✅ **backend.zip** (58 Ko) - Backend adapté au frontend jure-ax

---

## 🎯 Ce Backend Inclut

✅ **Structure de données 100% compatible** avec le frontend jure-ax
✅ **Folders** (Dossiers) avec Attachments, Timeline, Deadlines, Documents
✅ **Conversations** (Chat) avec IA Groq
✅ **Authentification** JWT avec profils utilisateurs
✅ **Base de données** MySQL avec Prisma ORM
✅ **Docker** pour déploiement facile

---

## 🔧 Installation Étape par Étape

### **Étape 1 : Extraire l'Archive**

```bash
# Windows : Clic droit → Extraire tout
# Mac/Linux :
unzip backend.zip
cd backend
```

### **Étape 2 : Installer Docker Desktop**

**Si pas encore installé :**
- Windows/Mac : https://www.docker.com/products/docker-desktop/
- Installez et démarrez Docker Desktop
- Attendez que l'icône soit verte ✅

### **Étape 3 : Configurer les Clés API**

Ouvrez le fichier `.env` et modifiez :

```bash
# Ligne 7 - Votre clé Groq (GRATUIT)
GROQ_API_KEY=gsk_votre_cle_ici

# Ligne 11 - Votre clé OpenAI
OPENAI_API_KEY=sk_votre_cle_ici

# Ligne 3 - Générez un secret fort (32+ caractères)
JWT_SECRET=mon_secret_jwt_tres_securise_32_caracteres_minimum
```

**Obtenir les clés API :**

🔑 **Groq (GRATUIT)** :
1. Allez sur https://console.groq.com/keys
2. Créez un compte (gratuit)
3. Cliquez "Create API Key"
4. Copiez la clé (commence par `gsk_`)

🔑 **OpenAI** :
1. Allez sur https://platform.openai.com/api-keys
2. Créez un compte
3. Cliquez "Create new secret key"
4. Copiez la clé (commence par `sk-`)

### **Étape 4 : Démarrer les Services Docker**

```bash
# Dans le dossier backend/
docker-compose up -d
```

**Ce qui se lance :**
- MySQL (port 3306)
- Qdrant (port 6333)
- Backend API (port 8787)

**Attendez** 30-60 secondes que MySQL démarre complètement.

### **Étape 5 : Initialiser la Base de Données**

```bash
# Installer les dépendances
npm install

# Générer Prisma Client
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Ajouter des données de test
npm run db:init
```

### **Étape 6 : Tester**

Ouvrez votre navigateur : `http://localhost:8787`

Vous devriez voir :
```json
{
  "message": "Bienvenue sur l'API Jure AI - Cabinet d'Avocat",
  "version": "2.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "folders": "/api/folders",
    "chat": "/api/chat"
  }
}
```

---

## 🔌 Connecter au Frontend

### Dans votre frontend jure-ax

Créez un fichier `src/lib/api.ts` :

```typescript
import axios from 'axios';

export const API_URL = "http://localhost:8787/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Remplacer Supabase par votre Backend

Dans vos hooks (`useFolders.tsx`, `useConversations.tsx`), remplacez les appels Supabase par :

```typescript
import api from '@/lib/api';

// Au lieu de:
// supabase.from('folders').select('*')

// Utilisez:
const folders = await api.get('/folders');
```

---

## 📚 Documentation

Tous les fichiers de documentation sont dans le dossier backend :

- **README_FRONTEND_ADAPTED.md** - Vue d'ensemble
- **API_FRONTEND_ADAPTED.md** - Documentation complète des endpoints
- **QUICK_START.md** - Démarrage rapide
- **DEPLOYMENT.md** - Déploiement en production

---

## 🧪 Tester l'API

### Test Inscription

```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Jean",
    "lastName": "Dupont",
    "lawFirm": "Cabinet Test",
    "legalSpecialty": "Droit civil"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Test Création de Dossier

```bash
# Remplacez YOUR_TOKEN par le token reçu lors du login
curl -X POST http://localhost:8787/api/folders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Affaire Test",
    "color": "#3b82f6"
  }'
```

---

## 🛠️ Commandes Utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f backend

# Arrêter tout
docker-compose down

# Redémarrer le backend
docker-compose restart backend

# Reconstruire après modification
docker-compose up -d --build

# Ouvrir Prisma Studio (interface graphique BD)
npm run prisma:studio
```

---

## 🎯 Endpoints Principaux

### Authentification
```
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
GET  /api/auth/profile     # Profil
```

### Dossiers
```
POST   /api/folders              # Créer un dossier
GET    /api/folders              # Liste des dossiers
GET    /api/folders/:id          # Détails d'un dossier
PUT    /api/folders/:id          # Mettre à jour
DELETE /api/folders/:id          # Supprimer
```

### Pièces Jointes
```
POST   /api/folders/:id/attachments        # Ajouter
DELETE /api/folders/attachments/:id        # Supprimer
```

### Chronologie
```
POST   /api/folders/:id/timeline           # Ajouter une entrée
DELETE /api/folders/timeline/:id           # Supprimer
```

### Échéances
```
POST   /api/folders/:id/deadlines                # Ajouter
PATCH  /api/folders/deadlines/:id/status         # Changer statut
DELETE /api/folders/deadlines/:id                # Supprimer
```

### Documents Générés
```
POST   /api/folders/:id/documents          # Générer
PUT    /api/folders/documents/:id          # Mettre à jour
DELETE /api/folders/documents/:id          # Supprimer
```

### Chat
```
POST   /api/chat/conversations                           # Créer conversation
GET    /api/chat/conversations                           # Liste
POST   /api/chat/conversations/:id/messages              # Envoyer message
PATCH  /api/chat/conversations/:id/move                  # Déplacer
DELETE /api/chat/conversations/:id                       # Supprimer
```

Voir **API_FRONTEND_ADAPTED.md** pour la documentation complète.

---

## ✅ Checklist

- [ ] Docker Desktop installé et démarré
- [ ] Archive extraite
- [ ] Clés API configurées dans `.env`
- [ ] `docker-compose up -d` exécuté
- [ ] `npm install` terminé
- [ ] `npm run prisma:migrate` exécuté
- [ ] Test sur `http://localhost:8787` réussi
- [ ] Frontend configuré avec `API_URL = http://localhost:8787/api`

---

## ⚠️ Problèmes Courants

### Docker ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Redémarrer MySQL (peut mettre du temps)
docker-compose restart mysql
```

### Port 8787 déjà utilisé
Changez dans `.env` :
```bash
PORT=3000
```

### Erreur Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Cannot connect to MySQL
Attendez 30-60 secondes que MySQL soit complètement démarré.

---

## 🎉 Prochaines Étapes

1. ✅ Backend démarré
2. ✅ Configurez votre frontend pour utiliser `http://localhost:8787/api`
3. ✅ Remplacez les appels Supabase par les appels API
4. ✅ Testez les fonctionnalités
5. ✅ Déployez en production (voir DEPLOYMENT.md)

---

## 📞 Support

Pour toute question :
- Consultez **README_FRONTEND_ADAPTED.md**
- Lisez **API_FRONTEND_ADAPTED.md**
- Vérifiez les logs : `docker-compose logs -f`

---

**Version :** 2.0.0 (Adapté Frontend jure-ax)
**Compatible avec :** React + TypeScript + Tailwind CSS + shadcn/ui
**Date :** Octobre 2024

✨ Bon développement !
