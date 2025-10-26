# 🚀 Instructions de Démarrage - Jure AI Backend

## ✅ Ce qui a été créé

J'ai créé un backend complet pour votre projet de gestion de cabinet d'avocat avec IA. Voici ce qui a été implémenté :

### 📦 Architecture Complète

**Technologies utilisées :**
- Node.js 20 + Express + TypeScript
- MySQL 8.0 avec Prisma ORM
- Qdrant pour la recherche vectorielle (RAG)
- Docker + Docker Compose
- OpenAI (embeddings, Whisper, TTS)
- Groq (Mixtral-8x7b pour les conversations)

### 🎯 Fonctionnalités Implémentées

✅ **Authentification JWT**
- Inscription/Connexion
- Gestion des rôles (ADMIN, LAWYER, CLIENT)
- Profils utilisateurs

✅ **Gestion de Projets**
- CRUD complet des dossiers juridiques
- Statuts et priorités
- Historique d'activités

✅ **Conversations avec l'IA**
- Chat texte avec Groq (Mixtral-8x7b)
- Support audio avec transcription Whisper
- RAG avec recherche dans les documents
- WebSocket pour temps réel

✅ **Gestion de Documents**
- Upload de fichiers (PDF, TXT, DOCX)
- Extraction automatique du texte
- Indexation dans Qdrant
- Recherche sémantique
- Analyse avec l'IA

✅ **Génération de Contrats**
- Génération automatique avec l'IA
- Versioning
- Édition et mise à jour

## 🎬 Démarrage en 5 Minutes

### Étape 1 : Configuration des clés API

Éditez le fichier `backend/.env` et remplacez ces lignes :

```bash
# Remplacez ces valeurs par vos vraies clés API
GROQ_API_KEY=votre_cle_groq_ici
OPENAI_API_KEY=votre_cle_openai_ici

# Générez un secret JWT fort (32+ caractères aléatoires)
JWT_SECRET=votre_secret_jwt_tres_securise_ici
```

**Obtenir les clés API :**
- **Groq** : https://console.groq.com/ (gratuit)
- **OpenAI** : https://platform.openai.com/api-keys

### Étape 2 : Démarrer les services Docker

```bash
cd backend

# Démarrer MySQL, Qdrant et le Backend
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

### Étape 3 : Initialiser la base de données

```bash
# Dans le dossier backend/

# Installer les dépendances (pour Prisma)
npm install

# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et les tables
npm run prisma:migrate

# (Optionnel) Ajouter des données de test
npm run db:init
```

### Étape 4 : Tester l'API

```bash
# Vérifier que l'API fonctionne
curl http://localhost:8787/health

# Réponse attendue : {"status":"OK","timestamp":"..."}
```

**L'API est maintenant accessible sur :** `http://localhost:8787`

## 📚 Endpoints Principaux

### Authentification
```
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
GET  /api/auth/profile      # Profil (authentifié)
```

### Projets
```
POST   /api/projects        # Créer un projet
GET    /api/projects        # Liste
GET    /api/projects/:id    # Détails
```

### Conversations
```
POST /api/conversations/sessions                    # Nouvelle conversation
POST /api/conversations/sessions/:id/messages       # Envoyer un message
POST /api/conversations/sessions/:id/messages/audio # Message audio
```

### Documents
```
POST /api/documents/upload         # Upload
POST /api/documents/search         # Recherche sémantique
POST /api/documents/:id/analyze    # Analyser avec l'IA
```

### Contrats
```
POST /api/contracts/generate   # Générer avec l'IA
GET  /api/contracts            # Liste
PUT  /api/contracts/:id        # Mettre à jour
```

## 🧪 Tester avec les Comptes de Test

Si vous avez exécuté `npm run db:init`, vous pouvez vous connecter avec :

**Avocat :**
```json
{
  "email": "avocat@jure-ai.com",
  "password": "Lawyer123!"
}
```

**Admin :**
```json
{
  "email": "admin@jure-ai.com",
  "password": "Admin123!"
}
```

## 🧰 Commandes Utiles

### Docker
```bash
docker-compose up -d          # Démarrer
docker-compose down           # Arrêter
docker-compose logs -f        # Logs en temps réel
docker-compose restart backend # Redémarrer le backend
```

### Développement
```bash
npm run dev              # Mode développement avec rechargement
npm run build            # Build production
npm run prisma:studio    # Interface graphique pour la BD
```

### Scripts utiles
```bash
npm run test:api         # Tester tous les endpoints
npm run check:services   # Vérifier que tous les services fonctionnent
npm run db:init          # Initialiser avec des données de test
```

## 📖 Documentation Complète

Toute la documentation est disponible dans le dossier `backend/` :

- **README.md** - Documentation complète du backend
- **QUICK_START.md** - Guide de démarrage rapide
- **API_DOCUMENTATION.md** - Documentation détaillée de tous les endpoints
- **DEPLOYMENT.md** - Guide de déploiement en production
- **CONTRIBUTING.md** - Guide de contribution
- **CHANGELOG.md** - Historique des versions

Le fichier **PROJECT_SUMMARY.md** à la racine contient un résumé complet du projet.

## 🔗 Connecter le Frontend

Dans votre frontend, configurez l'URL de l'API :

```javascript
const API_URL = "http://localhost:8787/api";

// Exemple de requête
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'avocat@jure-ai.com',
    password: 'Lawyer123!'
  })
});

const data = await response.json();
const token = data.token; // À stocker pour les requêtes authentifiées
```

Pour les requêtes authentifiées :
```javascript
const response = await fetch(`${API_URL}/projects`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🎯 Prochaines Étapes

1. **Modifier le `.env`** avec vos vraies clés API
2. **Démarrer Docker** : `docker-compose up -d`
3. **Initialiser la BD** : `npm run prisma:migrate && npm run db:init`
4. **Tester l'API** : `npm run test:api`
5. **Connecter votre frontend** à `http://localhost:8787/api`

## ⚠️ Important

- Le fichier `.env` n'est PAS versionné (dans `.gitignore`)
- Vous devez ajouter vos vraies clés API pour que le système fonctionne
- MySQL met environ 30 secondes à démarrer la première fois

## 🆘 Problèmes Courants

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Redémarrer MySQL (peut mettre du temps au premier démarrage)
docker-compose restart mysql
```

### Port 8787 déjà utilisé
Changez le port dans `backend/.env` :
```env
PORT=3000
```

### Erreur Prisma
```bash
# Régénérer le client
npm run prisma:generate

# Réappliquer les migrations
npm run prisma:migrate
```

## 📞 Support

Pour toute question, consultez :
- La documentation dans `backend/README.md`
- Les logs : `docker-compose logs -f`
- L'API Documentation : `backend/API_DOCUMENTATION.md`

## ✨ Fonctionnalités Avancées

- **RAG (Retrieval Augmented Generation)** : L'IA peut chercher dans vos documents pour donner des réponses contextualisées
- **Audio** : Support complet de la transcription et de la synthèse vocale
- **WebSocket** : Conversations en temps réel
- **Versioning** : Les contrats sont versionnés automatiquement
- **Historique** : Toutes les actions sont enregistrées

---

**Statut** : ✅ Production Ready
**Version** : 1.0.0

Bon développement ! 🚀
