import React from 'react';
import { useEffect } from 'react';
import {toast} from 'react-toastify';
import axios from 'axios';
const Budget = () => {
  const API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(()=>{
     const fetchCurrentBudgets = async ()=>{
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/budget/current`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        console.log(res.data);
      } catch (error) {
        console.log(error.message);
      }
     }

     fetchCurrentBudgets();
  },[]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Budget Management</h1>
        <div className="bg-slate-800 rounded-xl p-8 border border-purple-500/20">
          <p className="text-gray-300">Budget page content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default Budget;