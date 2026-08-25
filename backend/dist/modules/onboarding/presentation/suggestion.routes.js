"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const suggestion_controller_1 = require("./suggestion.controller");
const router = (0, express_1.Router)();
router.get('/', suggestion_controller_1.suggestionController.getSuggestions);
exports.default = router;
