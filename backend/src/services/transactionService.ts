import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

export const autoGenerateMonthlySalary = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.monthlyIncome || user.monthlyIncome <= 0) {
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const existingSalary = await Transaction.findOne({
      userId,
      type: 'income',
      category: 'Salary',
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    if (!existingSalary) {
      await Transaction.create({
        userId,
        amount: user.monthlyIncome,
        type: 'income',
        category: 'Salary',
        description: 'Auto-generated Monthly Salary',
        date: startOfMonth
      });
    }
  } catch (error) {
    console.error('Error auto-generating monthly salary:', error);
  }
};

export const getTransactions = async (userId: string) => {
  await autoGenerateMonthlySalary(userId);
  return Transaction.find({ userId }).sort({ date: -1, createdAt: -1 });
};

export const createTransaction = async (
  userId: string,
  data: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    date?: Date | string;
  }
) => {
  return Transaction.create({
    userId,
    amount: data.amount,
    type: data.type,
    category: data.category,
    description: data.description || '',
    date: data.date ? new Date(data.date) : new Date(),
  });
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: {
    amount?: number;
    type?: 'income' | 'expense';
    category?: string;
    description?: string;
    date?: Date | string;
  }
) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.userId.toString() !== userId) {
    throw new Error('Unauthorized to modify this transaction');
  }

  if (data.amount !== undefined) transaction.amount = data.amount;
  if (data.type !== undefined) transaction.type = data.type;
  if (data.category !== undefined) transaction.category = data.category;
  if (data.description !== undefined) transaction.description = data.description;
  if (data.date !== undefined) transaction.date = new Date(data.date);

  return transaction.save();
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.userId.toString() !== userId) {
    throw new Error('Unauthorized to delete this transaction');
  }

  await Transaction.findByIdAndDelete(transactionId);
  return { success: true };
};
