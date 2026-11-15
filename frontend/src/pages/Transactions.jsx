import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/exportCsv';

const ALL_CATEGORIES = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const { showToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        ...(search.trim() && { search: search.trim() }),
        ...(type !== 'all' && { type }),
        ...(category !== 'all' && { category }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const res = await transactionService.getAll(params);
      if (res.data?.success) {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, type, category, startDate, endDate, showToast]);

  useEffect(() => {
    fetchTransactions();
    const handleTxUpdate = () => fetchTransactions();
    window.addEventListener('transaction-updated', handleTxUpdate);
    return () => window.removeEventListener('transaction-updated', handleTxUpdate);
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction._id, formData);
      showToast('Transaction updated successfully!');
    } else {
      await transactionService.create(formData);
      showToast('Transaction added successfully!');
    }
    fetchTransactions();
    window.dispatchEvent(new Event('transaction-updated'));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    await transactionService.delete(deletingTransaction._id);
    showToast('Transaction deleted successfully');
    setDeletingTransaction(null);
    fetchTransactions();
    window.dispatchEvent(new Event('transaction-updated'));
  };

  const handleExportCSV = async () => {
    try {
      // Fetch all matching records without pagination limit for full CSV export
      const res = await transactionService.getAll({
        limit: 1000,
        sortBy,
        sortOrder,
        ...(search.trim() && { search: search.trim() }),
        ...(type !== 'all' && { type }),
        ...(category !== 'all' && { category }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      if (res.data?.transactions) {
        exportTransactionsToCSV(res.data.transactions, `transactions_${Date.now()}.csv`);
        showToast('CSV Export downloaded successfully!');
      }
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const categoriesForFilter =
    type === 'income'
      ? INCOME_CATEGORIES
      : type === 'expense'
      ? EXPENSE_CATEGORIES
      : ALL_CATEGORIES;

  const hasActiveFilters = search || type !== 'all' || category !== 'all' || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total of {totalCount} records found in your account
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Title */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategory('all');
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categoriesForFilter.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By & Order */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="title">Sort: Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sorting ${sortOrder.toUpperCase()}`}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-400">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6">
        <TransactionTable
          transactions={transactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsFormOpen(true);
          }}
          onDelete={(tx) => setDeletingTransaction(tx)}
          isLoading={loading}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.title}"? All dashboard figures and budget trackers will recalculate immediately.`}
      />
    </div>
  );
};

export default Transactions;
