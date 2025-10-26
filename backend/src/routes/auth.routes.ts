import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get('/profile', authenticateToken, (req, res, next) => {
  authController.getProfile(req, res).catch(next);
});

router.put('/profile', authenticateToken, (req, res, next) => {
  authController.updateProfile(req, res).catch(next);
});

export default router;
