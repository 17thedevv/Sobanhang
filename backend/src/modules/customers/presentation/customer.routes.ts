import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication
router.use(verifyAccessToken);

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);

export default router;
