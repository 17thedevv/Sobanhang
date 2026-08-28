import { Router } from 'express';
import { DebtController } from './debt.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const debtController = new DebtController();

// All debt routes require authentication
router.use(verifyAccessToken);

router.get('/summary', debtController.getSummary);
router.get('/customers', debtController.getDebtCustomers);
router.get('/customers/:customerId/transactions', debtController.getCustomerTransactions);
router.post('/transactions', debtController.createTransaction);

export const debtRoutes = router;
