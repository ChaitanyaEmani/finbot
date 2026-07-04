'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  MessageSquare, 
  PieChart, 
  ArrowRight, 
  Shield, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col justify-between overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-violet-500/20">
              F
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              finbot
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-4 h-9 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition duration-200 hover:shadow-lg hover:shadow-violet-600/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 h-9 flex items-center justify-center rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-medium transition duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-xs text-violet-400 font-medium tracking-wide animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Financial Tracker</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none">
              Take Control of Your Finance with{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h1>
            
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Track transactions, map out monthly budgets, and converse with a personalized AI chatbot loaded with your spending context to get smart saving recommendations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link 
                href={user ? "/dashboard" : "/signup"} 
                className="w-full sm:w-auto px-6 h-12 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition duration-200 hover:shadow-lg hover:shadow-violet-600/30 group"
              >
                <span>Start Tracking Now</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href={user ? "/chat" : "/login"} 
                className="w-full sm:w-auto px-6 h-12 flex items-center justify-center rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 font-medium text-zinc-300 transition duration-200"
              >
                Chat with Assistant
              </Link>
            </div>

            {/* Quick stats preview */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-zinc-900/80 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-2xl font-bold text-white">0$</div>
                <div className="text-xs text-zinc-500">Startup Fee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-zinc-500">Secure Logs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">Live</div>
                <div className="text-xs text-zinc-500">AI Advisor</div>
              </div>
            </div>
          </div>

          {/* Interactive Feature Cards Display */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />
            
            <div className="space-y-4">
              {/* Feature Card 1 */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700/80 transition group shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400 group-hover:scale-110 transition duration-200">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">Transaction Tracker</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Logs earnings and expenses, classifies statements, and monitors records dynamically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700/80 transition group shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:scale-110 transition duration-200">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">Category Budgets</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Defines monthly allocations, and changes color indicators when limits approach.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700/80 transition group shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition duration-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">AI Financial Bot</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Injects real-time dashboard ledger history into prompts to give smart financial tips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} finbot. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-zinc-400">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Secure Data
            </span>
            <span className="flex items-center text-zinc-400">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Vercel + Render
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
