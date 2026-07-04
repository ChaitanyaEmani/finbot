import { Router } from 'express';
import { handleChat } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// /api/chat
router.post('/', authMiddleware as any, handleChat);

export default router;
