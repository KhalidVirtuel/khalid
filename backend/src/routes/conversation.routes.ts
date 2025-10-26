import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const conversationController = new ConversationController();

router.use(authenticateToken);

router.post('/sessions', (req, res, next) => {
  conversationController.createSession(req, res).catch(next);
});

router.get('/sessions', (req, res, next) => {
  conversationController.getSessions(req, res).catch(next);
});

router.get('/sessions/:sessionId', (req, res, next) => {
  conversationController.getSession(req, res).catch(next);
});

router.post('/sessions/:sessionId/messages', (req, res, next) => {
  conversationController.sendMessage(req, res).catch(next);
});

router.post('/sessions/:sessionId/messages/audio', (req, res, next) => {
  conversationController.sendAudioMessage(req, res).catch(next);
});

router.delete('/sessions/:sessionId', (req, res, next) => {
  conversationController.deleteSession(req, res).catch(next);
});

export default router;
