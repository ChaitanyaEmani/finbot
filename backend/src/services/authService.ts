import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_finbot';

export const registerUser = async (
  name: string, 
  email: string, 
  password: string, 
  currency?: string, 
  country?: string, 
  monthlyIncome?: number
) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    currency: currency || 'USD',
    country: country || 'United States',
    monthlyIncome: monthlyIncome || 0,
  });

  // Create token
  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    getSecret(),
    { expiresIn: '30d' }
  );

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

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    getSecret(),
    { expiresIn: '30d' }
  );

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

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
