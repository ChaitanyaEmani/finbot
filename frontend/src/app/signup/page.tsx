'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, Globe, Coins, DollarSign } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('United States');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !currency || !country || !monthlyIncome) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const incomeNum = Number(monthlyIncome);
    if (isNaN(incomeNum) || incomeNum < 0) {
      setError('Monthly income must be a positive number');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await register({ 
        name, 
        email, 
        password, 
        currency, 
        country, 
        monthlyIncome: incomeNum 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check details.');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              finbot
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="text-zinc-400 text-sm mt-1">Get started with tracking your finance journey today</p>
        </div>

        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Country
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                  <Globe className="w-4 h-4" />
                </span>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition appearance-none cursor-pointer"
                  required
                >
                  <option value="United States">United States</option>
                  <option value="India">India</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <Coins className="w-4 h-4" />
                  </span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition appearance-none cursor-pointer"
                    required
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-600/20 group"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 font-semibold hover:text-violet-350 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
