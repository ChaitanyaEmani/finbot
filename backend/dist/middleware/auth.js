"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_for_finbot';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authMiddleware = authMiddleware;
