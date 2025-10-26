import { Router } from 'express';
import { FolderController } from '../controllers/folder.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const folderController = new FolderController();

router.use(authenticateToken);

// Folders
router.post('/', (req, res, next) => {
  folderController.createFolder(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  folderController.getFolders(req, res).catch(next);
});

router.get('/:folderId', (req, res, next) => {
  folderController.getFolder(req, res).catch(next);
});

router.put('/:folderId', (req, res, next) => {
  folderController.updateFolder(req, res).catch(next);
});

router.delete('/:folderId', (req, res, next) => {
  folderController.deleteFolder(req, res).catch(next);
});

// Attachments
router.post('/:folderId/attachments', (req, res, next) => {
  folderController.addAttachment(req, res).catch(next);
});

router.delete('/attachments/:attachmentId', (req, res, next) => {
  folderController.deleteAttachment(req, res).catch(next);
});

// Timeline
router.post('/:folderId/timeline', (req, res, next) => {
  folderController.addTimelineEntry(req, res).catch(next);
});

router.delete('/timeline/:entryId', (req, res, next) => {
  folderController.deleteTimelineEntry(req, res).catch(next);
});

// Deadlines
router.post('/:folderId/deadlines', (req, res, next) => {
  folderController.addDeadline(req, res).catch(next);
});

router.patch('/deadlines/:deadlineId/status', (req, res, next) => {
  folderController.updateDeadlineStatus(req, res).catch(next);
});

router.delete('/deadlines/:deadlineId', (req, res, next) => {
  folderController.deleteDeadline(req, res).catch(next);
});

// Generated Documents
router.post('/:folderId/documents', (req, res, next) => {
  folderController.generateDocument(req, res).catch(next);
});

router.put('/documents/:documentId', (req, res, next) => {
  folderController.updateDocument(req, res).catch(next);
});

router.delete('/documents/:documentId', (req, res, next) => {
  folderController.deleteDocument(req, res).catch(next);
});

export default router;
