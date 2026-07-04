import { Response } from 'express';
import { getChatResponse } from '../services/chatService';
import { AuthRequest } from '../middleware/auth';

export const handleChat = async (req: AuthRequest, res: Response) => {
  const { messages } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const response = await getChatResponse(req.user.id, messages);
    return res.json(response);
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ message: (error as Error).message });
  }
};
