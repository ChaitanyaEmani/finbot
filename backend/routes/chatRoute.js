import express from 'express';
import {
  sendMessageToBot,
  getPreviousChats,
  deleteAllChats,
  createChatSession,
  updateChatSession
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const chatRouter = express.Router();

chatRouter.post('/message', authMiddleware, sendMessageToBot);
chatRouter.get('/previous', authMiddleware, getPreviousChats);
chatRouter.delete('/delete', authMiddleware, deleteAllChats);

// ✅ NEW: Create chat
chatRouter.post('/', authMiddleware, createChatSession);

// ✅ NEW: Update chat with new messages
chatRouter.post('/update', authMiddleware, updateChatSession);

export default chatRouter;
