'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { transactionService, budgetService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  Loader2,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
}

interface Budget {
  _id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txs, budgts] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      setTransactions(txs);
      setBudgets(budgts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // Compute stats
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Category spending breakdown (current month/year spending only, or all-time)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return tx.type === 'expense' && 
           (txDate.getMonth() + 1) === currentMonth && 
           txDate.getFullYear() === currentYear;
  });

  const categorySpending: Record<string, number> = {};
  currentMonthExpenses.forEach(tx => {
    categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
  });

  // Calculate budget alerts
  const budgetAlerts = budgets.map(budget => {
    const spent = categorySpending[budget.category] || 0;
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    return {
      category: budget.category,
      limit: budget.limit,
      spent,
      percentage
    };
  }).filter(alert => alert.percentage >= 80);

  // Calculate rolling and calendar-based expense insights
  const expenseTxs = transactions.filter(tx => tx.type === 'expense');
  const now = new Date();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

  // Calendar week (starts on Monday)
  const monday = new Date(now);
  const dayOfWeek = monday.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisWeekStart = new Date(monday.setDate(monday.getDate() + distanceToMonday));
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const getPeriodStats = (start: Date, end?: Date) => {
    const txs = expenseTxs.filter(tx => {
      const d = new Date(tx.date);
      if (end) return d >= start && d <= end;
      return d >= start;
    });
    const total = txs.reduce((sum, tx) => sum + tx.amount, 0);
    const highest = txs.length > 0 ? txs.reduce((max, tx) => tx.amount > max.amount ? tx : max, txs[0]) : null;
    return { total, highest };
  };

  const todayStats = getPeriodStats(todayStart, todayEnd);
  const yesterdayStats = getPeriodStats(yesterdayStart, yesterdayEnd);
  const thisWeekStats = getPeriodStats(thisWeekStart);
  const thisMonthStats = getPeriodStats(thisMonthStart);
  const thisYearStats = getPeriodStats(thisYearStart);

  // SVG Donut Chart calculation helpers
  const categoryKeys = Object.keys(categorySpending);
  const categoryValues = Object.values(categorySpending);
  const totalSpendingVal = categoryValues.reduce((a, b) => a + b, 0);

  const colorPalette = [
    { stroke: 'stroke-purple-500', bg: 'bg-purple-500' },
    { stroke: 'stroke-emerald-500', bg: 'bg-emerald-500' },
    { stroke: 'stroke-cyan-500', bg: 'bg-cyan-500' },
    { stroke: 'stroke-amber-500', bg: 'bg-amber-500' },
    { stroke: 'stroke-rose-500', bg: 'bg-rose-500' },
    { stroke: 'stroke-pink-500', bg: 'bg-pink-500' }
  ];

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-screen bg-background overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-violet-650/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-700/5 blur-[130px] pointer-events-none" />
      
      <Navigation />
      
      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Overview of your earnings, budget alerts, and category expenditures.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-850 bg-zinc-900/40 text-zinc-300 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span>Current Month: {mounted ? new Date().toLocaleString('default', { month: 'long' }) : ''}</span>
            </span>
            <Link 
              href="/transactions?add=true" 
              className="h-10 px-4.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-violet-600/10 hover:shadow-violet-650/20 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Income */}
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-300" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-400">Total Income</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-white">{currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-zinc-500 mt-2.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>All-time earnings tracked</span>
                </p>
              </div>

              {/* Expenses */}
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors duration-300" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-400">Total Expenses</span>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform duration-300">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-white">{currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-zinc-500 mt-2.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>All-time spending tracked</span>
                </p>
              </div>

              {/* Net Balance */}
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden group sm:col-span-2 lg:col-span-1 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/5 blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-colors duration-300" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-400">Net Savings</span>
                  <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 group-hover:scale-105 transition-transform duration-300">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${netSavings >= 0 ? 'text-emerald-450' : 'text-rose-400'}`}>
                  {netSavings >= 0 ? '' : '-'}{currencySymbol}{Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-zinc-500 mt-2.5 flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${netSavings >= 0 ? 'bg-emerald-400' : 'bg-rose-550'}`} />
                  <span>Income minus expenses</span>
                </p>
              </div>
            </div>

            {/* Expense Insights Widget */}
            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">Expense Insights</h3>
                <p className="text-xs text-zinc-400 mt-1">Detailed review of your spending velocity and highest-ticket purchases across timeframes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Today Card */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Today</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {currencySymbol}{mounted ? todayStats.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5">
                    <span className="block font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Highest Ticket</span>
                    {mounted && todayStats.highest ? (
                      <span className="text-zinc-300 font-medium block truncate mt-0.5" title={`${todayStats.highest.category}: ${todayStats.highest.description || '-'}`}>
                        {todayStats.highest.category}: <span className="font-semibold text-white">{currencySymbol}{todayStats.highest.amount.toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic block mt-0.5">No expense</span>
                    )}
                  </div>
                </div>

                {/* 2. Yesterday Card */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-955/20 hover:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Yesterday</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {currencySymbol}{mounted ? yesterdayStats.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5">
                    <span className="block font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Highest Ticket</span>
                    {mounted && yesterdayStats.highest ? (
                      <span className="text-zinc-300 font-medium block truncate mt-0.5" title={`${yesterdayStats.highest.category}: ${yesterdayStats.highest.description || '-'}`}>
                        {yesterdayStats.highest.category}: <span className="font-semibold text-white">{currencySymbol}{yesterdayStats.highest.amount.toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic block mt-0.5">No expense</span>
                    )}
                  </div>
                </div>

                {/* 3. This Week Card */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-955/20 hover:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">This Week</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {currencySymbol}{mounted ? thisWeekStats.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5">
                    <span className="block font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Highest Ticket</span>
                    {mounted && thisWeekStats.highest ? (
                      <span className="text-zinc-300 font-medium block truncate mt-0.5" title={`${thisWeekStats.highest.category}: ${thisWeekStats.highest.description || '-'}`}>
                        {thisWeekStats.highest.category}: <span className="font-semibold text-white">{currencySymbol}{thisWeekStats.highest.amount.toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic block mt-0.5">No expense</span>
                    )}
                  </div>
                </div>

                {/* 4. This Month Card */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-955/20 hover:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">This Month</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {currencySymbol}{mounted ? thisMonthStats.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5">
                    <span className="block font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Highest Ticket</span>
                    {mounted && thisMonthStats.highest ? (
                      <span className="text-zinc-300 font-medium block truncate mt-0.5" title={`${thisMonthStats.highest.category}: ${thisMonthStats.highest.description || '-'}`}>
                        {thisMonthStats.highest.category}: <span className="font-semibold text-white">{currencySymbol}{thisMonthStats.highest.amount.toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic block mt-0.5">No expense</span>
                    )}
                  </div>
                </div>

                {/* 5. This Year Card */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-955/20 hover:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">This Year</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {currencySymbol}{mounted ? thisYearStats.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5">
                    <span className="block font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">Highest Ticket</span>
                    {mounted && thisYearStats.highest ? (
                      <span className="text-zinc-300 font-medium block truncate mt-0.5" title={`${thisYearStats.highest.category}: ${thisYearStats.highest.description || '-'}`}>
                        {thisYearStats.highest.category}: <span className="font-semibold text-white">{currencySymbol}{thisYearStats.highest.amount.toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 italic block mt-0.5">No expense</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Alerts & Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Spending Breakdown Chart */}
              <div className="lg:col-span-8 p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h3 className="font-bold text-white text-base">Monthly Spending Breakdown</h3>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">This Month</span>
                </div>
                
                {totalSpendingVal === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                    <TrendingDown className="w-10 h-10 text-zinc-600 mb-2 animate-bounce" />
                    <div className="font-semibold text-zinc-400">No expenditures this month</div>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">Add expense transactions to visualize the breakdown.</p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-8 py-4">
                    {/* Centered Chart & Legend Section */}
                    <div className="flex flex-col items-center justify-center w-full">
                      {/* SVG Donut Chart */}
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-zinc-800/40" strokeWidth="2.5" />
                          {(() => {
                            let localAccumulated = 0;
                            return categoryKeys.map((key, i) => {
                              const val = categorySpending[key];
                              const percent = (val / totalSpendingVal) * 100;
                              const strokeDashArray = `${percent} ${100 - percent}`;
                              const strokeDashOffset = 100 - localAccumulated;
                              localAccumulated += percent;
                              
                              return (
                                <circle
                                  key={key}
                                  cx="18"
                                  cy="18"
                                  r="15.915"
                                  fill="none"
                                  className={`${colorPalette[i % colorPalette.length].stroke} transition-all duration-500`}
                                  strokeWidth="3.2"
                                  strokeDasharray={strokeDashArray}
                                  strokeDashoffset={strokeDashOffset}
                                />
                              );
                            });
                          })()}
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Spent</span>
                          <span className="text-lg font-extrabold text-white mt-0.5">
                            {currencySymbol}{totalSpendingVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Legend below the chart */}
                      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-zinc-400">
                        {categoryKeys.map((key, i) => {
                          const dotColor = colorPalette[i % colorPalette.length].bg;
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                              <span className="font-semibold text-zinc-400">{key}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stacked Category List taking full width */}
                    <div className="w-full divide-y divide-zinc-900 border-t border-zinc-900 pt-4">
                      {categoryKeys.map((key, i) => {
                        const val = categorySpending[key];
                        const pct = ((val / totalSpendingVal) * 100).toFixed(0);
                        
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedCategoryForModal(key)}
                            className="w-full py-4 flex items-center justify-between text-sm group hover:bg-zinc-900/30 px-3 rounded-xl transition duration-200 cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-white group-hover:text-primary transition-colors text-base">{key}</span>
                              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-md">({pct}%)</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-white text-base">
                                {currencySymbol}{val.toFixed(2)}
                              </span>
                              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0 group-hover:translate-x-0.5 duration-200" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Alerts & Assistant Prompts */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Budget Alerts */}
                <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 flex-grow space-y-4">
                  <h3 className="font-bold text-white text-base">Budget Alerts</h3>
                  
                  {budgetAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 py-8 h-full">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-zinc-300 text-sm">All budgets in check</h4>
                      <p className="text-xs text-zinc-500 mt-1">Excellent! No spending category exceeds 80% limit.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {budgetAlerts.map(alert => (
                        <div key={alert.category} className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start space-x-3">
                          <AlertTriangle className="w-4 h-4 text-amber-505 flex-shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <div className="font-bold text-white uppercase tracking-wider">{alert.category} Budget Alert</div>
                            <div className="text-zinc-400 leading-relaxed">
                              You spent <span className="font-semibold text-amber-400">{currencySymbol}{alert.spent.toFixed(2)}</span> of your limit ({currencySymbol}{alert.limit.toFixed(2)}) 
                              ({alert.percentage.toFixed(0)}%).
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Assistant Call to Action */}
                <div className="p-6 rounded-2xl border border-violet-600/20 bg-gradient-to-br from-violet-950/20 via-indigo-950/10 to-zinc-950/40 relative overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-violet-650/10 blur-xl pointer-events-none" />
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-base">Ask FinBot</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Need tips on how to lower your food spending or save more this month? Tap below to chat with our AI advisor.
                    </p>
                  </div>

                  <Link 
                    href="/chat"
                    className="mt-5 w-full h-10 flex items-center justify-center space-x-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold transition-all duration-200 group active:scale-98 shadow-md shadow-violet-600/10"
                  >
                    <span>Consult AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <h3 className="font-bold text-white text-base">Recent Ledger Logs</h3>
                <Link href="/transactions" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1 transition-colors">
                  <span>View Full Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/5">
                  <span className="text-sm text-zinc-500">No logged transactions found. Add income or expenses to begin.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 font-medium w-[60%] sm:w-[30%] md:w-[25%]">Category</th>
                        <th className="pb-3 font-medium hidden sm:table-cell sm:w-[45%] md:w-[35%]">Description</th>
                        <th className="pb-3 font-medium hidden md:table-cell md:w-[20%]">Date</th>
                        <th className="pb-3 font-medium text-right w-[40%] sm:w-[25%] md:w-[20%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {transactions.slice(0, 5).map(tx => (
                        <tr key={tx._id} className="group hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3.5">
                            <span className="font-semibold text-white group-hover:text-violet-300 transition-colors">{tx.category}</span>
                            {tx.description && (
                              <div className="text-[11px] text-zinc-400 truncate max-w-[150px] sm:hidden mt-0.5" title={tx.description}>
                                {tx.description}
                              </div>
                            )}
                            <div className="text-[10px] text-zinc-500 md:hidden mt-0.5" suppressHydrationWarning>
                              {new Date(tx.date).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 text-zinc-400 truncate max-w-[200px] hidden sm:table-cell" title={tx.description}>
                            {tx.description || <span className="text-zinc-600">-</span>}
                          </td>
                          <td className="py-3.5 text-zinc-500 text-xs hidden md:table-cell" suppressHydrationWarning>
                            {new Date(tx.date).toLocaleString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </td>
                          <td className={`py-3.5 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-405' : 'text-rose-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Category Transactions Modal */}
        {selectedCategoryForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl border border-zinc-800 bg-zinc-900 rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh] animate-scaleUp">
              {/* Header */}
              <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span className="capitalize">{selectedCategoryForModal}</span>
                    <span className="text-zinc-500 font-normal text-sm">Expenditures</span>
                  </h3>
                  <p className="text-xs text-zinc-450 mt-1">
                    Showing transactions for the month of {mounted ? new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCategoryForModal(null)}
                  className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Content List */}
              <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                {(() => {
                  const filtered = currentMonthExpenses.filter(tx => tx.category === selectedCategoryForModal);
                  
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 text-zinc-500 text-sm">
                        No transactions recorded in this category.
                      </div>
                    );
                  }

                  return (
                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/40">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 text-zinc-455 text-xs font-semibold uppercase tracking-wider bg-zinc-950/50">
                            <th className="p-3.5 pl-4">Description</th>
                            <th className="p-3.5">Date & Time</th>
                            <th className="p-3.5 pr-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 text-sm">
                          {filtered.map(tx => (
                            <tr key={tx._id} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="p-3.5 pl-4 font-semibold text-white max-w-[240px] truncate" title={tx.description}>
                                {tx.description || 'Ledger entry'}
                              </td>
                              <td className="p-3.5 text-zinc-455 text-xs" suppressHydrationWarning>
                                {new Date(tx.date).toLocaleString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </td>
                              <td className="p-3.5 pr-4 text-right font-bold text-rose-450">
                                -{currencySymbol}{tx.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 flex justify-end">
                <button
                  onClick={() => setSelectedCategoryForModal(null)}
                  className="px-5 h-9 bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-zinc-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
