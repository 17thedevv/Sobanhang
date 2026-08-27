import { Router } from 'express';
import { CashbookController } from './cashbook.controller';
import { AuthMiddleware } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const cashbookController = new CashbookController();

router.use(AuthMiddleware.verifyAccessToken);

router.get('/sources', cashbookController.getSources.bind(cashbookController));
router.post('/sources', cashbookController.createSource.bind(cashbookController));
router.put('/sources/:id/order', cashbookController.updateSourceOrder.bind(cashbookController));
router.post('/transfer', cashbookController.transferMoney.bind(cashbookController));

export const cashbookRoutes = router;
