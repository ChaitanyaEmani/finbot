'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { chatService } from '../../services/api';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What is my biggest expense?",
  "Suggest three ways to save money.",
  "Am I exceeding any budget limits?",
  "Give me a summary of my financial health."
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm SaveUp, your financial AI advisor. I can analyze your transactions and budgets to offer custom savings suggestions or answer general financial questions. What would you like to discuss today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Compile message list for history context
      const chatHistory = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatService.sendMessage(chatHistory);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.message || "No response received.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the server or OpenRouter AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-background text-zinc-100 overflow-hidden relative">
      {/* Background glow highlights */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-indigo-650/5 blur-[130px] pointer-events-none" />

      <Navigation />

      {/* Main chat window container */}
      <main className="flex-grow flex flex-col h-[calc(100vh-4rem)] md:h-screen max-w-5xl mx-auto w-full border-x border-zinc-900/40 relative z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-900/60 bg-zinc-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/10">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center space-x-1.5 leading-none">
                <span>SaveUp AI Advisor</span>
                <Sparkles className="w-3.5 h-3.5 text-violet-400 fill-violet-400/20" />
              </h1>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-450 tracking-wider uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
          {messages.map((m) => {
            const isBot = m.role === 'assistant';
            return (
              <div 
                key={m.id} 
                className={`flex items-start gap-3.5 max-w-[85%] ${
                  isBot ? 'self-start' : 'ml-auto flex-row-reverse text-right'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isBot 
                    ? 'bg-zinc-900 border border-zinc-855 text-violet-450 font-bold' 
                    : 'bg-violet-600 text-white font-bold'
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Content Bubble */}
                <div className={`space-y-1.5 ${!isBot && 'text-left'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border transition shadow-sm ${
                    isBot 
                      ? 'border-zinc-850 bg-zinc-900/20 backdrop-blur-sm text-zinc-150' 
                      : 'border-violet-500/20 bg-gradient-to-r from-violet-650 to-indigo-650 text-white whitespace-pre-line font-medium shadow-md shadow-violet-600/5'
                  }`}>
                    {isBot ? <MarkdownRenderer content={m.content} /> : m.content}
                  </div>
                  <div className={`text-[10px] text-zinc-550 font-medium px-1 ${!isBot && 'text-right'}`}>
                    {mounted ? m.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing State Loader */}
          {loading && (
            <div className="flex items-start gap-3.5 max-w-[80%]">
              <div className="w-8.5 h-8.5 rounded-xl bg-zinc-900 border border-zinc-850 text-violet-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-zinc-400 text-sm flex items-center space-x-2.5 shadow-sm">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-violet-500" />
                <span className="font-medium">SaveUp is analyzing your ledger...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start space-x-3 text-red-400 text-sm max-w-md mx-auto">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Connection Error</div>
                <div className="text-xs text-red-400/80 mt-1">{error}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="px-6 py-3 border-t border-zinc-900/40 bg-zinc-950/20 backdrop-blur-sm">
            <div className="text-xs text-zinc-500 mb-2.5 font-semibold flex items-center uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-zinc-650" />
              Suggestions to ask:
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSendMessage(s)}
                  className="px-4 py-2 rounded-full border border-zinc-850 hover:border-violet-500/40 bg-zinc-900/40 hover:bg-violet-950/15 text-xs font-semibold text-zinc-400 hover:text-white transition duration-200 cursor-pointer shadow-sm hover:shadow-violet-950/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-6 border-t border-zinc-900/60 bg-zinc-950">
          <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your category budgets, suggest saving ideas..."
              className="w-full h-12 pl-4 pr-14 rounded-2xl border border-zinc-800 bg-zinc-900/25 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-650/20 text-sm transition shadow-inner shadow-black/20"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-850 text-white disabled:text-zinc-550 transition duration-200 cursor-pointer shadow-md shadow-violet-600/10 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
