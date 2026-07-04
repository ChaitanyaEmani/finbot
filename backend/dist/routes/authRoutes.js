"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// /api/auth/register
router.post('/register', authController_1.register);
// /api/auth/login
router.post('/login', authController_1.login);
// /api/auth/me
router.get('/me', auth_1.authMiddleware, authController_1.getMe);
router.put('/me', auth_1.authMiddleware, authController_1.updateMe);
router.delete('/me', auth_1.authMiddleware, authController_1.deleteMe);
exports.default = router;
