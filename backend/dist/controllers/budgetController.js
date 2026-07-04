"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.upsertBudget = exports.getBudgets = void 0;
const budgetService_1 = require("../services/budgetService");
const getBudgets = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const budgets = await (0, budgetService_1.getBudgets)(req.user.id);
        return res.json(budgets);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getBudgets = getBudgets;
const upsertBudget = async (req, res) => {
    const { category, limit, month, year } = req.body;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!category || limit === undefined || !month || !year) {
            return res.status(400).json({ message: 'Category, limit, month and year are required' });
        }
        const budget = await (0, budgetService_1.upsertBudget)(req.user.id, {
            category,
            limit: Number(limit),
            month: Number(month),
            year: Number(year),
        });
        return res.json(budget);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.upsertBudget = upsertBudget;
const deleteBudget = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await (0, budgetService_1.deleteBudget)(req.user.id, id);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteBudget = deleteBudget;
