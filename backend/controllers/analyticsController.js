import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';
import { 
  calculateMonthlyStats, 
  getCategoryBreakdown, 
  getSpendingTrends 
} from '../utils/financialAnalysis.js';

// @desc    Get financial summary
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Run queries in parallel for faster response
    const [transactions, budgets, categoryBreakdown] = await Promise.all([
      Transaction.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).lean(), // .lean() for faster queries
      Budget.find({
        userId: req.user._id,
        month: targetMonth,
        year: targetYear
      }).lean(),
      getCategoryBreakdown(req.user._id, startDate, endDate)
    ]);

    // Calculate statistics (faster with reduced loops)
    let income = 0;
    let expenses = 0;
    
    for (const t of transactions) {
      if (t.type === 'income') {
        income += t.amount;
      } else if (t.type === 'expense') {
        expenses += t.amount;
      }
    }

    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(2) : 0;

    res.status(200).json({
      message:"summary fetched",
      status: 'success',
      data: {
        period: { month: targetMonth, year: targetYear },
        summary: {
          totalIncome: income,
          totalExpenses: expenses,
          savings,
          savingsRate: parseFloat(savingsRate),
          transactionCount: transactions.length
        },
        categoryBreakdown,
        budgets
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get spending trends
// @route   GET /api/analytics/trends
// @access  Private
export const getTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Add timeout to prevent long-running queries
    const trends = await Promise.race([
      getSpendingTrends(req.user._id, parseInt(months)),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      )
    ]);

    res.status(200).json({
      message:"fetched trends",
      status: 'success',
      data: { trends }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get category-wise analysis
// @route   GET /api/analytics/categories
// @access  Private
export const getCategoryAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const end = endDate ? new Date(endDate) : new Date();

    const categoryStats = await getCategoryBreakdown(req.user._id, start, end);

    res.status(200).json({
      message:"categories data fetched",
      status: 'success',
      data: { categoryStats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};