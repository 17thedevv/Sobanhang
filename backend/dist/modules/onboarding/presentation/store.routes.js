"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("./store.controller");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Route Tạo cửa hàng (US-04)
router.post('/', auth_middleware_1.verifySetupToken, store_controller_1.storeController.createStore);
// Route Cài đặt (US-28)
router.get('/settings', auth_middleware_1.verifyAccessToken, store_controller_1.storeController.getSettings);
router.put('/settings', auth_middleware_1.verifyAccessToken, store_controller_1.storeController.updateSettings);
router.put('/updateName', auth_middleware_1.verifyAccessToken, store_controller_1.storeController.updateStoreName);
exports.default = router;
