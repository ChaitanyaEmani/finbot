import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    // Update budget if expense
    if (type === 'expense') {
      const transactionDate = new Date(date || Date.now());
      const month = transactionDate.getMonth() + 1;
      const year = transactionDate.getFullYear();

      await Budget.findOneAndUpdate(
        {
          userId: req.user._id,
          category,
          month,
          year
        },
        { $inc: { spent: amount } }
      );
    }

    res.status(201).json({
      message:"Successfully added",
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 10, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      message:"fetched successfully",
      status: 'success',
      results: transactions.length,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const individualTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      message:"fetched successfully",
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    const oldType = transaction.type;
    const newType = req.body.type || oldType;

    const oldAmount = transaction.amount;
    const newAmount = req.body.amount || oldAmount;

    const oldCategory = transaction.category;
    const newCategory = req.body.category || oldCategory;

    const oldDate = new Date(transaction.date);
    const newDate = req.body.date ? new Date(req.body.date) : oldDate;

    // Extract month/year
    const oldMonth = oldDate.getMonth() + 1;
    const oldYear = oldDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();

    // ----------- HANDLE EXPENSE → EXPENSE UPDATE -----------
    if (oldType === 'expense' && newType === 'expense') {
      // Revert old spent
      await Budget.findOneAndUpdate(
        { userId: req.user._id, category: oldCategory, month: oldMonth, year: oldYear },
        { $inc: { spent: -oldAmount } }
      );

      // Apply new spent
      await Budget.findOneAndUpdate(
        { userId: req.user._id, category: newCategory, month: newMonth, year: newYear },
        { $inc: { spent: newAmount } }
      );
    }

    // --------- HANDLE EXPENSE → INCOME DELETE BUDGET SPENT ---------
    if (oldType === 'expense' && newType === 'income') {
      await Budget.findOneAndUpdate(
        { userId: req.user._id, category: oldCategory, month: oldMonth, year: oldYear },
        { $inc: { spent: -oldAmount } }
      );
    }

    // --------- HANDLE INCOME → EXPENSE ADD NEW SPENT ---------
    if (oldType === 'income' && newType === 'expense') {
      await Budget.findOneAndUpdate(
        { userId: req.user._id, category: newCategory, month: newMonth, year: newYear },
        { $inc: { spent: newAmount } }
      );
    }

    // ----------- UPDATE TRANSACTION IN DB -----------
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Transaction updated successfully",
      data: { transaction: updated }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};


// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Update budget if expense
    if (transaction.type === 'expense') {
      const transactionDate = new Date(transaction.date);
      const month = transactionDate.getMonth() + 1;
      const year = transactionDate.getFullYear();

      await Budget.findOneAndUpdate(
        { userId: req.user._id, category: transaction.category, month, year },
        { $inc: { spent: -transaction.amount } }
      );
    }

    await transaction.deleteOne();

    res.status(200).json({
      message:"deleted succssfully",
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};