"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactions = exports.autoGenerateMonthlySalary = void 0;
const Transaction_1 = require("../models/Transaction");
const User_1 = require("../models/User");
const autoGenerateMonthlySalary = async (userId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user || !user.monthlyIncome || user.monthlyIncome <= 0) {
            return;
        }
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        const existingSalary = await Transaction_1.Transaction.findOne({
            userId,
            type: 'income',
            category: 'Salary',
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });
        if (!existingSalary) {
            await Transaction_1.Transaction.create({
                userId,
                amount: user.monthlyIncome,
                type: 'income',
                category: 'Salary',
                description: 'Auto-generated Monthly Salary',
                date: startOfMonth
            });
        }
    }
    catch (error) {
        console.error('Error auto-generating monthly salary:', error);
    }
};
exports.autoGenerateMonthlySalary = autoGenerateMonthlySalary;
const getTransactions = async (userId) => {
    await (0, exports.autoGenerateMonthlySalary)(userId);
    return Transaction_1.Transaction.find({ userId }).sort({ date: -1, createdAt: -1 });
};
exports.getTransactions = getTransactions;
const createTransaction = async (userId, data) => {
    return Transaction_1.Transaction.create({
        userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description || '',
        date: data.date ? new Date(data.date) : new Date(),
    });
};
exports.createTransaction = createTransaction;
const updateTransaction = async (userId, transactionId, data) => {
    const transaction = await Transaction_1.Transaction.findById(transactionId);
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    if (transaction.userId.toString() !== userId) {
        throw new Error('Unauthorized to modify this transaction');
    }
    if (data.amount !== undefined)
        transaction.amount = data.amount;
    if (data.type !== undefined)
        transaction.type = data.type;
    if (data.category !== undefined)
        transaction.category = data.category;
    if (data.description !== undefined)
        transaction.description = data.description;
    if (data.date !== undefined)
        transaction.date = new Date(data.date);
    return transaction.save();
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (userId, transactionId) => {
    const transaction = await Transaction_1.Transaction.findById(transactionId);
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    if (transaction.userId.toString() !== userId) {
        throw new Error('Unauthorized to delete this transaction');
    }
    await Transaction_1.Transaction.findByIdAndDelete(transactionId);
    return { success: true };
};
exports.deleteTransaction = deleteTransaction;
