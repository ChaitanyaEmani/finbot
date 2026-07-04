import { Schema, model } from 'mongoose';

const BudgetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user has only one budget limit per category per month/year
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget = model('Budget', BudgetSchema);
export default Budget;
