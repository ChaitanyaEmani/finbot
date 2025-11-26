import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, AlertCircle, DollarSign, Calendar, Trash2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
const Budget = () => {
  const API_URL = import.meta.env.VITE_BASE_API_URL;
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalSpent: 0,
    categoriesCount: 0
  });
  const [formData,setFormData] = useState({
    category:'', 
    limit:0,
    month:1, 
    year: new Date().getFullYear(), 
    alertThreshold:10
  });

  const [modalOpen,setModalOpen] = useState(false);
  // Get current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate year options from 2020 to 2 years from now
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 2;
    const years = [];
    for (let year = 2020; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  const token = localStorage.getItem("token");
  // Fetch budgets when month or year changes
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        
        
        // Use the new API endpoint with year and month
        const res = await axios.get(`${API_URL}/api/budget/${selectedYear}/${selectedMonth}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = res.data;
        console.log(data);
        
        const fetchedBudgets = data.data?.budgets || [];
        setBudgets(fetchedBudgets);
        
        // Calculate stats
        const totalBudget = fetchedBudgets.reduce((acc, b) => acc + b.limit, 0);
        const totalSpent = fetchedBudgets.reduce((acc, b) => acc + b.spent, 0);
        
        setStats({
          totalBudget,
          totalSpent,
          categoriesCount: fetchedBudgets.length
        });
        
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [selectedMonth, selectedYear, API_URL]);

  const handleDeleteBudget = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/budget/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update list immediately
      setBudgets(prev => prev.filter(b => b._id !== id));

      // Update stats immediately
      setStats(prev => {
        const deleted = budgets.find(b => b._id === id);
        if (!deleted) return prev;

        return {
          totalBudget: prev.totalBudget - deleted.limit,
          totalSpent: prev.totalSpent - deleted.spent,
          categoriesCount: prev.categoriesCount - 1
        };
      });

      console.log("Deleted:", res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getProgressPercentage = (spent, limit) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleChange = (e) => {
    const {name,value} = e.target;
    setFormData((prev)=>({...prev,[name]:value}));
  };
  
  const handleSubmitBudget = async (e)=>{
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/budget/setbudget`,formData,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      setBudgets(prev=>[...prev,res.data.data.budget])
      console.log(res.data);
      setModalOpen(false);
      setFormData({
        category:'', 
        limit:0,
        month:1, 
        year: new Date().getFullYear(), 
        alertThreshold:10
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Budget Management</h1>
            <p className="text-gray-400">Track and manage your monthly budgets</p>
          </div>
          <button onClick={()=>setModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
            <PlusCircle size={20} />
            Add Budget
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-gray-400 text-sm mb-2">Month</label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer hover:border-purple-500/50 transition-colors focus:outline-none focus:border-purple-500"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-gray-400 text-sm mb-2">Year</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer hover:border-purple-500/50 transition-colors focus:outline-none focus:border-purple-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <button
              onClick={() => {
                const today = new Date();
                setSelectedMonth(today.getMonth() + 1);
                setSelectedYear(today.getFullYear());
              }}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-6 py-3 rounded-lg transition-colors whitespace-nowrap border border-purple-500/30"
            >
              Current Month
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Budget</p>
                <p className="text-3xl font-bold text-white">₹{stats.totalBudget.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <DollarSign className="text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-white">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Categories</p>
                <p className="text-3xl font-bold text-white">{stats.categoriesCount}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Calendar className="text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const percentage = getProgressPercentage(budget.spent, budget.limit);
            const remaining = budget.limit - budget.spent;
            
            return (
              <div
                key={budget._id}
                className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-1">{budget.category}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(budget.year, budget.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {percentage >= budget.alertThreshold && (
                      <div className="bg-yellow-500/20 p-2 rounded-lg">
                        <AlertCircle className="text-yellow-400" size={20} />
                      </div>
                    )}
                    <button onClick={()=>handleDeleteBudget(budget._id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>

                {/* Budget Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Spent</span>
                    <span className="text-white font-semibold">₹{budget.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Limit</span>
                    <span className="text-white font-semibold">₹{budget.limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Remaining</span>
                    <span className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Progress</span>
                      <span className="text-white text-sm font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(percentage)} transition-all duration-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {budgets.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-12 text-center">
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-purple-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No budgets for this period</h3>
            <p className="text-gray-400 mb-6">
              No budgets found for {monthOptions[selectedMonth - 1].label} {selectedYear}
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors">
              <PlusCircle size={20} />
              Add Budget for This Month
            </button>
          </div>
        )}
      </div>
      {modalOpen && <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Budget">
          <form onSubmit={handleSubmitBudget} className="space-y-4">

            {/* Category */}
           <div>
              <label className="block text-gray-300 text-sm mb-1">category</label>
              <select value={formData.category}
              onChange={handleChange}
              name='category'
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Category</option>
                {[
                  'Food', 'Rent', 'Utilities', 'Transportation', 'Healthcare',
                  'Entertainment', 'Shopping', 'Education', 'Travel', 'Groceries',
                  'Insurance', 'Debt Payment', 'Savings', 'Other Expense','Trip'
                ] .map((m, index) => (
                  <option key={index} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Budget Limit (₹)</label>
              <input
                type="number"
                name='limit'
                value={formData.limit}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
                placeholder="Enter budget limit"
              />
            </div>

            {/* Month */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Month</label>
              <select value={formData.month}
              onChange={handleChange}
              name='month'
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
              >
                <option value="">Select month</option>
                {[
                  "January","February","March","April","May","June",
                  "July","August","September","October","November","December"
                ].map((m, index) => (
                  <option key={index} value={index + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Year</label>
              <input value={formData.year}
              onChange={handleChange}
              name='year'
                type="number"
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
                placeholder="e.g., 2025"
              />
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Alert Threshold (%)</label>
              <input value={formData.alertThreshold}
              onChange={handleChange}
              name='alertThreshold'
                type="number"
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-2 rounded-lg
                          focus:outline-none focus:border-purple-500"
                placeholder="e.g., 80"
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
  );
};

export default Budget;