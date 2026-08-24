import { Router } from 'express';
import { storeController } from './store.controller';
import { verifySetupToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// Route Tạo cửa hàng (US-04)
router.post('/', verifySetupToken, storeController.createStore);

export default router;
