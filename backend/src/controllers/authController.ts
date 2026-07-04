import { Response } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { autoGenerateMonthlySalary } from '../services/transactionService';

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password, currency, country, monthlyIncome } = req.body;

  try {
    if (!name || !email || !password || !currency || !country || monthlyIncome === undefined) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const incomeNum = Number(monthlyIncome);
    if (isNaN(incomeNum) || incomeNum < 0) {
      return res.status(400).json({ message: 'Monthly income must be a positive number' });
    }

    const result = await registerUser(
      name, 
      email, 
      password, 
      currency, 
      country, 
      incomeNum
    );
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const result = await loginUser(email, password);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const profile = await getUserProfile(req.user.id);
    return res.json(profile);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, currency, country, monthlyIncome } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (currency !== undefined) {
      const allowed = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'];
      if (!allowed.includes(currency)) {
        return res.status(400).json({ message: `Unsupported currency: ${currency}` });
      }
      user.currency = currency;
    }

    if (country !== undefined) {
      if (!country.trim()) {
        return res.status(400).json({ message: 'Country cannot be empty' });
      }
      user.country = country.trim();
    }

    let incomeChanged = false;
    if (monthlyIncome !== undefined) {
      const incomeNum = Number(monthlyIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        return res.status(400).json({ message: 'Monthly income must be a positive number' });
      }
      if (user.monthlyIncome !== incomeNum) {
        user.monthlyIncome = incomeNum;
        incomeChanged = true;
      }
    }

    await user.save();

    // Adjust Salary transaction dynamically if monthly income has changed
    if (incomeChanged) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      const existingSalary = await Transaction.findOne({
        userId: user._id,
        type: 'income',
        category: 'Salary',
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      if (existingSalary) {
        existingSalary.amount = user.monthlyIncome;
        await existingSalary.save();
      } else if (user.monthlyIncome > 0) {
        // If it didn't exist but they now have a positive income, auto-generate it
        await autoGenerateMonthlySalary(user._id.toString());
      }
    }

    const updatedProfile = await getUserProfile(user._id.toString());
    return res.json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userId = req.user.id;

    // Delete user
    await User.findByIdAndDelete(userId);

    // Delete transactions
    await Transaction.deleteMany({ userId });

    // Delete budgets
    await Budget.deleteMany({ userId });

    return res.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
