import { Router } from 'express';
import { register, login, getMe, updateMe, deleteMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// /api/auth/register
router.post('/register', register);

// /api/auth/login
router.post('/login', login);

// /api/auth/me
router.get('/me', authMiddleware as any, getMe);
router.put('/me', authMiddleware as any, updateMe);
router.delete('/me', authMiddleware as any, deleteMe);

export default router;
