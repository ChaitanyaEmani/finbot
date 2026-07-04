"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: 'USD',
    },
    country: {
        type: String,
        required: true,
        default: 'United States',
    },
    monthlyIncome: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
exports.default = exports.User;
