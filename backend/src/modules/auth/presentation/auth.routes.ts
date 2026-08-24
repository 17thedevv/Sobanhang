import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Route Đăng ký SĐT (US-03)
router.post('/register/phone', authController.registerPhone);

export default router;
