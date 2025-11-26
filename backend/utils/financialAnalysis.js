import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';
import mongoose from 'mongoose';

export const calculateMonthlyStats = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month,
    year,
    income,
    expenses,
    savings: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(2) : 0,
    transactionCount: transactions.length
  };
};

export const getCategoryBreakdown = async (userId, startDate, endDate) => {
  // Convert userId to ObjectId if it's a string
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  const transactions = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  const totalExpenses = transactions.reduce((sum, cat) => sum + cat.total, 0);

  return transactions.map(cat => ({
    category: cat._id,
    total: Math.round(cat.total * 100) / 100,
    count: cat.count,
    avgAmount: Math.round(cat.avgAmount * 100) / 100,
    percentage: totalExpenses > 0 ? Number(((cat.total / totalExpenses) * 100).toFixed(2)) : 0
  }));
};

export const getSpendingTrends = async (userId, months = 6) => {
  const trends = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const stats = await calculateMonthlyStats(userId, month, year);
    trends.push(stats);
  }

  // Calculate trends
  const avgIncome = trends.reduce((sum, t) => sum + t.income, 0) / trends.length;
  const avgExpenses = trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length;
  
  const recentAvg = trends.slice(-3).reduce((sum, t) => sum + t.expenses, 0) / 3;
  const olderAvg = trends.slice(0, 3).reduce((sum, t) => sum + t.expenses, 0) / 3;
  const trend = recentAvg > olderAvg ? 'increasing' : 'decreasing';

  return {
    monthlyData: trends,
    averages: {
      income: Math.round(avgIncome * 100) / 100,
      expenses: Math.round(avgExpenses * 100) / 100,
      savings: Math.round((avgIncome - avgExpenses) * 100) / 100
    },
    trend: {
      direction: trend,
      changePercent: olderAvg > 0 ? (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(2) : 0
    }
  };
};

export const getBudgetPerformance = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Convert userId to ObjectId if it's a string
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  // Get actual spending by category
  const categorySpending = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        spent: { $sum: '$amount' }
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

  const performance = budgets.map(budget => {
    const spent = spendingMap[budget.category] || 0;
    const remaining = budget.limit - spent;
    const percentUsed = budget.limit > 0 ? ((spent / budget.limit) * 100).toFixed(2) : 0;

    return {
      category: budget.category,
      limit: budget.limit,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed: Number(percentUsed),
      status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'on-track'
    };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = Object.values(spendingMap).reduce((sum, val) => sum + val, 0);

  return {
    budgets: performance,
    overall: {
      totalBudget: Math.round(totalBudget * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      remaining: Math.round((totalBudget - totalSpent) * 100) / 100,
      percentUsed: totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(2)) : 0
    }
  };
};