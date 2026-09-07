import { Router } from 'express';
import { StockIssueController } from './stockIssue.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new StockIssueController();

router.use(verifyAccessToken);

router.get('/', controller.getIssues);
router.get('/:id', controller.getIssueById);
router.post('/', controller.createIssue);
router.put('/:id/status', controller.updateIssueStatus);

export default router;
