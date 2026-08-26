import { Router } from 'express';
import { storeController } from './store.controller';
import { verifySetupToken, verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// Route Tạo cửa hàng (US-04)
router.post('/', verifySetupToken, storeController.createStore);

// Route Cài đặt (US-28)
router.get('/settings', verifyAccessToken, storeController.getSettings);
router.put('/settings', verifyAccessToken, storeController.updateSettings);
router.put('/updateName', verifyAccessToken, storeController.updateStoreName);

export default router;
