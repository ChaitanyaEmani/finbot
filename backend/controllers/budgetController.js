import Budget from '../models/budgetModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Set or update budget
// @route   POST /api/budgets
// @access  Private
export const setBudget = async (req, res) => {
  try {
    const { category, limit, month, year, alertThreshold } = req.body;

    // Calculate current spent for this category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      category,
      date: { $gte: startDate, $lte: endDate }
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month, year },
      { 
        limit, 
        spent, 
        alertThreshold: alertThreshold || 80,
        notificationSent: false 
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message:"Budget has been set successfully",
      status: 'success',
      data: { budget }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all budgets for current month
// @route   GET /api/budgets/current
// @access  Private
export const getCurrentBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year
    }).sort({ category: 1 });

    res.status(200).json({
      message:"fetched the current budgets",
      status: 'success',
      results: budgets.length,
      data: { budgets }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get budgets by month/year
// @route   GET /api/budgets/:year/:month
// @access  Private
export const getBudgetsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    const budgets = await Budget.find({
      userId: req.user._id,
      month: parseInt(month),
      year: parseInt(year)
    }).sort({ category: 1 });

    res.status(200).json({
      message:"fetched budgets by month",
      status: 'success',
      results: budgets.length,
      data: { budgets }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};