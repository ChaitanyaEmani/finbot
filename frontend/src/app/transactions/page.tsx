'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Navigation from '../../components/Navigation';
import { transactionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';
import {
  Plus,
  Trash2,
  Search,
  Filter,
  Loader2,
  X,
  Calendar,
  DollarSign,
  Tag,
  AlignLeft,
  Edit3
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Transaction {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
}

const CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Entertainment',
  'Salary',
  'Transport',
  'Healthcare',
  'Investments',
  'Shopping',
  'Other'
];

function TransactionsContent() {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency);
  const searchParams = useSearchParams();

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (tx: Transaction) => {
    setEditingTxId(tx._id);
    setAmount(String(tx.amount));
    setType(tx.type);
    setCategory(tx.category);
    setDescription(tx.description || '');
    // Format date to YYYY-MM-DD
    const txDate = new Date(tx.date);
    const yyyy = txDate.getFullYear();
    const mm = String(txDate.getMonth() + 1).padStart(2, '0');
    const dd = String(txDate.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setShowAddForm(true);
  };

  // Filters State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    fetchTransactions();

    // Automatically trigger form popup if ?add=true param is present
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !category) {
      alert('Please fill all required fields correctly.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingTxId) {
        const updatedTx = await transactionService.update(editingTxId, {
          amount: Number(amount),
          type,
          category,
          description,
          date,
        });

        setTransactions(transactions.map(t => t._id === editingTxId ? updatedTx : t));
        setEditingTxId(null);
      } else {
        const newTx = await transactionService.create({
          amount: Number(amount),
          type,
          category,
          description,
          date,
        });

        setTransactions([newTx, ...transactions]);
      }

      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      setActionLoading(true);
      await transactionService.delete(id);
      setTransactions(transactions.filter(tx => tx._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950">
      <Navigation />

      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Transactions Ledger</h1>
            <p className="text-sm text-zinc-400">View, search, filter, and add your financial journal logs.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold flex items-center space-x-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or category..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-550 focus:outline-none focus:border-violet-650 text-sm transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter by Type */}
            <div className="flex items-center space-x-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterType === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterType === 'income' ? 'bg-emerald-600/20 text-emerald-450' : 'text-zinc-400 hover:text-white'
                  }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterType === 'expense' ? 'bg-rose-500/10 text-rose-450' : 'text-zinc-400 hover:text-white'
                  }`}
              >
                Expense
              </button>
            </div>

            {/* Filter by Category */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 pl-8 pr-8 rounded-xl border border-zinc-850 bg-zinc-900/60 text-zinc-300 text-xs font-medium focus:outline-none focus:border-violet-650 appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Ledger Table */}
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-sm text-zinc-500">No matching logs found in your ledger.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3.5 font-medium">Type</th>
                      <th className="pb-3.5 font-medium">Category</th>
                      <th className="pb-3.5 font-medium">Description</th>
                      <th className="pb-3.5 font-medium">Date</th>
                      <th className="pb-3.5 font-medium">Amount</th>
                      <th className="pb-3.5 font-medium text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {filteredTransactions.map(tx => (
                      <tr key={tx._id} className="group hover:bg-zinc-900/5">
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-455' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-white">{tx.category}</td>
                        <td className="py-4 text-zinc-400 max-w-[240px] truncate" title={tx.description}>
                          {tx.description || '-'}
                        </td>
                        <td className="py-4 text-zinc-500 text-xs" suppressHydrationWarning>
                          {new Date(tx.date).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </td>
                        <td className={`py-4 font-semibold ${tx.type === 'income' ? 'text-emerald-450' : 'text-rose-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleEditClick(tx)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-violet-400 transition cursor-pointer"
                              title="Edit transaction"
                              disabled={actionLoading}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-zinc-850 hover:bg-zinc-900 text-zinc-500 hover:text-rose-455 transition cursor-pointer"
                              title="Delete transaction"
                              disabled={actionLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Transaction Overlay Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md border border-zinc-800 bg-zinc-900 rounded-2xl shadow-2xl relative">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTxId(null);
                  setAmount('');
                  setDescription('');
                  setDate(new Date().toISOString().split('T')[0]);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">
                  {editingTxId ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  {editingTxId ? 'Modify this ledger entry.' : 'Create a ledger entry for your cash logs.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Type */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`h-10 rounded-xl border text-sm font-semibold transition ${type === 'expense'
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-450'
                          : 'border-zinc-800 hover:bg-zinc-800/40 text-zinc-400'
                          }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`h-10 rounded-xl border text-sm font-semibold transition ${type === 'income'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-450'
                          : 'border-zinc-800 hover:bg-zinc-800/40 text-zinc-400'
                          }`}
                      >
                        Income
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Amount ({currencySymbol})</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-550 text-sm font-semibold pointer-events-none select-none">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-650 focus:outline-none focus:border-violet-600 text-sm transition"
                        required
                      />
                    </div>
                  </div>

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
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-zinc-850 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-violet-650 appearance-none cursor-pointer"
                        required
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Date</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 hover:text-white transition cursor-pointer z-10"
                        title="Open date picker"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-600 text-sm transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                    <div className="relative">
                      <span className="absolute top-3 left-3.5 text-zinc-500">
                        <AlignLeft className="w-4 h-4" />
                      </span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Details..."
                        className="w-full h-20 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-650 focus:outline-none focus:border-violet-600 text-sm transition resize-none"
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
                      editingTxId ? 'Save Changes' : 'Save Entry'
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

export default function Transactions() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
