import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware as any);

// /api/transactions
router.get('/', getTransactions);
router.post('/', createTransaction);

// /api/transactions/:id
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
