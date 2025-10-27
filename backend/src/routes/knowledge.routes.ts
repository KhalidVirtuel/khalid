import { Router } from 'express';
import { knowledgeController, upload } from '../controllers/knowledge.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Upload un document dans la base de connaissance
router.post('/upload', upload.single('file'), knowledgeController.uploadDocument.bind(knowledgeController));

// Rechercher dans la base de connaissance
router.post('/search', knowledgeController.search.bind(knowledgeController));

// Lister tous les documents
router.get('/', knowledgeController.listDocuments.bind(knowledgeController));

// Récupérer un document spécifique
router.get('/:id', knowledgeController.getDocument.bind(knowledgeController));

// Télécharger un document
router.get('/:id/download', knowledgeController.downloadDocument.bind(knowledgeController));

// Supprimer un document
router.delete('/:id', knowledgeController.deleteDocument.bind(knowledgeController));

export default router;
