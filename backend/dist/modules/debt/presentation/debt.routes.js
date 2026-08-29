"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtRoutes = void 0;
const express_1 = require("express");
const debt_controller_1 = require("./debt.controller");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const debtController = new debt_controller_1.DebtController();
// All debt routes require authentication
router.use(auth_middleware_1.verifyAccessToken);
router.get('/summary', debtController.getSummary);
router.get('/customers', debtController.getDebtCustomers);
router.get('/customers/:customerId/transactions', debtController.getCustomerTransactions);
router.post('/transactions', debtController.createTransaction);
router.get('/reminders', debtController.getReminders);
router.post('/reminders', debtController.createReminder);
router.put('/reminders/:id/status', debtController.updateReminderStatus);
exports.debtRoutes = router;
