import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  PieChart,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
  CheckCircle2,
  Lock,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('demo@expensewise.com', 'password123');
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Expense<span className="text-emerald-600 dark:text-emerald-400">Wise</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleDemoLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Demo
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Personal Finance Tracker</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Take Complete Control of Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Wealth & Expenses.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ExpenseWise brings enterprise-grade clarity to your daily personal finances.
            Track every rupee, set smart monthly limits, analyze trends with real-time charts, and reach your savings goals faster.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
            >
              Start Tracking Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-500" />
              Try Live Demo Account
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free & Open Source
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" /> Secure JWT Auth
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-500" /> Multi-Currency
            </span>
          </div>
        </div>

        {/* Dashboard Preview Mockup Section */}
        <div className="mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-slate-200/80 via-slate-100 to-transparent dark:from-slate-800 dark:via-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl">
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-semibold text-slate-400">ExpenseWise Analytics Dashboard</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Live Preview
                </span>
              </div>

              {/* Sample Mini Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Total Balance</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 3,32,552</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+16.9% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Total Income</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹ 1,07,000</p>
                  <span className="text-[10px] text-slate-400 font-medium">Nov 2026</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">₹ 43,149</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">-13% reduced</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Monthly Savings</p>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">₹ 63,851</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+52.4% growth</span>
                </div>
              </div>

              {/* Graphical representation preview banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time MongoDB Aggregations</h4>
                    <p className="text-xs text-slate-400">Interactive Recharts bar, area & donut charts backed by dynamic database queries.</p>
                  </div>
                </div>
                <button
                  onClick={handleDemoLogin}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  Explore Interactive Charts
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for Complete Financial Clarity
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Every feature designed from the ground up for seamless personal budget tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Dynamic Balance & Trends</h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Calculates total balance, income, expenses, and savings dynamically from your transactions. No fake or hardcoded stats.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Category Budgets</h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Set monthly spending limits for categories. Get visual warnings at 80% usage and alert indicators when exceeding limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Data Isolation</h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Protected by JWT tokens and bcrypt encryption. Each user accesses only their own private database records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <footer className="py-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              EW
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              ExpenseWise &copy; 2026
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Production-Ready Full-Stack MERN Personal Finance & Budget Tracker.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <Link to="/login" className="hover:text-emerald-600">Login</Link>
            <Link to="/register" className="hover:text-emerald-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
