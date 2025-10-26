# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.0.0] - 2024-01-01

### Ajouté

#### Infrastructure
- Configuration complète du backend avec Node.js, Express et TypeScript
- Intégration de MySQL avec Prisma ORM
- Configuration de Qdrant pour la recherche vectorielle (RAG)
- Docker Compose pour orchestrer MySQL, Qdrant et le backend
- Configuration des variables d'environnement

#### Authentification
- Système d'authentification JWT complet
- Inscription et connexion des utilisateurs
- Gestion des rôles (ADMIN, LAWYER, CLIENT)
- Middleware d'authentification et d'autorisation
- Gestion de profil utilisateur

#### Gestion de Projets
- CRUD complet pour les projets juridiques
- Statuts de projets (OPEN, IN_PROGRESS, PENDING, CLOSED, ARCHIVED)
- Niveaux de priorité (LOW, MEDIUM, HIGH, URGENT)
- Historique d'activités pour chaque projet

#### Conversations avec l'IA
- Système de sessions de conversation
- Support pour les messages texte
- Support pour les messages audio avec transcription (Whisper)
- Intégration avec Groq (Mixtral-8x7b) pour les réponses
- RAG (Retrieval Augmented Generation) avec recherche dans les documents
- WebSocket pour les conversations en temps réel

#### Gestion de Documents
- Upload de documents (PDF, TXT, DOCX, etc.)
- Extraction automatique du texte
- Indexation automatique dans Qdrant
- Recherche sémantique dans les documents
- Analyse de documents avec l'IA
- Téléchargement de documents
- Catégorisation (CONTRACT, LEGAL_NOTICE, COURT_DECISION, etc.)

#### Génération de Contrats
- Génération automatique de contrats avec l'IA
- Support pour différents types de contrats
- Système de versioning
- États de contrats (DRAFT, REVIEW, APPROVED, SIGNED, ARCHIVED)
- Édition et mise à jour de contrats

#### Services IA
- Service LLM avec Groq
- Service d'embeddings avec OpenAI (text-embedding-3-small)
- Service de Speech-to-Text avec Whisper
- Service de Text-to-Speech
- Service de recherche vectorielle avec Qdrant

#### Documentation
- README complet avec instructions d'installation
- API Documentation détaillée pour tous les endpoints
- Guide de démarrage rapide (QUICK_START.md)
- Scripts de test et d'initialisation
- Exemples d'utilisation avec curl

#### Sécurité
- Hashage des mots de passe avec bcrypt
- Tokens JWT avec expiration
- Validation des entrées avec Zod
- Gestion centralisée des erreurs
- CORS configuré

### À venir

- [ ] Tests unitaires et d'intégration
- [ ] Rate limiting pour l'API
- [ ] Système de notifications
- [ ] Export de données (PDF, Excel)
- [ ] Webhooks
- [ ] Amélioration du système de permissions
- [ ] Intégration de calendrier
- [ ] Système de facturation
- [ ] Support multilingue
- [ ] Dashboard analytics

---

## Format

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

### Types de changements

- **Ajouté** pour les nouvelles fonctionnalités.
- **Modifié** pour les changements dans les fonctionnalités existantes.
- **Déprécié** pour les fonctionnalités qui seront bientôt supprimées.
- **Supprimé** pour les fonctionnalités supprimées.
- **Corrigé** pour les corrections de bugs.
- **Sécurité** en cas de vulnérabilités.
