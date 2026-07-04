"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// /api/chat
router.post('/', auth_1.authMiddleware, chatController_1.handleChat);
exports.default = router;
