import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new ProductsController();

router.use(authMiddleware);

router.get('/', controller.getAllProducts);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

export default router;
