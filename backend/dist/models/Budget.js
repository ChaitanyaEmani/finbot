"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = void 0;
const mongoose_1 = require("mongoose");
const BudgetSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    limit: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
// Compound index to ensure a user has only one budget limit per category per month/year
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
exports.Budget = (0, mongoose_1.model)('Budget', BudgetSchema);
exports.default = exports.Budget;
