"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController_1 = require("../controllers/transactionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all transaction routes
router.use(auth_1.authMiddleware);
// /api/transactions
router.get('/', transactionController_1.getTransactions);
router.post('/', transactionController_1.createTransaction);
// /api/transactions/:id
router.put('/:id', transactionController_1.updateTransaction);
router.delete('/:id', transactionController_1.deleteTransaction);
exports.default = router;
