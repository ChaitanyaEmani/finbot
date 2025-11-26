import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Search, TrendingUp, TrendingDown, Plus, Edit2, Trash2, X } from 'lucide-react';
import Modal from '../components/Modal';
import axios from 'axios';
const Transaction = () => {
  const API_URL = import.meta.env.VITE_BASE_API_URL;
  
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    pages: 1,
    total: 0
  });
  const today = new Date().toISOString().split("T")[0];  
  // result example: "2025-11-27"

  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: today   // ✅ correct ISO8601 value
  });


  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    fetchTransactions();
  }, []);
  const token = localStorage.getItem("token");
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/transactions/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(res.data.data.pagination);
      setTransactions(res.data.data.transactions);
      setPagination(res.data.data.pagination);
      setFilteredTransactions(res.data.data.transactions);
      
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, filterCategory, transactions]);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Get unique categories
  const categories = [...new Set(transactions.map(t => t.category))];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleChange = (e) => {
    const {name,value} = e.target;
    setFormData((prev)=>({...prev,[name]:value}));
  };

  const handleSubmitTransaction = async (e)=>{
      e.preventDefault();
      try {
        const res = await axios.post(`${API_URL}/api/transactions/add`,formData,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        setTransactions(prev=>[...prev,res.data.data.transaction])
        console.log(res.data);
        setModalOpen(false);
        setFormData({
          type: "income",
          amount: "",
          category: "",
          description: "",
          date: today
        })
      } catch (error) {
        console.log(error.message);
      }
    }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 sm:mb-0">Transactions</h1>
          <button onClick={()=>setModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Income</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Balance</p>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or add a new transaction</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">{formatDate(transaction.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{transaction.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-700/50">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {transaction.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing <span className="text-white font-medium">{filteredTransactions.length}</span> of{' '}
                    <span className="text-white font-medium">{pagination.total}</span> transactions
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="text-gray-300 text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {modalOpen && <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Budget">
          <form onSubmit={handleSubmitTransaction} className="space-y-4">

            {/* Category */}
           <div>
              <label className="block text-gray-300 text-sm mb-1">Type</label>
              <select value={formData.type}
              onChange={handleChange}
              name='type'
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
              >
                <option value="">Select type</option>
                {[
                  'income','expense'
                ] .map((m, index) => (
                  <option key={index} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Amount (₹)</label>
              <input
                type="number"
                name='amount'
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">category</label>
              <select value={formData.category}
              onChange={handleChange}
              name='category'
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Category</option>
                {['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income','Trip',
                  'Food', 'Rent', 'Utilities', 'Transportation', 'Healthcare',
                  'Entertainment', 'Shopping', 'Education', 'Travel', 'Groceries',
                  'Insurance', 'Debt Payment', 'Savings', 'Other Expense'
                ] .map((m, index) => (
                  <option key={index} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Description</label>
              <textarea value={formData.description} rows={4}
              onChange={handleChange}
              name='description'
                type="number"
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
                placeholder="e.g., 80"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
              />
            </div>


            {/* Submit Button */}
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg mt-4 
                        transition-colors font-semibold"
            >
              Save Budget
            </button>
          </form>
        </Modal>
      }
      </div>
    </div>
  );
};

export default Transaction;