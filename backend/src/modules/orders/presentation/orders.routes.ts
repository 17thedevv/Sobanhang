import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new OrdersController();

router.use(verifyAccessToken);

router.get('/', controller.getOrders);
router.post('/', controller.createOrder);
router.get('/:id', controller.getOrderById);
router.put('/:id/cancel', controller.cancelOrder);
router.put('/:id/collect-payment', controller.collectPayment);

export const orderRoutes = router;
export default router;
