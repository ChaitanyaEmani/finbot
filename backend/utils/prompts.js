import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';
import User from '../models/userModel.js';

export const SYSTEM_PROMPT = `You are FinBot, an intelligent personal finance assistant. Your role is to help users understand their financial data, provide insights, and offer practical advice.

Key responsibilities:
1. Analyze spending patterns and provide clear explanations
2. Suggest personalized savings strategies based on user data
3. Answer financial education questions (SIP, compound interest, budgeting, etc.)
4. Provide budget recommendations and expense optimization tips
5. Generate natural language summaries of financial data
6. Help categorize transactions when needed

Important guidelines:
- Always be supportive and non-judgmental
- Use clear, simple language
- Provide actionable advice
- Never give specific investment recommendations or legal advice
- Focus on general financial literacy and money management
- Be encouraging about financial progress
- Respect the user's financial situation and goals

When analyzing data:
- Look for trends and patterns
- Compare with previous periods
- Identify areas of high spending
- Highlight savings opportunities
- Consider budget adherence`;

export const getFinancialSummary = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Get current month transactions
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate spending by category using aggregation
  const categorySpending = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        spent: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const spendingMap = categorySpending.reduce((acc, item) => {
    acc[item._id] = item.spent;
    return acc;
  }, {});

  // Get budgets
  const budgets = await Budget.find({
    userId,
    month: currentMonth,
    year: currentYear
  });

  // Get user info
  const user = await User.findById(userId).select('monthlyIncome currency');

  // Get top spending categories
  const topCategories = categorySpending
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .reduce((acc, cat) => {
      acc[cat._id] = cat.spent;
      return acc;
    }, {});

  return {
    currentMonth: { month: currentMonth, year: currentYear },
    totalIncome: income,
    totalExpenses: expenses,
    savings: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(2) : 0,
    transactionCount: transactions.length,
    recentTransactions: transactions.slice(0, 5).map(t => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: t.date
    })),
    budgets: budgets.map(b => {
      const spent = spendingMap[b.category] || 0;
      const remaining = b.limit - spent;
      const percentUsed = b.limit > 0 ? ((spent / b.limit) * 100).toFixed(2) : 0;
      
      return {
        category: b.category,
        limit: b.limit,
        spent: spent,
        remaining: remaining,
        percentUsed: percentUsed,
        status: percentUsed >= 100 ? 'over' : percentUsed >= 80 ? 'warning' : 'good'
      };
    }),
    topCategories,
    userInfo: {
      monthlyIncome: user?.monthlyIncome || 0,
      currency: user?.currency || 'USD'
    }
  };
};