"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_finbot';
const registerUser = async (name, email, password, currency, country, monthlyIncome) => {
    // Check for existing user
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // Create user
    const newUser = await User_1.User.create({
        name,
        email,
        password: hashedPassword,
        currency: currency || 'USD',
        country: country || 'United States',
        monthlyIncome: monthlyIncome || 0,
    });
    // Create token
    const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, getSecret(), { expiresIn: '30d' });
    return {
        token,
        user: {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            currency: newUser.currency,
            country: newUser.country,
            monthlyIncome: newUser.monthlyIncome,
        },
    };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await User_1.User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, getSecret(), { expiresIn: '30d' });
    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            currency: user.currency,
            country: user.country,
            monthlyIncome: user.monthlyIncome,
        },
    };
};
exports.loginUser = loginUser;
const getUserProfile = async (userId) => {
    const user = await User_1.User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
exports.getUserProfile = getUserProfile;
