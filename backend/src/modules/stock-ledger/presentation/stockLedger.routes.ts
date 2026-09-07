import { Router } from 'express';
import { StockLedgerController } from './stockLedger.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new StockLedgerController();

router.use(verifyAccessToken);

router.get('/', controller.getTransactions);
router.get('/transactions', controller.getTransactions);
router.get('/products/:productId', controller.getProductLedger);
router.get('/summary', controller.getSummary);

export default router;
