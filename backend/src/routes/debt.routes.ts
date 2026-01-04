import { Router } from 'express';
import {
  listDebts,
  getDebt,
  createDebtController,
  updateDebtController,
  deleteDebtController,
  payDebt,
} from '../controllers/debt.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', listDebts);
router.get('/:id', getDebt);
router.post('/', createDebtController);
router.put('/:id', updateDebtController);
router.delete('/:id', deleteDebtController);
router.patch('/:id/pay', payDebt);

export default router;

