import { Router } from 'express';
import { authController } from './auth.controller';
import { verifySetupToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// Route Đăng ký SĐT (US-03)
router.post('/register/email', authController.registerEmail);
router.post('/verify-otp', authController.verifyOtp);
router.post('/set-password', verifySetupToken, authController.setPassword);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

export default router;
