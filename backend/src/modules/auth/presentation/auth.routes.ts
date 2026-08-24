import { Router } from 'express';
import { authController } from './auth.controller';
import { verifySetupToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// Route Đăng ký SĐT (US-03)
router.post('/register/phone', authController.registerPhone);
router.post('/set-password', verifySetupToken, authController.setPassword);

export default router;
