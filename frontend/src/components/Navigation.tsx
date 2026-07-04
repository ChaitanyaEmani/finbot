'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  Bot
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budgets', href: '/budgets', icon: PiggyBank },
    { name: 'AI Chat Advisor', href: '/chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">finbot</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-zinc-950 flex flex-col justify-between pt-20 px-6 pb-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3.5 px-4 h-12 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive 
                      ? 'bg-violet-600 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-zinc-800/80 pt-6 space-y-4">
            <Link 
              href="/profile" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-3 px-2 hover:bg-zinc-900/40 p-1.5 rounded-xl cursor-pointer transition w-full"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-violet-400 font-bold">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white truncate max-w-[180px]">{user?.name || 'User'}</div>
                <div className="text-xs text-zinc-500 truncate max-w-[180px]">{user?.email}</div>
              </div>
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full h-11 flex items-center justify-center space-x-2 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-sm font-semibold text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 border-r border-zinc-850 bg-zinc-950 p-6">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center space-x-2.5 px-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-violet-500/10">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">finbot</span>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3.5 px-4 h-11 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/15' 
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-900/80 pt-6 space-y-4">
          <Link 
            href="/profile" 
            className="flex items-center space-x-3 px-2 hover:bg-zinc-900/40 p-1.5 rounded-xl cursor-pointer transition w-full"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-violet-400 font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold text-white truncate max-w-[130px]">{user?.name || 'User'}</div>
              <div className="text-xs text-zinc-500 truncate max-w-[130px]">{user?.email}</div>
            </div>
          </Link>
          <button
            onClick={logout}
            className="w-full h-10 flex items-center justify-center space-x-2 rounded-xl hover:bg-zinc-900 text-xs font-semibold text-rose-450 border border-transparent hover:border-zinc-850 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
export default Navigation;
