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

router.get('/reminders', debtController.getReminders);
router.post('/reminders', debtController.createReminder);
router.put('/reminders/:id/status', debtController.updateReminderStatus);

export const debtRoutes = router;
