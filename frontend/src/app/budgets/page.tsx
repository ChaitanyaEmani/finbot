'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { budgetService, transactionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  DollarSign, 
  Tag, 
  Calendar,
  AlertCircle,
  PiggyBank,
  Edit3
} from 'lucide-react';

interface Budget {
  _id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const CATEGORIES = [
  'Food', 
  'Rent', 
  'Utilities', 
  'Entertainment', 
  'Transport', 
  'Healthcare', 
  'Investments',
  'Shopping', 
  'Other'
];

export default function Budgets() {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency);

  // State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const handleEditClick = (b: Budget) => {
    setEditingBudgetId(b._id);
    setCategory(b.category);
    setLimit(String(b.limit));
    setMonth(b.month);
    setYear(b.year);
    setShowAddForm(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);
      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets and transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (limit === '' || Number(limit) <= 0 || !category) {
      alert('Please provide a valid category and spending limit.');
      return;
    }

    try {
      setActionLoading(true);
      const updatedBudget = await budgetService.upsert({
        category,
        limit: Number(limit),
        month: Number(month),
        year: Number(year)
      });

      // Update local state (since upsert could replace an existing or create a new one)
      const index = budgets.findIndex(
        b => b.category === category && b.month === Number(month) && b.year === Number(year)
      );

      if (index > -1) {
        const newBudgets = [...budgets];
        newBudgets[index] = updatedBudget;
        setBudgets(newBudgets);
      } else {
        setBudgets([...budgets, updatedBudget]);
      }

      setLimit('');
      setEditingBudgetId(null);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to set budget');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget limit?')) return;

    try {
      setActionLoading(true);
      await budgetService.delete(id);
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget limit');
    } finally {
      setActionLoading(false);
    }
  };

  // Group current-month transactions by category to calculate spending
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter(t => {
    const txDate = new Date(t.date);
    return t.type === 'expense' && 
           (txDate.getMonth() + 1) === currentMonth && 
           txDate.getFullYear() === currentYear;
  });

  const categorySpending: Record<string, number> = {};
  currentMonthExpenses.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-background overflow-hidden">
      <Navigation />

      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Monthly Budgets</h1>
            <p className="text-sm text-zinc-400">Set limits for categories and track your progress throughout the month.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold flex items-center space-x-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Budget</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {budgets.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/10">
                <PiggyBank className="w-12 h-12 text-zinc-650 mx-auto mb-3" />
                <h3 className="font-bold text-white text-base">No budgets set yet</h3>
                <p className="text-zinc-550 text-xs mt-1 max-w-sm mx-auto">
                  Allocate monthly spending limits per category to help regulate your expenses.
                </p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:text-white font-medium hover:bg-zinc-805 transition"
                >
                  Configure Budget Limit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map(b => {
                  const spent = categorySpending[b.category] || 0;
                  const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                  const remaining = b.limit - spent;
                  
                  // Color threshold
                  let colorClass = 'bg-emerald-500';
                  let textColorClass = 'text-emerald-400';
                  if (percentage >= 100) {
                    colorClass = 'bg-rose-500';
                    textColorClass = 'text-rose-400';
                  } else if (percentage >= 70) {
                    colorClass = 'bg-amber-500';
                    textColorClass = 'text-amber-550';
                  }

                  return (
                    <div key={b._id} className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 relative overflow-hidden flex flex-col justify-between h-48">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-white uppercase tracking-wider text-sm">{b.category}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditClick(b)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-violet-405 transition cursor-pointer"
                              disabled={actionLoading}
                              title="Edit budget limit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                              disabled={actionLoading}
                              title="Remove budget limit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar Info */}
                        <div className="flex justify-between items-baseline text-xs mb-2">
                          <span className="text-zinc-400 font-medium">
                            Spent: <span className="font-semibold text-white">{currencySymbol}{spent.toFixed(2)}</span>
                          </span>
                          <span className="text-zinc-500">
                            Limit: <span className="font-semibold text-zinc-350">{currencySymbol}{b.limit.toFixed(0)}</span>
                          </span>
                        </div>
                        
                        {/* Progress Bar Slider */}
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-3">
                          <div 
                            className={`h-full ${colorClass} transition-all duration-500`} 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="flex items-center justify-between text-xs border-t border-zinc-900/60 pt-3">
                        <div className="font-medium text-zinc-500" suppressHydrationWarning>
                          Period: {new Date(b.year, b.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })}
                        </div>
                        {remaining >= 0 ? (
                          <div className={`font-semibold ${textColorClass}`}>
                            {currencySymbol}{remaining.toFixed(2)} left
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 font-semibold text-rose-450">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Over limit by {currencySymbol}{Math.abs(remaining).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Add Budget Limit Overlay Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md border border-zinc-800 bg-zinc-900 rounded-2xl shadow-2xl relative">
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBudgetId(null);
                  setLimit('');
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">
                  {editingBudgetId ? 'Edit Spending Limit' : 'Set Spending Limit'}
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  {editingBudgetId ? 'Modify the monthly spending cap.' : 'Allocate budgets dynamically by category and month.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                        <Tag className="w-4 h-4" />
                      </span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full h-11 pl-10 pr-8 rounded-xl border border-zinc-855 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-violet-600 appearance-none ${
                          editingBudgetId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        }`}
                        required
                        disabled={!!editingBudgetId}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Limit Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Monthly Limit ({currencySymbol})</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-550 text-sm font-semibold pointer-events-none select-none">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-zinc-800 bg-zinc-955 text-white placeholder-zinc-650 focus:outline-none focus:border-violet-600 text-sm transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Period Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Month</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                          <Calendar className="w-4 h-4" />
                        </span>
                        <select
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          className={`w-full h-11 pl-10 pr-8 rounded-xl border border-zinc-850 bg-zinc-950 text-zinc-350 text-sm focus:outline-none appearance-none ${
                            editingBudgetId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
                          required
                          disabled={!!editingBudgetId}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                              {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className={`w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-600 text-sm transition ${
                          editingBudgetId ? 'cursor-not-allowed opacity-60' : ''
                        }`}
                        required
                        disabled={!!editingBudgetId}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full h-11 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      editingBudgetId ? 'Save Changes' : 'Set Budget Limit'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
