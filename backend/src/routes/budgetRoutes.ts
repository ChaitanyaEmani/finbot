import { Router } from 'express';
import { getBudgets, upsertBudget, deleteBudget } from '../controllers/budgetController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all budget routes
router.use(authMiddleware as any);

// /api/budgets
router.get('/', getBudgets);
router.post('/', upsertBudget); // Using post for upserting limit for category

// /api/budgets/:id
router.delete('/:id', deleteBudget);

export default router;
