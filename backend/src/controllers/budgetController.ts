import { Response } from 'express';
import { 
  getBudgets as getBudgetsService, 
  upsertBudget as upsertBudgetService, 
  deleteBudget as deleteBudgetService 
} from '../services/budgetService';
import { AuthRequest } from '../middleware/auth';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const budgets = await getBudgetsService(req.user.id);
    return res.json(budgets);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const upsertBudget = async (req: AuthRequest, res: Response) => {
  const { category, limit, month, year } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!category || limit === undefined || !month || !year) {
      return res.status(400).json({ message: 'Category, limit, month and year are required' });
    }

    const budget = await upsertBudgetService(req.user.id, {
      category,
      limit: Number(limit),
      month: Number(month),
      year: Number(year),
    });

    return res.json(budget);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await deleteBudgetService(req.user.id, id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
