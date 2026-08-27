import { Router } from 'express';
import { CashbookController } from './cashbook.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const cashbookController = new CashbookController();

router.use(verifyAccessToken);

router.get('/sources', cashbookController.getSources.bind(cashbookController));
router.post('/sources', cashbookController.createSource.bind(cashbookController));
router.put('/sources/:id/order', cashbookController.updateSourceOrder.bind(cashbookController));
router.post('/transfer', cashbookController.transferMoney.bind(cashbookController));
router.post('/collect', cashbookController.collectMoney.bind(cashbookController));

export const cashbookRoutes = router;
