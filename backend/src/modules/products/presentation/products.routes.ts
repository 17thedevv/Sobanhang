import { Router } from 'express';
import { ProductsController } from './products.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new ProductsController();

router.use(verifyAccessToken);

router.get('/', controller.getAllProducts);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

export default router;
