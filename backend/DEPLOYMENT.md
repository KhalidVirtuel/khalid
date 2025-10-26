# Guide de Déploiement

## Déploiement en Production

### Prérequis

- Serveur avec Docker et Docker Compose installés
- Nom de domaine configuré (optionnel)
- Certificat SSL (pour HTTPS)
- Clés API OpenAI et Groq

### 1. Préparation du serveur

```bash
# Se connecter au serveur
ssh user@your-server.com

# Installer Docker (si pas déjà installé)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Cloner le projet

```bash
cd /opt
sudo git clone <votre-repo-url> jure-ai
cd jure-ai/backend
```

### 3. Configuration

```bash
# Copier le fichier .env
sudo cp .env.example .env

# Éditer le fichier .env
sudo nano .env
```

**Variables importantes pour la production :**

```env
# Environment
NODE_ENV=production

# Générer un JWT secret fort
JWT_SECRET=<générer-un-secret-fort-ici>

# MySQL - Utiliser des mots de passe forts
MYSQL_PASSWORD=<mot-de-passe-fort>
MYSQL_ROOT_PASSWORD=<mot-de-passe-fort>

# API Keys
GROQ_API_KEY=<votre-clé>
OPENAI_API_KEY=<votre-clé>

# Qdrant - Ajouter une clé API en production
QDRANT_API_KEY=<générer-une-clé>
```

### 4. Démarrer les services

```bash
# Construire et démarrer
sudo docker-compose up -d --build

# Vérifier les logs
sudo docker-compose logs -f

# Vérifier l'état des services
sudo docker-compose ps
```

### 5. Initialiser la base de données

```bash
# Appliquer les migrations
sudo docker-compose exec backend npm run prisma:migrate

# Initialiser avec un admin (optionnel)
sudo docker-compose exec backend npm run db:init
```

### 6. Configuration Nginx (Reverse Proxy)

Installer Nginx :

```bash
sudo apt update
sudo apt install nginx
```

Créer la configuration :

```bash
sudo nano /etc/nginx/sites-available/jure-ai
```

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/jure-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d api.votre-domaine.com

# Le certificat sera renouvelé automatiquement
```

### 8. Monitoring et Logs

```bash
# Voir les logs
sudo docker-compose logs -f backend

# Logs MySQL
sudo docker-compose logs -f mysql

# Logs Qdrant
sudo docker-compose logs -f qdrant

# Utiliser journalctl pour les logs système
sudo journalctl -u docker -f
```

### 9. Sauvegarde de la base de données

Créer un script de sauvegarde :

```bash
sudo nano /opt/jure-ai/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/jure-ai/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde MySQL
docker exec jure-ai-mysql mysqldump -u jure -pjur3pass jure_ai > $BACKUP_DIR/mysql_$DATE.sql

# Sauvegarde Qdrant
docker exec jure-ai-qdrant tar -czf - /qdrant/storage > $BACKUP_DIR/qdrant_$DATE.tar.gz

# Garder seulement les 30 dernières sauvegardes
find $BACKUP_DIR -name "mysql_*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "qdrant_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /opt/jure-ai/backup.sh
```

Ajouter à crontab :

```bash
sudo crontab -e
```

```
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /opt/jure-ai/backup.sh >> /var/log/jure-ai-backup.log 2>&1
```

### 10. Mises à jour

```bash
cd /opt/jure-ai/backend

# Sauvegarder avant la mise à jour
sudo /opt/jure-ai/backup.sh

# Récupérer les dernières modifications
sudo git pull

# Reconstruire et redémarrer
sudo docker-compose up -d --build

# Appliquer les migrations si nécessaire
sudo docker-compose exec backend npm run prisma:migrate
```

## Déploiement sur des plateformes Cloud

### AWS (EC2)

1. Lancer une instance EC2 (Ubuntu 22.04 recommandé)
2. Configurer le Security Group (ouvrir les ports 80, 443, 22)
3. Suivre les étapes de déploiement ci-dessus

### DigitalOcean

1. Créer un Droplet (Docker One-Click App)
2. Configurer le firewall
3. Suivre les étapes de déploiement ci-dessus

### Heroku (Alternative sans Docker)

```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer une app
heroku create jure-ai-backend

# Ajouter les add-ons
heroku addons:create jawsdb:kitefin  # MySQL
# Pour Qdrant, utiliser un service externe

# Configurer les variables d'environnement
heroku config:set GROQ_API_KEY=xxx
heroku config:set OPENAI_API_KEY=xxx
heroku config:set JWT_SECRET=xxx

# Déployer
git push heroku main
```

## Variables d'environnement en Production

| Variable | Description | Exemple |
|----------|-------------|---------|
| NODE_ENV | Environnement | `production` |
| PORT | Port du serveur | `8787` |
| JWT_SECRET | Secret pour JWT | Généré aléatoirement |
| DATABASE_URL | URL de la base de données | `mysql://user:pass@host:3306/db` |
| GROQ_API_KEY | Clé Groq | Votre clé API |
| OPENAI_API_KEY | Clé OpenAI | Votre clé API |
| QDRANT_URL | URL Qdrant | `http://qdrant:6333` |
| QDRANT_API_KEY | Clé Qdrant (prod) | Généré aléatoirement |

## Sécurité

### Bonnes pratiques

1. **Utiliser des mots de passe forts** pour MySQL et les utilisateurs
2. **Activer le firewall** et n'ouvrir que les ports nécessaires
3. **Configurer HTTPS** avec Let's Encrypt
4. **Limiter les tentatives de connexion** (rate limiting)
5. **Sauvegarder régulièrement** les données
6. **Mettre à jour** Docker et les dépendances régulièrement
7. **Monitorer** les logs et les erreurs
8. **Ne jamais committer** les fichiers .env

### Rate Limiting (À implémenter)

Installer express-rate-limit :

```bash
npm install express-rate-limit
```

Dans `src/server.ts` :

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});

app.use('/api/', limiter);
```

## Monitoring

### Installer PM2 (alternative à Docker)

```bash
npm install -g pm2

# Démarrer l'application
pm2 start dist/server.js --name jure-ai

# Monitoring
pm2 monit

# Logs
pm2 logs jure-ai

# Redémarrage automatique
pm2 startup
pm2 save
```

### Health Checks

Configurer des health checks pour surveiller l'état de l'API :

```bash
# Créer un script de monitoring
sudo nano /opt/jure-ai/monitor.sh
```

```bash
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/health)

if [ $STATUS -ne 200 ]; then
  echo "API is down! Status: $STATUS"
  # Envoyer une notification (email, Slack, etc.)
  # Redémarrer si nécessaire
  docker-compose restart backend
fi
```

## Support

Pour toute question sur le déploiement, consultez la documentation ou créez une Issue sur GitHub.
