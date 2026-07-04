"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budgetController_1 = require("../controllers/budgetController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all budget routes
router.use(auth_1.authMiddleware);
// /api/budgets
router.get('/', budgetController_1.getBudgets);
router.post('/', budgetController_1.upsertBudget); // Using post for upserting limit for category
// /api/budgets/:id
router.delete('/:id', budgetController_1.deleteBudget);
exports.default = router;
