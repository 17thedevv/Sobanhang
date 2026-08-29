import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { verifyAccessToken } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication
router.use(verifyAccessToken);

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);

router.get('/groups/all', customerController.getGroups);
router.post('/groups/create', customerController.createGroup);
router.get('/groups/:id', customerController.getGroupDetail);
router.post('/groups/:id/add', customerController.addCustomersToGroup);
router.post('/groups/:id/remove', customerController.removeCustomersFromGroup);
router.delete('/groups/:id', customerController.deleteGroup);

router.get('/tags/all', customerController.getTags);
router.post('/tags/create', customerController.createTag);
router.delete('/tags/:id', customerController.deleteTag);

// These must be at the bottom to avoid shadowing
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/:id/notes', customerController.addNote);

export default router;
