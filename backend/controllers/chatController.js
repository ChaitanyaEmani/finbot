import userModel from '../models/userModel.js';
import dotenv from 'dotenv';
import Chat from '../models/chatModel.js';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt for FinBot (finance expert)
const finBotPrompt = `You are FinBot, a friendly and helpful AI assistant specializing in personal finance, but you can also have normal conversations.

Your capabilities:
- Provide financial advice, budgeting tips, and investment suggestions
- Help with financial calculations and planning
- Answer general questions and have friendly conversations
- Be encouraging and supportive
- Explain complex financial concepts in simple terms
- Don't provide code examples or programming help
- Always respond in a friendly, professional tone


When users share financial data (income, expenses, savings), acknowledge it positively and provide relevant insights.
For general questions or greetings, respond naturally and conversationally.
Always be friendly, encouraging, and professional.`;

// System prompt for general assistant (non-financial)
const generalPrompt = `You are a helpful, conversational AI assistant similar to ChatGPT, Claude, or Gemini. You can explain programming concepts, solve problems, provide examples in Python, JavaScript, or other languages, and chat like a human.

Follow these rules:
- Format code properly using triple backticks with language hint (e.g., \`\`\`python)
- Keep explanations clear and concise
- Be friendly and supportive
- Respond to non-financial queries without any financial tone`;

// 🔍 Determine if query is financial
function isFinancialQuery(message) {
  const financialKeywords = [
    'budget', 'expense', 'saving', 'money', 'income',
    'invest', 'investment', 'loan', 'debt', 'stock', 'retirement', 
    'insurance', 'earnings', 'financial', 'tax', 'credit',
     'mortgage', 'pension', 'wealth', 'portfolio', 'dividend',
      'interest','spending', 'financial planning', 'financial advice', 
      'financial goal', 'trading', 'financial literacy', 'financial education',
    'business', 'stocks', 'bonds', 'mutual funds', 'real estate', 'financial market',
    'stock market', 'cryptocurrency', 'forex', 'financial analysis', 'financial report',
    'financial statement', 'financial planning', 'financial management', 'financial advisor',
    'financial consultant', 'financial coach', 'financial literacy', 'financial education',
    'financial freedom', 'financial independence', 'financial security', 'financial stability'
  ];
  const lowerMessage = message.toLowerCase();
  return financialKeywords.some(keyword => lowerMessage.includes(keyword));
}


// 📤 Send message to the AI model
export const sendMessageToBot = async (req, res) => {
  const { message } = req.body;
  const userId = req.user?._id;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const systemPrompt = isFinancialQuery(message) ? finBotPrompt : generalPrompt;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('OpenRouter API Error:', errorDetails);
      const fallbackReply = getFallbackResponse(message);
      await saveChat(userId, message, fallbackReply);
      return res.status(200).json({ reply: fallbackReply });
    }

    const data = await response.json();
    const botReply = data.choices[0]?.message?.content || getFallbackResponse(message);
    await saveChat(userId, message, botReply);

    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('Server Error:', error);
    const fallbackReply = getFallbackResponse(message);
    await saveChat(userId, message, fallbackReply);
    res.status(200).json({ reply: fallbackReply });
  }
};

// 🧠 Save both user and bot messages
async function saveChat(userId, userMessage, botReply) {
  try {
    await userModel.findByIdAndUpdate(userId, {
      $push: { chatData: { sender: 'user', message: userMessage } }
    });

    await userModel.findByIdAndUpdate(userId, {
      $push: { chatData: { sender: 'bot', message: botReply } }
    });
  } catch (err) {
    console.error("Error saving chat data:", err);
  }
}

// 🔄 Fallback if API fails
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("python")) {
    return `Here's a Python example:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Chaitanya"))
\`\`\`

Let me know if you'd like help building something!`;
  }

  if (lowerMessage.includes("code") || lowerMessage.includes("javascript")) {
    return `Sure! Here's an example in JavaScript:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Chaitanya"));
\`\`\`

Let me know what you want help building.`;
  }

  if (lowerMessage.includes("budget") || lowerMessage.includes("money") || lowerMessage.includes("invest")) {
    return "To manage your money wisely, start by tracking income and expenses. Would you like a budgeting rule like 50/30/20 or a savings goal suggestion?";
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hi there! 👋 I'm FinBot. I can assist with finance, code, or anything else. Ask away!";
  }

  return "I'm having trouble connecting right now, but feel free to ask about finances, code, or general queries!";
}

// 📥 Get previous chats
export const getPreviousChats = async (req, res) => {
  const userId = req.user?._id;
  const { role } = req.query;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const user = await userModel.findById(userId).select("chatData");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let chats = user.chatData;
    if (role === 'user' || role === 'bot') {
      chats = chats.filter(chat => chat.sender === role);
    }

    const formattedChats = chats.map(chat => ({
      ...chat._doc,
      formattedTime: new Date(chat.timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    }));

    res.status(200).json({ success: true, chatData: formattedChats });
  } catch (err) {
    console.error("Fetch Chat Error:", err);
    res.status(500).json({ success: false, message: "Error fetching chats" });
  }
};

// 🗑 Delete all chats
export const deleteAllChats = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.chatData = [];
    await user.save();

    res.status(200).json({ success: true, message: "All chats deleted" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
    res.status(500).json({ success: false, message: "Error deleting chats" });
  }
};


export const createChatSession = async (req, res) => {
  try {
    const { chatId, title, messages } = req.body;

    const newChat = new Chat({
      userId: req.user._id,
      chatId,
      title,
      messages
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Create Chat Session Error:", error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

// ✅ New: Update existing chat session with new messages
export const updateChatSession = async (req, res) => {
  try {
    const { chatId, newMessages } = req.body;

    const chat = await Chat.findOne({ userId: req.user._id, chatId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push(...newMessages);
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error("Update Chat Session Error:", error);
    res.status(500).json({ error: 'Failed to update chat session' });
  }
};
