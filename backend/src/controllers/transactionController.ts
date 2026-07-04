import { Response } from 'express';
import { 
  getTransactions as getTransactionsService, 
  createTransaction as createTransactionService, 
  updateTransaction as updateTransactionService, 
  deleteTransaction as deleteTransactionService 
} from '../services/transactionService';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const transactions = await getTransactionsService(req.user.id);
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { amount, type, category, description, date } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!amount || !type || !category) {
      return res.status(400).json({ message: 'Amount, type and category are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    const transaction = await createTransactionService(req.user.id, {
      amount: Number(amount),
      type,
      category,
      description,
      date,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount, type, category, description, date } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const transaction = await updateTransactionService(req.user.id, id, {
      amount: amount !== undefined ? Number(amount) : undefined,
      type,
      category,
      description,
      date,
    });

    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await deleteTransactionService(req.user.id, id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
