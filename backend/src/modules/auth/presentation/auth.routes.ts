import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifySetupToken, verifyResetToken, verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register/email', authController.registerEmail);
router.post('/verify-otp', authController.verifyOtp);
router.post('/set-password', verifySetupToken, authController.setPassword);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', verifyAccessToken, authController.getMe);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', verifyResetToken, authController.resetPassword);

export default router;
