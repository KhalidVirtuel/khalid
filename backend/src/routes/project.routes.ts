import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const projectController = new ProjectController();

router.use(authenticateToken);

router.post('/', (req, res, next) => {
  projectController.createProject(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  projectController.getProjects(req, res).catch(next);
});

router.get('/:projectId', (req, res, next) => {
  projectController.getProject(req, res).catch(next);
});

router.put('/:projectId', (req, res, next) => {
  projectController.updateProject(req, res).catch(next);
});

router.delete('/:projectId', (req, res, next) => {
  projectController.deleteProject(req, res).catch(next);
});

router.get('/:projectId/activity', (req, res, next) => {
  projectController.getActivityLog(req, res).catch(next);
});

export default router;
