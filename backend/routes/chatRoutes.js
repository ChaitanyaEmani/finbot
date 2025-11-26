import express from 'express';
import { sendMessage, getChatHistory, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/send', aiLimiter, sendMessage);
router.get('/history', getChatHistory);
router.delete('/:id', deleteChat);

export default router;