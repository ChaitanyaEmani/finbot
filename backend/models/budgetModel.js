import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food', 'Rent', 'Utilities', 'Transportation', 'Healthcare',
      'Entertainment', 'Shopping', 'Education', 'Travel', 'Groceries',
      'Insurance', 'Debt Payment', 'Savings', 'Other Expense','Trip'
    ] 
  }, 
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit cannot be negative']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  notificationSent: {
    type: Boolean,
    default: false
  } 
}, {
  timestamps: true
});

// Compound unique index 
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema);