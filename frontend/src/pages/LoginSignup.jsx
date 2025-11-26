import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, DollarSign, Wallet, ArrowLeft } from 'lucide-react';
import axios from 'axios';
export default function LoginSignupPage() {
  const API_URL=import.meta.env.VITE_BASE_API_URL;
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'USD',
    monthlyIncome: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !formData.monthlyIncome) {
      newErrors.monthlyIncome = 'Monthly income is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    const endpoint = isLogin ? "login" : "register";

    let payload;

    if (isLogin) {
      // LOGIN: only email + password
      payload = {
        email: formData.email,
        password: formData.password
      };
    } else {
      // REGISTER: all fields
      payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        currency: formData.currency,
        monthlyIncome: formData.monthlyIncome
      };
    }

    // API CALL
    const res = await axios.post(`${API_URL}/auth/${endpoint}`, payload);

    // Save token + user
    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    console.log(localStorage.getItem("token"));
    // Trigger navbar update
    window.dispatchEvent(new Event("authChange"));

    // // Redirect
    window.location.href = "/";

  } catch (error) {
    console.log(error);

    setErrors({
      submit:
        error.response?.data?.message ||
        "Something went wrong. Please try again."
    });

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full mt-20 max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = "/"}
          className="flex items-center space-x-2 text-gray-300 hover:text-white mb-6 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-8">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {isLogin ? 'Login to manage your finances' : 'Start your financial journey today'}
          </p>

          <div className="space-y-4">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-purple-500/30'
                    } focus:border-purple-500 focus:outline-none transition`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-purple-500/30'
                  } focus:border-purple-500 focus:outline-none transition`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full bg-slate-800 text-white pl-12 pr-12 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-purple-500/30'
                  } focus:border-purple-500 focus:outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Currency Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Currency
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <select 
                    name="currency"
                    value={formData.currency} 
                    onChange={handleChange}
                    className={`w-full bg-slate-800 text-white pl-12 pr-10 py-3 rounded-lg border ${
                      errors.currency ? 'border-red-500' : 'border-purple-500/30'
                    } focus:border-purple-500 focus:outline-none transition appearance-none cursor-pointer`}
                  >
                    {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'PKR'].map((curr, idx) => (
                      <option key={idx} value={curr} className="bg-slate-800">
                        {curr}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.currency && (
                  <p className="text-red-400 text-sm mt-1">{errors.currency}</p>
                )}
              </div>
            )}

            {/* Monthly Income Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Monthly Income
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    placeholder="Enter your monthly income"
                    className={`w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-lg border ${
                      errors.monthlyIncome ? 'border-red-500' : 'border-purple-500/30'
                    } focus:border-purple-500 focus:outline-none transition`}
                  />
                </div>
                {errors.monthlyIncome && (
                  <p className="text-red-400 text-sm mt-1">{errors.monthlyIncome}</p>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Login' : 'Sign Up'
              )}
            </button>
          </div>

          {/* Toggle between Login/Signup */}
          <p className="text-center text-gray-400 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}