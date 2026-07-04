"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactions = void 0;
const transactionService_1 = require("../services/transactionService");
const getTransactions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const transactions = await (0, transactionService_1.getTransactions)(req.user.id);
        return res.json(transactions);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getTransactions = getTransactions;
const createTransaction = async (req, res) => {
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
        const transaction = await (0, transactionService_1.createTransaction)(req.user.id, {
            amount: Number(amount),
            type,
            category,
            description,
            date,
        });
        return res.status(201).json(transaction);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { amount, type, category, description, date } = req.body;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const transaction = await (0, transactionService_1.updateTransaction)(req.user.id, id, {
            amount: amount !== undefined ? Number(amount) : undefined,
            type,
            category,
            description,
            date,
        });
        return res.json(transaction);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await (0, transactionService_1.deleteTransaction)(req.user.id, id);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteTransaction = deleteTransaction;
