import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import FinanceDashboard from "../../components/FinanceDashboard/FinanceDashboard";
import MarkdownRenderer from "../../components/MarkDownRenderer";

const Dashboard = () => {
  const API = import.meta.env.VITE_API_BASE_URL;

  // Load from localStorage or default
  const getInitialChatSessions = () => {
    const saved = localStorage.getItem("chatSessions");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "init",
            title: "Welcome Chat",
            messages: [
              {
                role: "bot",
                message: "Hi, I'm FinBot! How can I assist you today?",
              },
            ],
          },
        ];
  };

  const getInitialActiveChatId = () => {
    return localStorage.getItem("activeChatId") || "init";
  };

  const [chatSessions, setChatSessions] = useState(getInitialChatSessions);
  const [activeChatId, setActiveChatId] = useState(getInitialActiveChatId);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [financeDataUpdated, setFinanceDataUpdated] = useState(false);

  const activeChat = chatSessions.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatSessions, activeChatId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem("activeChatId", activeChatId);
  }, [activeChatId]);

  const autoResizeTextarea = () => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    autoResizeTextarea();
  };

  const extractFinancialData = (message) => {
    const patterns = {
      income:
        /(?:earned|income|salary|made|received)[\s\w]*?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      expenses:
        /(?:spent|expenses?|costs?|paid)[\s\w]*?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      savings: /(?:saved|savings?)[\s\w]*?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    };

    const extracted = {};
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = message.match(pattern);
      if (match) {
        extracted[key] = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    if (extracted.income && extracted.expenses && !extracted.savings) {
      extracted.savings = extracted.income - extracted.expenses;
    }

    return Object.keys(extracted).length > 0 ? extracted : null;
  };

  const saveFinancialData = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/finance`,
        {
          income: data.income || 0,
          expenses: data.expenses || 0,
          savings: data.savings || 0,
          date: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFinanceDataUpdated((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error saving financial data:", error);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMessage = { role: "user", message: userMessage };

    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newUserMessage] }
          : chat
      )
    );

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const isGreeting = /^(hi|hello|hey)\b/i.test(userMessage);
      if (isGreeting) {
        const greetingReply = {
          role: "bot",
          message: "Hi! How can I help you with your financial questions?",
        };
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: [...chat.messages, greetingReply] }
              : chat
          )
        );
        setIsLoading(false);
        return;
      }

      let financialData = extractFinancialData(userMessage);

      try {
        const jsonData = JSON.parse(userMessage);
        if (jsonData.income || jsonData.expenses || jsonData.savings) {
          financialData = jsonData;
        }
      } catch (_) {}

      const token = localStorage.getItem("token");

      if (financialData) {
        const saved = await saveFinancialData(financialData);
        if (saved) {
          const res = await axios.post(
            `${API}/api/chat/message`,
            { message: userMessage },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const botReply =
            res.data.reply ||
            "Your data was saved, but I couldn't fetch suggestions.";

          const confirmationMessage = {
            role: "bot",
            message: `✅ I've recorded your financial data:\n\n${
              financialData.income
                ? `**Income**: ₹${financialData.income.toLocaleString()}\n`
                : ""
            }${
              financialData.expenses
                ? `**Expenses**: ₹${financialData.expenses.toLocaleString()}\n`
                : ""
            }${
              financialData.savings
                ? `**Savings**: ₹${financialData.savings.toLocaleString()}\n`
                : ""
            }\n\n📈 Based on this, here are some suggestions:\n\n${botReply}`,
          };

          setChatSessions((prev) =>
            prev.map((chat) =>
              chat.id === activeChatId
                ? { ...chat, messages: [...chat.messages, confirmationMessage] }
                : chat
            )
          );

          setIsLoading(false);
          return;
        }
      }

      const res = await axios.post(
        `${API}/api/chat/message`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botReply = res.data.reply || "Sorry, I couldn't understand.";
      const newBotMessage = { role: "bot", message: botReply };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, newBotMessage] }
            : chat
        )
      );
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        role: "bot",
        message: "Something went wrong. Please try again.",
      };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatClick = (id) => setActiveChatId(id);

  const handleNewChat = () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: `Chat ${chatSessions.length}`,
      messages: [
        {
          role: "bot",
          message:
            "Hello! I'm here to help with your financial questions. You can also share your income, expenses, and savings data with me!",
        },
      ],
    };
    setChatSessions((prev) => [...prev, newChat]);
    setActiveChatId(newChatId);
    setInput("");
  };

  const handleClearChats = () => {
    localStorage.removeItem("chatSessions");
    localStorage.removeItem("activeChatId");
    window.location.reload();
  };

  const uniqueChats = chatSessions.filter(
    (chat, index, self) =>
      index === self.findIndex((c) => c.id === chat.id)
  );

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat" onClick={handleNewChat}>
          + New Chat
        </button>
        <button className="clear-chat" onClick={handleClearChats}>
          🗑️ Clear Chats
        </button>
        <div className="chat-history">
          <p>Previous Chats</p>
          <ul>
            {[...uniqueChats]
              .slice()
              .reverse()
              .map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={chat.id === activeChatId ? "active-chat" : ""}
                >
                  {chat.title}
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-messages" ref={messagesEndRef}>
          {activeChat?.messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div className="message-content">
                {msg.role === "bot" ? (
                  <MarkdownRenderer content={msg.message} />
                ) : (
                  msg.message
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble bot loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="input-container">
          <div className="input-textarea">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask me anything or share your financial data..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              rows={1}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
          <div className="input-hint">
            <small>
              💡 Tip: You can share financial data like "I earned 50000, spent
              30000" or use JSON format. Press Shift+Enter for new lines.
            </small>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <FinanceDashboard refreshTrigger={financeDataUpdated} />
      </div>
    </div>
  );
};

export default Dashboard;
