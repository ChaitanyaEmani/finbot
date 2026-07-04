'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { getCurrencySymbol } from '../../utils/currency';
import { 
  User as UserIcon, 
  Mail, 
  Globe, 
  Coins, 
  DollarSign, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('United States');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Status State
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Dialog State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrency(user.currency || 'USD');
      setCountry(user.country || 'United States');
      setMonthlyIncome(user.monthlyIncome !== undefined ? String(user.monthlyIncome) : '0');
    }
  }, [user]);

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim() || !currency || !country || monthlyIncome === '') {
      setErrorMsg('Please fill in all fields');
      return;
    }

    const incomeNum = Number(monthlyIncome);
    if (isNaN(incomeNum) || incomeNum < 0) {
      setErrorMsg('Monthly income must be a positive number');
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
        currency,
        country,
        monthlyIncome: incomeNum
      });
      await refreshUser();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(null);
    setDeleting(true);
    try {
      await authService.deleteAccount();
      logout();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account information and preferences</p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center space-x-3 text-emerald-400 text-sm transition animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 flex items-center space-x-3 text-rose-400 text-sm transition animate-fadeIn">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card Form */}
        <div className="p-6 md:p-8 rounded-2xl border border-zinc-850 bg-zinc-900/10 backdrop-blur-sm relative overflow-hidden">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                    required
                  />
                </div>
              </div>

              {/* Email Address (Disabled) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Email Address (Cannot change)
                </label>
                <div className="relative opacity-60">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-900 bg-zinc-900 text-zinc-400 text-sm cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              {/* Country of Residence */}
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

              {/* Preferred Currency */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Preferred Currency
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

              {/* Monthly Income */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Monthly Income
                </label>
                <div className="relative max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-550 text-sm font-semibold pointer-events-none select-none">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 text-sm transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">This represents your baseline income (salary) dynamically added each month.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 h-11 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/15 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account */}
        <div className="p-6 md:p-8 rounded-2xl border border-rose-950/40 bg-rose-950/10 relative overflow-hidden space-y-5">
          <div>
            <h2 className="text-base font-bold text-rose-500 flex items-center space-x-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
              <span>Delete Account</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Permanently delete your account and all associated financial history. This action is irreversible and will erase all your transaction logs, budget settings, and AI conversation memory.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 h-10 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-semibold rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 space-y-4 max-w-md animate-fadeIn">
              <p className="text-xs text-rose-300 leading-relaxed font-semibold">
                Are you absolutely sure? This will delete all transaction logs, category budgets, and advisor conversation history permanently.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 h-9 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white font-semibold rounded-lg text-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {deleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  <span>Yes, Delete My Account</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 h-9 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
