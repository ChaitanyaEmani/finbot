import Chat from '../models/chatModel.js';
import openRouterClient from '../config/openrouter.js';
import { SYSTEM_PROMPT, getFinancialSummary } from '../utils/prompts.js';

// @desc    Send message to AI
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    // Validate message
    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Validate message length
    if (message.length > 2000) {
      return res.status(400).json({
        status: 'error',
        message: 'Message too long. Maximum 2000 characters allowed.'
      });
    }

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({
          status: 'error',
          message: 'Chat not found'
        });
      }
    } else {
      chat = await Chat.create({
        userId: req.user._id,
        title: message.substring(0, 50),
        messages: []
      });
    }

    // Get financial summary (SINGLE CALL - removed duplicate)
    const financialSummary = await getFinancialSummary(req.user._id);

    // Build messages for AI
    const messages = [
      { 
        role: 'system', 
        content: `${SYSTEM_PROMPT}\n\nUser's Financial Context:\n${JSON.stringify(financialSummary, null, 2)}` 
      },
      ...chat.messages.slice(-10).map(m => ({ 
        role: m.role, 
        content: m.content 
      })),
      { role: 'user', content: message }
    ];

    // Call OpenRouter API with error handling
    let response;
    try {
      response = await openRouterClient.post('/chat/completions', {
        model: 'qwen/qwen-2.5-72b-instruct',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
    } catch (apiError) {
      // Handle rate limiting
      if (apiError.response?.status === 429) {
        return res.status(429).json({
          status: 'error',
          message: 'Rate limit exceeded. Please try again in a moment.'
        });
      }
      
      // Handle other API errors
      console.error('OpenRouter API error:', apiError.response?.data || apiError.message);
      return res.status(503).json({
        status: 'error',
        message: 'AI service temporarily unavailable',
        details: apiError.response?.data?.error || apiError.message
      });
    }

    const aiResponse = response.data.choices[0].message.content;

    // Save messages to chat
    chat.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );
    
    await chat.save();

    res.status(200).json({
      status: 'success',
      data: {
        chatId: chat._id,
        message: aiResponse,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process your message',
      details: error.message
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.query;

    if (chatId) {
      const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({
          status: 'error',
          message: 'Chat not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        data: { chat }
      });
    }

    // Get all chats for user
    const chats = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      results: chats.length,
      data: { chats }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve chat history',
      details: error.message
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    await chat.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete chat',
      details: error.message
    });
  }
};