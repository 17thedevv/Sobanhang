import { Router } from 'express';
import { StockCheckController } from './stockCheck.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new StockCheckController();

router.use(verifyAccessToken);

router.get('/', controller.getChecks);
router.get('/:id', controller.getCheckById);
router.post('/', controller.createCheck);
router.put('/:id/status', controller.updateCheckStatus);

export default router;
