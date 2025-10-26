import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const chatController = new ChatController();

router.use(authenticateToken);

router.post('/conversations', (req, res, next) => {
  chatController.createConversation(req, res).catch(next);
});

router.get('/conversations', (req, res, next) => {
  chatController.getConversations(req, res).catch(next);
});

router.get('/conversations/:conversationId', (req, res, next) => {
  chatController.getConversation(req, res).catch(next);
});

router.post('/conversations/:conversationId/messages', (req, res, next) => {
  chatController.sendMessage(req, res).catch(next);
});

router.patch('/conversations/:conversationId/move', (req, res, next) => {
  chatController.moveConversation(req, res).catch(next);
});

router.delete('/conversations/:conversationId', (req, res, next) => {
  chatController.deleteConversation(req, res).catch(next);
});

export default router;
