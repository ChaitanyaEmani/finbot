"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = void 0;
const chatService_1 = require("../services/chatService");
const handleChat = async (req, res) => {
    const { messages } = req.body;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: 'Messages array is required' });
        }
        const response = await (0, chatService_1.getChatResponse)(req.user.id, messages);
        return res.json(response);
    }
    catch (error) {
        console.error('Chat controller error:', error);
        return res.status(500).json({ message: error.message });
    }
};
exports.handleChat = handleChat;
