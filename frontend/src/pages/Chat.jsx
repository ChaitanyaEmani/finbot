import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Trash2, Plus, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

const Chat = () => {
  const API_URL = import.meta.env.VITE_BASE_API_URL;
  
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data.data.chats);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setCurrentChatId(chatId);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/chat/history?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data.chat.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    if (inputMessage.length > 2000) {
      setError('Message too long. Maximum 2000 characters allowed.');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');
    
    // Add user message immediately
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/chat/send`,
        { message: userMessage, chatId: currentChatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiMessage = { role: 'assistant', content: res.data.data.message };
      setMessages(prev => [...prev, aiMessage]);
      
      if (!currentChatId) {
        setCurrentChatId(res.data.data.chatId);
        fetchChatHistory();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please try again in a moment.');
      } else {
        setError('Failed to send message. Please try again.');
      }
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setError('');
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChats(prev => prev.filter(c => c._id !== chatId));
      
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-slate-800/50 backdrop-blur-lg border-r border-purple-500/20 flex flex-col overflow-hidden`}>
          <div className="p-4 border-b border-purple-500/20">
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-gray-400 text-sm font-semibold mb-3 px-2">Recent Chats</h3>
            {chats.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No chat history yet</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition ${
                    currentChatId === chat._id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <p className="text-white text-sm font-medium truncate">{chat.title}</p>
                      </div>
                      <p className="text-gray-400 text-xs">{formatTime(chat.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-lg border-b border-purple-500/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">AI Financial Assistant</h1>
                    <p className="text-xs text-gray-400">Powered by AI • Always available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl mb-6">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Welcome to Your AI Financial Assistant</h2>
                <p className="text-gray-400 max-w-md mb-6">
                  I'm here to help you manage your finances, analyze spending patterns, and provide personalized financial advice.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  {[
                    'How can I improve my budget?',
                    'Analyze my spending patterns',
                    'What are my biggest expenses?',
                    'Help me save more money'
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(suggestion)}
                      className="bg-slate-800/50 border border-purple-500/20 text-gray-300 px-4 py-3 rounded-lg hover:bg-slate-700/50 hover:border-purple-500/40 transition text-sm text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message */}
                    <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-slate-800/50 border border-purple-500/20 text-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-800/50 border border-purple-500/20 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        <span className="text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 pb-2">
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-slate-800/50 backdrop-blur-lg border-t border-purple-500/20 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about your finances..."
                    rows="1"
                    className="w-full bg-slate-800 text-white px-4 py-3 pr-12 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition resize-none max-h-32"
                    style={{ minHeight: '48px' }}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                    {inputMessage.length}/2000
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;