import express from 'express';
import { sendMessageToBot,getPreviousChats, deleteAllChats } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';  // create this file

const chatRouter = express.Router();

chatRouter.post('/message', authMiddleware, sendMessageToBot);
chatRouter.get('/previous', authMiddleware, getPreviousChats);
chatRouter.delete('/delete', authMiddleware, deleteAllChats);


export default chatRouter;
