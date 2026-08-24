import { Router } from 'express';
import { storeController } from './store.controller';

const router = Router();

// Route Tạo cửa hàng (US-04)
router.post('/', storeController.createStore);

export default router;
