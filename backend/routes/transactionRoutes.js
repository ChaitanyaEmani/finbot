import express from 'express';
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  individualTransaction
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';
import { validateTransaction } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect);
router.use(transactionLimiter);

// Get all transactions
router.get('/all', getTransactions);

// Add a new transaction
router.post('/add', validateTransaction, addTransaction);

// Get a single transaction by ID
router.get('/:id', individualTransaction);

// Update transaction
router.put('/:id/update', validateTransaction, updateTransaction);

// Delete transaction
router.delete('/:id/delete', deleteTransaction);

export default router;
