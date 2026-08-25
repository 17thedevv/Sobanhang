"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preference_controller_1 = require("./preference.controller");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.verifySetupToken, preference_controller_1.preferenceController.setPreference);
exports.default = router;
