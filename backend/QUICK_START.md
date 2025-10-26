# Guide de Démarrage Rapide - Jure AI Backend

## Installation en 5 minutes

### 1. Prérequis

- Docker Desktop installé et démarré
- Node.js 20+ (pour le développement local)
- Clés API : OpenAI et Groq

### 2. Configuration

1. **Modifier le fichier `.env`** et ajouter vos clés API :

```bash
# Remplacer les valeurs suivantes
GROQ_API_KEY=votre_cle_groq_ici
OPENAI_API_KEY=votre_cle_openai_ici

# Générer un secret JWT sécurisé (utilisez un générateur de mots de passe aléatoire)
JWT_SECRET=votre_secret_jwt_tres_securise_ici
```

### 3. Démarrage avec Docker (Recommandé)

```bash
# Démarrer tous les services (MySQL, Qdrant, Backend)
docker-compose up -d

# Vérifier que les services sont démarrés
docker-compose ps

# Voir les logs
docker-compose logs -f backend
```

L'API sera accessible sur : **http://localhost:8787**

### 4. Initialiser la base de données

```bash
# Installer les dépendances localement (nécessaire pour les commandes Prisma)
npm install

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Initialiser avec des données de test (optionnel)
npx tsx scripts/init-db.ts
```

### 5. Tester l'API

#### Test de santé
```bash
curl http://localhost:8787/health
```

#### Créer un compte
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Utilisateur Test",
    "role": "CLIENT"
  }'
```

Si vous avez initialisé avec des données de test, vous pouvez vous connecter avec :
- **Email:** `avocat@jure-ai.com`
- **Password:** `Lawyer123!`

---

## Développement Local (sans Docker pour le backend)

Si vous préférez développer en local sans Docker pour le backend :

### 1. Démarrer uniquement MySQL et Qdrant

```bash
docker-compose up mysql qdrant -d
```

### 2. Mettre à jour le `.env` pour le développement local

```bash
# Changer l'hôte de mysql à localhost
MYSQL_HOST=localhost
DATABASE_URL="mysql://jure:jur3pass@localhost:3306/jure_ai"

# Changer l'URL de Qdrant
QDRANT_URL=http://localhost:6333
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Générer Prisma et migrer

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Démarrer en mode développement

```bash
npm run dev
```

Le serveur démarre avec rechargement automatique sur : **http://localhost:8787**

---

## Commandes utiles

### Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer le backend uniquement
docker-compose restart backend

# Reconstruire les images
docker-compose up -d --build

# Supprimer tous les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Prisma

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate

# Pousser le schéma sans créer de migration
npm run prisma:push

# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio
```

### Base de données

```bash
# Se connecter à MySQL
docker exec -it jure-ai-mysql mysql -u jure -p
# Password: jur3pass

# Sauvegarder la base de données
docker exec jure-ai-mysql mysqldump -u jure -pjur3pass jure_ai > backup.sql

# Restaurer la base de données
docker exec -i jure-ai-mysql mysql -u jure -pjur3pass jure_ai < backup.sql
```

---

## Résolution des problèmes

### Le backend ne démarre pas

1. Vérifier que MySQL et Qdrant sont démarrés :
```bash
docker-compose ps
```

2. Vérifier les logs :
```bash
docker-compose logs backend
```

3. Vérifier que les variables d'environnement sont correctes dans `.env`

### Erreur de connexion à MySQL

1. Attendre que MySQL soit complètement démarré (peut prendre 30-60 secondes)
2. Vérifier que le port 3306 n'est pas déjà utilisé
3. Redémarrer MySQL :
```bash
docker-compose restart mysql
```

### Erreur avec Qdrant

1. Vérifier que Qdrant est accessible :
```bash
curl http://localhost:6333/health
```

2. Redémarrer Qdrant :
```bash
docker-compose restart qdrant
```

### Port 8787 déjà utilisé

Modifier le port dans `.env` :
```bash
PORT=3000
```

Puis redémarrer :
```bash
docker-compose restart backend
```

---

## Prochaines étapes

1. ✅ Tester les endpoints avec Postman ou curl
2. ✅ Connecter le frontend au backend
3. ✅ Uploader des documents et tester le RAG
4. ✅ Tester les conversations avec l'IA
5. ✅ Générer des contrats

Consultez la documentation complète dans `API_DOCUMENTATION.md` pour plus de détails sur les endpoints.

---

## Support

Pour toute question ou problème :
- Consulter `README.md` pour la documentation complète
- Consulter `API_DOCUMENTATION.md` pour les détails des endpoints
- Vérifier les logs : `docker-compose logs -f`
