# Documentation API - Jure AI

## URL de base

```
http://localhost:8787/api
```

## Authentification

Toutes les routes (sauf `/auth/register` et `/auth/login`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

---

## 1. Authentification

### 1.1 Inscription

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "Jean Dupont",
  "role": "CLIENT",  // CLIENT, LAWYER, ADMIN
  "phone": "+33612345678",
  "address": "123 Rue Example, Paris"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jean Dupont",
    "role": "CLIENT",
    "phone": "+33612345678",
    "address": "123 Rue Example, Paris",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2 Connexion

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jean Dupont",
    "role": "CLIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.3 Obtenir le profil

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jean Dupont",
    "role": "CLIENT",
    "phone": "+33612345678",
    "address": "123 Rue Example, Paris",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 2. Projets

### 2.1 Créer un projet

**Endpoint:** `POST /projects`

**Body:**
```json
{
  "title": "Affaire Martin vs Société X",
  "description": "Litige commercial concernant...",
  "status": "OPEN",  // OPEN, IN_PROGRESS, PENDING, CLOSED, ARCHIVED
  "priority": "HIGH"  // LOW, MEDIUM, HIGH, URGENT
}
```

### 2.2 Liste des projets

**Endpoint:** `GET /projects?status=OPEN`

**Query params (optionnels):**
- `status`: Filtrer par statut

### 2.3 Détails d'un projet

**Endpoint:** `GET /projects/:projectId`

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "title": "Affaire Martin vs Société X",
    "description": "...",
    "status": "OPEN",
    "priority": "HIGH",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "documents": [...],
    "conversationSessions": [...],
    "contracts": [...]
  }
}
```

### 2.4 Mettre à jour un projet

**Endpoint:** `PUT /projects/:projectId`

**Body:**
```json
{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

### 2.5 Supprimer un projet

**Endpoint:** `DELETE /projects/:projectId`

### 2.6 Historique d'activités

**Endpoint:** `GET /projects/:projectId/activity`

---

## 3. Conversations

### 3.1 Créer une session de conversation

**Endpoint:** `POST /conversations/sessions`

**Body:**
```json
{
  "title": "Consultation juridique",
  "projectId": "uuid"  // Optionnel
}
```

### 3.2 Liste des sessions

**Endpoint:** `GET /conversations/sessions?projectId=uuid`

### 3.3 Obtenir une session avec messages

**Endpoint:** `GET /conversations/sessions/:sessionId`

### 3.4 Envoyer un message texte

**Endpoint:** `POST /conversations/sessions/:sessionId/messages`

**Body:**
```json
{
  "content": "Quels sont les délais de prescription en droit commercial ?",
  "useRAG": true  // Utiliser la recherche sémantique dans les documents
}
```

**Response:**
```json
{
  "userMessage": {
    "id": "uuid",
    "sessionId": "uuid",
    "userId": "uuid",
    "role": "USER",
    "content": "Quels sont les délais...",
    "messageType": "TEXT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "uuid",
    "sessionId": "uuid",
    "userId": "uuid",
    "role": "ASSISTANT",
    "content": "En droit commercial français...",
    "messageType": "TEXT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.5 Envoyer un message audio

**Endpoint:** `POST /conversations/sessions/:sessionId/messages/audio`

**Form Data:**
- `audio`: Fichier audio (mp3, wav, etc.)

**Note:** Le fichier sera transcrit automatiquement avec Whisper.

### 3.6 Supprimer une session

**Endpoint:** `DELETE /conversations/sessions/:sessionId`

---

## 4. Documents

### 4.1 Upload un document

**Endpoint:** `POST /documents/upload`

**Form Data:**
- `document`: Fichier (PDF, TXT, DOCX, etc.)
- `title`: Titre du document (optionnel)
- `projectId`: UUID du projet (optionnel)
- `documentType`: Type de document (CONTRACT, LEGAL_NOTICE, COURT_DECISION, etc.)

**Response:**
```json
{
  "message": "Document uploadé avec succès",
  "document": {
    "id": "uuid",
    "title": "Contrat de prestation",
    "filename": "contrat.pdf",
    "filepath": "/uploads/...",
    "filesize": 123456,
    "mimetype": "application/pdf",
    "documentType": "CONTRACT",
    "projectId": "uuid",
    "userId": "uuid",
    "isIndexed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Le document sera automatiquement indexé dans Qdrant en arrière-plan.

### 4.2 Liste des documents

**Endpoint:** `GET /documents?projectId=uuid&documentType=CONTRACT`

**Query params (optionnels):**
- `projectId`: Filtrer par projet
- `documentType`: Filtrer par type

### 4.3 Détails d'un document

**Endpoint:** `GET /documents/:documentId`

### 4.4 Télécharger un document

**Endpoint:** `GET /documents/:documentId/download`

### 4.5 Analyser un document avec l'IA

**Endpoint:** `POST /documents/:documentId/analyze`

**Body:**
```json
{
  "question": "Résume les principales clauses de ce contrat"  // Optionnel
}
```

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "title": "Contrat de prestation",
    "filename": "contrat.pdf"
  },
  "analysis": "Ce contrat de prestation comprend les clauses suivantes..."
}
```

### 4.6 Recherche sémantique dans les documents

**Endpoint:** `POST /documents/search`

**Body:**
```json
{
  "query": "clauses de résiliation",
  "projectId": "uuid",  // Optionnel
  "limit": 5  // Nombre de résultats (défaut: 5)
}
```

**Response:**
```json
{
  "query": "clauses de résiliation",
  "results": [
    {
      "id": "uuid_chunk_0",
      "score": 0.89,
      "payload": {
        "documentId": "uuid",
        "chunkIndex": 0,
        "text": "Article 12 - Résiliation...",
        "filename": "contrat.pdf",
        "userId": "uuid",
        "projectId": "uuid"
      }
    }
  ]
}
```

### 4.7 Supprimer un document

**Endpoint:** `DELETE /documents/:documentId`

---

## 5. Contrats

### 5.1 Générer un contrat avec l'IA

**Endpoint:** `POST /contracts/generate`

**Body:**
```json
{
  "projectId": "uuid",
  "title": "Contrat de prestation de services",
  "contractType": "Contrat de prestation de services",
  "details": {
    "prestataire": {
      "nom": "Cabinet Juridique ABC",
      "adresse": "123 Rue Example, Paris"
    },
    "client": {
      "nom": "Société XYZ",
      "adresse": "456 Avenue Test, Lyon"
    },
    "objet": "Conseil juridique en droit des affaires",
    "duree": "12 mois",
    "montant": "50000 EUR"
  }
}
```

**Response:**
```json
{
  "message": "Contrat généré avec succès",
  "contract": {
    "id": "uuid",
    "title": "Contrat de prestation de services",
    "content": "CONTRAT DE PRESTATION DE SERVICES\n\nEntre les soussignés...",
    "projectId": "uuid",
    "status": "DRAFT",
    "version": 1,
    "generatedBy": "AI",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.2 Liste des contrats

**Endpoint:** `GET /contracts?projectId=uuid&status=DRAFT`

**Query params (optionnels):**
- `projectId`: Filtrer par projet
- `status`: Filtrer par statut (DRAFT, REVIEW, APPROVED, SIGNED, ARCHIVED)

### 5.3 Détails d'un contrat

**Endpoint:** `GET /contracts/:contractId`

### 5.4 Mettre à jour un contrat

**Endpoint:** `PUT /contracts/:contractId`

**Body:**
```json
{
  "title": "Nouveau titre",
  "content": "Contenu modifié...",
  "status": "REVIEW"
}
```

**Note:** Si le contenu est modifié, la version sera automatiquement incrémentée.

### 5.5 Supprimer un contrat

**Endpoint:** `DELETE /contracts/:contractId`

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Accès interdit |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur |

## Format des erreurs

```json
{
  "status": "error",
  "message": "Description de l'erreur"
}
```
