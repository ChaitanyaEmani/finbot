import { Budget } from '../models/Budget';

export const getBudgets = async (userId: string) => {
  return Budget.find({ userId });
};

export const upsertBudget = async (
  userId: string,
  data: {
    category: string;
    limit: number;
    month: number;
    year: number;
  }
) => {
  return Budget.findOneAndUpdate(
    {
      userId,
      category: data.category,
      month: data.month,
      year: data.year,
    },
    {
      limit: data.limit,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  const budget = await Budget.findById(budgetId);
  if (!budget) {
    throw new Error('Budget not found');
  }

  if (budget.userId.toString() !== userId) {
    throw new Error('Unauthorized to delete this budget');
  }

  await Budget.findByIdAndDelete(budgetId);
  return { success: true };
};
