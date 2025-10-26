import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const documentController = new DocumentController();

router.use(authenticateToken);

router.post('/upload', (req, res, next) => {
  documentController.uploadDocument(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  documentController.getDocuments(req, res).catch(next);
});

router.get('/:documentId', (req, res, next) => {
  documentController.getDocument(req, res).catch(next);
});

router.get('/:documentId/download', (req, res, next) => {
  documentController.downloadDocument(req, res).catch(next);
});

router.post('/:documentId/analyze', (req, res, next) => {
  documentController.analyzeDocument(req, res).catch(next);
});

router.post('/search', (req, res, next) => {
  documentController.searchDocuments(req, res).catch(next);
});

router.delete('/:documentId', (req, res, next) => {
  documentController.deleteDocument(req, res).catch(next);
});

export default router;
