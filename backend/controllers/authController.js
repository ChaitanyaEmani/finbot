import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, currency, monthlyIncome } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }
     
    if(password.length < 6){
      return res.status(500).json({message:"password should be atleast 6 characters"});
    }
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'USD',
      monthlyIncome: monthlyIncome || 0
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message:"Registered Successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
          lastLogin: user.lastLogin
        },
        token
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
    console.log(error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      message:"Fetched Profile details",
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, currency, monthlyIncome } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, monthlyIncome },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message:"Updated Profile",
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
