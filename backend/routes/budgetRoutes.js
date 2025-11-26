import express from 'express';
import {
  setBudget,
  getCurrentBudgets,
  getBudgetsByMonth,
  deleteBudget
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBudget } from '../middleware/validateRequest.js';

const router = express.Router();
router.use(protect);
router.post('/setbudget', validateBudget, setBudget);
router.get('/current', getCurrentBudgets);
router.get('/:year/:month', getBudgetsByMonth);
router.delete('/:id', deleteBudget);

export default router;