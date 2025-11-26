import validator from 'validator';

export const validateTransaction = (req, res, next) => {
  const { type, amount, category, date } = req.body;

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid transaction type'
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Amount must be greater than 0'
    });
  }

  if (!category || category.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Category is required'
    });
  }

  if (date && !validator.isISO8601(date)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format'
    });
  }

  next();
};

export const validateBudget = (req, res, next) => {
  const { category, limit, month, year } = req.body;

  if (!category || category.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Category is required'
    });
  }

  if (!limit || limit <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Budget limit must be greater than 0'
    });
  }

  if (!month || month < 1 || month > 12) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid month'
    });
  }

  if (!year || year < 2020) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid year'
    });
  }

  next();
};