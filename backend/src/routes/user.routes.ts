import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listUsers } from '../controllers/user.controller';

const router = Router();

router.get('/', authenticate, listUsers);

export default router;

