# Documentation API - Jure AI (Adaptée au Frontend)

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
  "email": "avocat@example.com",
  "password": "Password123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "lawFirm": "Cabinet Dupont & Associés",
  "legalSpecialty": "Droit civil"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "email": "avocat@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "lawFirm": "Cabinet Dupont & Associés",
    "legalSpecialty": "Droit civil",
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
  "email": "avocat@example.com",
  "password": "Password123!"
}
```

---

## 2. Dossiers (Folders)

### 2.1 Créer un dossier

**Endpoint:** `POST /folders`

**Body:**
```json
{
  "name": "Affaire Martin vs Société X",
  "description": "Litige commercial...",
  "color": "#3b82f6"
}
```

### 2.2 Liste des dossiers

**Endpoint:** `GET /folders`

**Response:**
```json
{
  "folders": [
    {
      "id": "uuid",
      "name": "Affaire Martin",
      "description": "...",
      "color": "#3b82f6",
      "attachments": [],
      "timeline": [],
      "documents": [],
      "deadlines": [],
      "conversations": []
    }
  ]
}
```

### 2.3 Détails d'un dossier

**Endpoint:** `GET /folders/:folderId`

### 2.4 Mettre à jour un dossier

**Endpoint:** `PUT /folders/:folderId`

### 2.5 Supprimer un dossier

**Endpoint:** `DELETE /folders/:folderId`

---

## 3. Pièces Jointes (Attachments)

### 3.1 Ajouter une pièce jointe

**Endpoint:** `POST /folders/:folderId/attachments`

**Body:**
```json
{
  "name": "Contrat.pdf",
  "type": "CONTRACT",
  "url": "/uploads/contrat.pdf",
  "size": 123456
}
```

**Types disponibles:** `EVIDENCE`, `CONTRACT`, `DOCUMENT`, `OTHER`

### 3.2 Supprimer une pièce jointe

**Endpoint:** `DELETE /folders/attachments/:attachmentId`

---

## 4. Chronologie (Timeline)

### 4.1 Ajouter une entrée

**Endpoint:** `POST /folders/:folderId/timeline`

**Body:**
```json
{
  "title": "Audience préliminaire",
  "description": "Première audience...",
  "type": "HEARING",
  "date": "2024-02-15T10:00:00Z"
}
```

**Types:** `FACT`, `PROCEDURE`, `HEARING`, `DEADLINE`, `EVENT`

### 4.2 Supprimer une entrée

**Endpoint:** `DELETE /folders/timeline/:entryId`

---

## 5. Échéances (Deadlines)

### 5.1 Ajouter une échéance

**Endpoint:** `POST /folders/:folderId/deadlines`

**Body:**
```json
{
  "title": "Dépôt des conclusions",
  "description": "...",
  "dueDate": "2024-03-01T00:00:00Z",
  "priority": "HIGH"
}
```

**Priorités:** `LOW`, `MEDIUM`, `HIGH`, `URGENT`
**Statuts:** `PENDING`, `COMPLETED`, `OVERDUE`

### 5.2 Mettre à jour le statut

**Endpoint:** `PATCH /folders/deadlines/:deadlineId/status`

**Body:**
```json
{
  "status": "COMPLETED"
}
```

### 5.3 Supprimer une échéance

**Endpoint:** `DELETE /folders/deadlines/:deadlineId`

---

## 6. Documents Générés

### 6.1 Générer un document

**Endpoint:** `POST /folders/:folderId/documents`

**Body:**
```json
{
  "title": "Contrat de prestation",
  "type": "CONTRACT",
  "content": "CONTRAT DE PRESTATION...\n\n..."
}
```

**Types:** `CONTRACT`, `CONCLUSION`, `NOTE`, `LETTER`, `REPORT`

### 6.2 Mettre à jour un document

**Endpoint:** `PUT /folders/documents/:documentId`

**Body:**
```json
{
  "title": "Nouveau titre",
  "content": "Nouveau contenu..."
}
```

### 6.3 Supprimer un document

**Endpoint:** `DELETE /folders/documents/:documentId`

---

## 7. Chat (Conversations)

### 7.1 Créer une conversation

**Endpoint:** `POST /chat/conversations`

**Body:**
```json
{
  "title": "Consultation juridique",
  "folderId": "uuid"
}
```

### 7.2 Liste des conversations

**Endpoint:** `GET /chat/conversations?folderId=uuid`

### 7.3 Obtenir une conversation

**Endpoint:** `GET /chat/conversations/:conversationId`

### 7.4 Envoyer un message

**Endpoint:** `POST /chat/conversations/:conversationId/messages`

**Body:**
```json
{
  "content": "Quels sont les délais de prescription ?"
}
```

**Response:**
```json
{
  "userMessage": {
    "id": "uuid",
    "content": "Quels sont les délais...",
    "role": "USER",
    "createdAt": "..."
  },
  "assistantMessage": {
    "id": "uuid",
    "content": "En droit français...",
    "role": "ASSISTANT",
    "createdAt": "..."
  }
}
```

### 7.5 Déplacer une conversation

**Endpoint:** `PATCH /chat/conversations/:conversationId/move`

**Body:**
```json
{
  "folderId": "uuid"
}
```

### 7.6 Supprimer une conversation

**Endpoint:** `DELETE /chat/conversations/:conversationId`

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

---

## Différences avec l'ancienne version

### Changements principaux:
- **Projects** → **Folders** (renommé)
- Ajout des **Attachments** (pièces jointes)
- Ajout de la **Timeline** (chronologie)
- Ajout des **Deadlines** (échéances)
- Ajout des **Generated Documents**
- **ConversationSession** → **Conversation** (simplifié)
- Champs utilisateur adaptés au frontend (firstName, lastName, lawFirm, legalSpecialty)

### Structure de données alignée:
Toutes les structures de données correspondent maintenant exactement au frontend jure-ax.

---

## Intégration Frontend

### Configuration API
```typescript
const API_URL = "http://localhost:8787/api";
const token = localStorage.getItem('token');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### Exemples d'utilisation
```typescript
// Créer un dossier
const response = await fetch(`${API_URL}/folders`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Nouveau dossier',
    color: '#3b82f6'
  })
});

// Récupérer les dossiers
const folders = await fetch(`${API_URL}/folders`, { headers });

// Envoyer un message
const message = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ content: 'Mon message' })
});
```
