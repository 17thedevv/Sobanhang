import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new OrdersController();

router.use(authMiddleware);

router.get('/', controller.getOrders);
router.post('/', controller.createOrder);

export default router;
