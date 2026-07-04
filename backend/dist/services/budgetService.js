"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.upsertBudget = exports.getBudgets = void 0;
const Budget_1 = require("../models/Budget");
const getBudgets = async (userId) => {
    return Budget_1.Budget.find({ userId });
};
exports.getBudgets = getBudgets;
const upsertBudget = async (userId, data) => {
    return Budget_1.Budget.findOneAndUpdate({
        userId,
        category: data.category,
        month: data.month,
        year: data.year,
    }, {
        limit: data.limit,
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.upsertBudget = upsertBudget;
const deleteBudget = async (userId, budgetId) => {
    const budget = await Budget_1.Budget.findById(budgetId);
    if (!budget) {
        throw new Error('Budget not found');
    }
    if (budget.userId.toString() !== userId) {
        throw new Error('Unauthorized to delete this budget');
    }
    await Budget_1.Budget.findByIdAndDelete(budgetId);
    return { success: true };
};
exports.deleteBudget = deleteBudget;
