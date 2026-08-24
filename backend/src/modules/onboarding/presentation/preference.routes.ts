import { Router } from 'express';
import { preferenceController } from './preference.controller';

const router = Router();

router.post('/', preferenceController.setPreference);

export default router;
