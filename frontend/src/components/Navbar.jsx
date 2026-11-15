import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  User,
  LogOut,
  ChevronDown,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { useToast } from '../context/ToastContext';

const pageTitles = {
  '/dashboard': 'Financial Dashboard',
  '/transactions': 'Transactions Management',
  '/budgets': 'Monthly Budget Planner',
  '/reports': 'Reports & Analytics',
  '/profile': 'Profile & Preferences'
};

const Navbar = ({ onMenuClick, onQuickAdd }) => {
  const { user, currency, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = pageTitles[location.pathname] || 'Dashboard';
  const isDark = user?.theme === 'dark';

  const toggleTheme = async () => {
    const nextTheme = isDark ? 'light' : 'dark';
    try {
      updateUser({ theme: nextTheme });
      await userService.updateProfile({ theme: nextTheme });
      showToast(`Switched to ${nextTheme} theme`);
    } catch (err) {
      console.error('Failed to save theme preference', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {/* Currency badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{currency}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-400">Signed in as</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
