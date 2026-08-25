import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.use(verifyAccessToken);

router.get('/stats', controller.getStats);

export default router;
