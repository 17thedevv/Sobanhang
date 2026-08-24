import { Router } from 'express';
import { suggestionController } from './suggestion.controller';

const router = Router();

router.get('/', suggestionController.getSuggestions);

export default router;
