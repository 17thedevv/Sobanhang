import { Router } from 'express';
import { preferenceController } from './preference.controller';
import { verifySetupToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/', verifySetupToken, preferenceController.setPreference);

export default router;
