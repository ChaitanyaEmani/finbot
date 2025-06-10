import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FinanceDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import MarkdownRenderer from "../../components/MarkDownRenderer"; // ✅ Import your custom markdown component

const FinanceDashboard = ({ refreshTrigger }) => {
  const [financeData, setFinanceData] = useState([]);
  const [insight, setInsight] = useState("");
  const [showCharts, setShowCharts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const API = import.meta.env.VITE_API_BASE_URL;
  const fallbackIdeas = `
**Business Ideas:**
1. Start a subscription box service for eco-friendly products.
2. Launch an online course platform for niche skills.
3. Develop a mobile app for remote team collaboration.
4. Create a personalized meal prep and delivery service.
5. Offer virtual event planning and coordination.

**Investment Options:**
1. Invest in diversified mutual funds.
2. Consider fixed deposits for stable returns.
3. Explore government-backed savings schemes.
4. Look into peer-to-peer lending platforms.
5. Research emerging renewable energy stocks.
`;

  useEffect(() => {
    fetchFinanceData();
  }, [refreshTrigger]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/finance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.finance || [];

      if (Array.isArray(data)) {
        setFinanceData(data);
        computeInsights(data);

        if (data.length > 0) {
          const latest = data[data.length - 1];
          fetchAIRecommendations(latest.income, latest.expenses, latest.savings);
        } else {
          setAiRecommendations("");
        }
      } else {
        console.warn("Finance data is not an array:", data);
        setFinanceData([]);
        setInsight("No financial data available. Start by sharing your income and expenses!");
        setAiRecommendations("");
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
      setError("Failed to load financial data");
      setFinanceData([]);
      setAiRecommendations("");
    } finally {
      setLoading(false);
    }
  };

  const computeInsights = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      setInsight("No financial data available yet. Share your income, expenses, and savings to get personalized insights!");
      return;
    }

    const latest = data[data.length - 1];
    const percentSpent = ((latest.expenses / latest.income) * 100).toFixed(1);
    let message = `Financial Summary: You spent ${percentSpent}% of your income this month. `;

    if (percentSpent > 80) {
      message += "⚠️ You're spending too much! Try to reduce expenses to improve your financial health. ";
    } else if (percentSpent > 70) {
      message += "⚡ You're spending quite a bit. Consider reviewing your expenses. ";
    } else if (percentSpent < 40) {
      message += "🎉 Excellent spending control! You're doing great with your finances. ";
    } else {
      message += "✅ Good balance between spending and saving. Keep it up! ";
    }

    if (latest.savings > 50000) {
      message += "💰 Great savings! Consider diversifying into mutual funds, SIPs, or fixed deposits for better returns. ";
    } else if (latest.savings > 20000) {
      message += "💵 Good savings! Consider investing in low-risk options like fixed deposits or mutual funds. ";
    } else if (latest.savings > 5000) {
      message += "💼 You're building savings! Try to increase your savings rate gradually. ";
    } else {
      message += "🎯 Focus on building an emergency fund first before considering investments. ";
    }

    if (data.length > 1) {
      const previous = data[data.length - 2];
      const savingsChange = latest.savings - previous.savings;

      if (savingsChange > 0) {
        message += `📈 Your savings increased by ₹${savingsChange.toLocaleString()} from last month!`;
      } else if (savingsChange < 0) {
        message += `📉 Your savings decreased by ₹${Math.abs(savingsChange).toLocaleString()} from last month.`;
      } else {
        message += "➡️ Your savings remained stable from last month.";
      }
    }

    setInsight(message);
  };

  const fetchAIRecommendations = async (income, expenses, savings) => {
    setLoadingRecommendations(true);
    setAiRecommendations("Loading AI recommendations...");

    try {
      const prompt = `
I have the following financial data:
Income: ₹${income}
Expenses: ₹${expenses}
Savings: ₹${savings}

Please provide:
1. Five personalized business ideas suitable for this income level.
2. Five smart investment options for growing income and savings.

Format the response clearly with markdown numbered lists.
      `;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = response.data.choices[0].message.content;

      if (!aiMessage || aiMessage.trim().length === 0) {
        setAiRecommendations(fallbackIdeas);
      } else {
        setAiRecommendations(aiMessage);
      }
    } catch (error) {
      console.error("AI recommendation error:", error);
      setAiRecommendations(fallbackIdeas);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const formatCurrency = (value) => `₹${value.toLocaleString()}`;

  const barData = financeData.map(({ date, income, expenses }) => ({
    month: new Date(date).toLocaleString("default", { month: "short", year: "numeric" }),
    income,
    expenses,
  }));

  const lineData = financeData.map(({ date, savings }) => ({
    month: new Date(date).toLocaleString("default", { month: "short", year: "numeric" }),
    savings,
  }));

  const toggleCharts = () => setShowCharts(!showCharts);

  if (loading) {
    return (
      <div className="finance-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-dashboard">
      <div className="dashboard-header">
        <h2>Financial Dashboard</h2>
        <button onClick={toggleCharts} className="toggle-button" aria-label="Toggle Charts">
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchFinanceData} className="retry-button">Retry</button>
        </div>
      )}

      {showCharts && financeData.length > 0 && (
        <div className="charts-container">
          <div className="chart-section">
            <h3>💰 Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value), ""]} />
                <Legend />
                <Bar dataKey="income" fill="#4caf50" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f44336" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>📈 Savings Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Savings"]} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#2196f3" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="insights-section">
        <div className="insight-card">
          <h3>🧠 AI Financial Insights</h3>
          <div className="insight-content">
            <p>{insight || "Share your financial data to get personalized insights and recommendations!"}</p>
          </div>
        </div>

        <div className="ai-recommendations-section">
          <h3>🤖 AI-Generated Business Ideas & Investments</h3>
          <div className="ai-recommendations-content">
            {loadingRecommendations ? (
              <p>Loading AI recommendations...</p>
            ) : (
              <MarkdownRenderer content={aiRecommendations || fallbackIdeas} />
            )}
          </div>
        </div>

        {financeData.length > 0 && (
          <div className="quick-stats">
            <h4>📋 Quick Stats</h4>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-label">Total Records</span><span className="stat-value">{financeData.length}</span></div>
              <div className="stat-item"><span className="stat-label">Latest Income</span><span className="stat-value">{formatCurrency(financeData.at(-1)?.income || 0)}</span></div>
              <div className="stat-item"><span className="stat-label">Latest Expenses</span><span className="stat-value">{formatCurrency(financeData.at(-1)?.expenses || 0)}</span></div>
              <div className="stat-item"><span className="stat-label">Latest Savings</span><span className="stat-value">{formatCurrency(financeData.at(-1)?.savings || 0)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;
