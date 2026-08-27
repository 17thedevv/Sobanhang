"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const customerController = new customer_controller_1.CustomerController();
// All customer routes require authentication
router.use(auth_middleware_1.verifyAccessToken);
router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);
exports.default = router;
