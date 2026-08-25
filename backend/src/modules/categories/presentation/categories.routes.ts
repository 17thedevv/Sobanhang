import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const categoriesController = new CategoriesController();

router.use(verifyAccessToken);

router.get('/', categoriesController.getAllCategories);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;
