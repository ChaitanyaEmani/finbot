"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, {
    timestamps: true,
});
exports.Transaction = (0, mongoose_1.model)('Transaction', TransactionSchema);
exports.default = exports.Transaction;
