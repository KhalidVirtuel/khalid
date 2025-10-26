import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const contractController = new ContractController();

router.use(authenticateToken);

router.post('/generate', (req, res, next) => {
  contractController.generateContract(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  contractController.getContracts(req, res).catch(next);
});

router.get('/:contractId', (req, res, next) => {
  contractController.getContract(req, res).catch(next);
});

router.put('/:contractId', (req, res, next) => {
  contractController.updateContract(req, res).catch(next);
});

router.delete('/:contractId', (req, res, next) => {
  contractController.deleteContract(req, res).catch(next);
});

export default router;
