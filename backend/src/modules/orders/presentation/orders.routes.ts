import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new OrdersController();

router.use(verifyAccessToken);

router.get('/', controller.getOrders);
router.post('/', controller.createOrder);

export default router;
