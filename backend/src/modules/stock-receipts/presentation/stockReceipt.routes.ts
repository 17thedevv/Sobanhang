import { Router } from 'express';
import { StockReceiptController } from './stockReceipt.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

export const stockReceiptRoutes = Router();
const controller = new StockReceiptController();

stockReceiptRoutes.use(verifyAccessToken);

stockReceiptRoutes.get('/', controller.getReceipts.bind(controller));
stockReceiptRoutes.get('/:id', controller.getReceiptById.bind(controller));
stockReceiptRoutes.post('/', controller.createReceipt.bind(controller));
stockReceiptRoutes.put('/:id/confirm', controller.confirmReceipt.bind(controller));
stockReceiptRoutes.put('/:id/pay', controller.payReceiptDebt.bind(controller));
stockReceiptRoutes.delete('/:id', controller.deleteReceipt.bind(controller));
