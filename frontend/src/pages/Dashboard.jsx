import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import MonthlyChart from '../components/MonthlyChart';
import CategoryChart from '../components/CategoryChart';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardService, transactionService } from '../services/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyOverview, setMonthlyOverview] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [formInitialType, setFormInitialType] = useState('expense');

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, monthlyRes, catRes, recentRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthlyOverview(),
        dashboardService.getCategoryBreakdown({ allTime: 'false' }),
        dashboardService.getRecentTransactions()
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.summary);
      if (monthlyRes.data?.success) setMonthlyOverview(monthlyRes.data.monthlyOverview);
      if (catRes.data?.success) setCategoryBreakdown(catRes.data.breakdown);
      if (recentRes.data?.success) setRecentTransactions(recentRes.data.transactions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
    const handleTxUpdate = () => fetchDashboardData();
    window.addEventListener('transaction-updated', handleTxUpdate);
    return () => window.removeEventListener('transaction-updated', handleTxUpdate);
  }, [fetchDashboardData]);

  // Open Form for specific type
  const handleOpenAdd = (type = 'expense') => {
    setEditingTransaction(null);
    setFormInitialType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction._id, formData);
      showToast('Transaction updated successfully!');
    } else {
      await transactionService.create(formData);
      showToast('Transaction added successfully!');
    }
    fetchDashboardData();
    window.dispatchEvent(new Event('transaction-updated'));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    await transactionService.delete(deletingTransaction._id);
    showToast('Transaction deleted successfully');
    setDeletingTransaction(null);
    fetchDashboardData();
    window.dispatchEvent(new Event('transaction-updated'));
  };

  if (loading && !summary) {
    return <LoadingSpinner message="Calculating your financial insights..." size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor all balances, income, expenses, and savings in real-time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Add Income
          </button>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-all shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            Add Expense
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            All Transactions
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Balance"
          amount={summary?.totalBalance || 0}
          icon={Wallet}
          colorScheme="blue"
          subtitle="All-time accumulated net balance"
        />
        <SummaryCard
          title="Total Income"
          amount={summary?.thisMonthIncome || 0}
          changePct={summary?.incomeChangePct}
          changeLabel="vs last month"
          icon={ArrowUpRight}
          colorScheme="emerald"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.thisMonthExpenses || 0}
          changePct={summary?.expenseChangePct}
          changeLabel="vs last month"
          icon={ArrowDownRight}
          colorScheme="rose"
        />
        <SummaryCard
          title="Monthly Savings"
          amount={summary?.monthlySavings || 0}
          changePct={summary?.savingsChangePct}
          changeLabel="vs last month"
          icon={PiggyBank}
          colorScheme="emerald"
        />
      </div>

      {/* Charts Grid: Monthly Overview & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart (2 columns on lg) */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Income vs Expense Trends
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial comparison for the past 6 months
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Last 6 Months</span>
            </div>
          </div>
          <MonthlyChart data={monthlyOverview} height={280} />
        </div>

        {/* Expense Category Breakdown (1 column on lg) */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Expense Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category distribution for this month
                </p>
              </div>
            </div>
            <CategoryChart data={categoryBreakdown} height={200} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/reports"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              View Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest 5 activities recorded in your account
            </p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            View All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TransactionTable
          transactions={recentTransactions}
          onEdit={handleEdit}
          onDelete={(tx) => setDeletingTransaction(tx)}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={
          editingTransaction || {
            type: formInitialType,
            category: formInitialType === 'income' ? 'Salary' : 'Food'
          }
        }
        title={editingTransaction ? 'Edit Transaction' : `Add ${formInitialType === 'income' ? 'Income' : 'Expense'}`}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.title}"? This transaction amount will be deducted and all balances will be updated immediately.`}
      />
    </div>
  );
};

export default Dashboard;
