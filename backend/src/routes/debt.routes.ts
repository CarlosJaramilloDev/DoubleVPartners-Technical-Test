import { Router } from 'express';
import {
  listDebts,
  getDebt,
  createDebtController,
  updateDebtController,
  deleteDebtController,
  payDebt,
} from '../controllers/debt.controller';
import { exportDebts } from '../controllers/export.controller';
import { getStats } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', listDebts);
router.get('/export', exportDebts);
router.get('/stats', getStats);
router.get('/:id', getDebt);
router.post('/', createDebtController);
router.put('/:id', updateDebtController);
router.delete('/:id', deleteDebtController);
router.patch('/:id/pay', payDebt);

export default router;

