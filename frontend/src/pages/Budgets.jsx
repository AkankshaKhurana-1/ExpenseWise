import React, { useState, useEffect, useCallback } from 'react';
import {
  WalletCards,
  Plus,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import BudgetModal from '../components/BudgetModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { budgetService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const monthsList = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

const Budgets = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);

  const { showToast } = useToast();
  const { currency } = useAuth();

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await budgetService.getAll({
        month: selectedMonth,
        year: selectedYear
      });
      if (res.data?.success) {
        setBudgets(res.data.budgets || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load budgets for selected period', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showToast]);

  useEffect(() => {
    fetchBudgets();
    const handleTxUpdate = () => fetchBudgets();
    window.addEventListener('transaction-updated', handleTxUpdate);
    return () => window.removeEventListener('transaction-updated', handleTxUpdate);
  }, [fetchBudgets]);

  const handleCreateOrUpdate = async (data) => {
    if (editingBudget) {
      await budgetService.update(editingBudget._id, { amount: data.amount });
      showToast('Budget updated successfully!');
    } else {
      await budgetService.create(data);
      showToast('Budget limit set successfully!');
    }
    fetchBudgets();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    await budgetService.delete(deletingBudget._id);
    showToast(`Removed budget for ${deletingBudget.category}`);
    setDeletingBudget(null);
    fetchBudgets();
  };

  // Warning counters
  const exceededCount = budgets.filter((b) => b.isExceeded).length;
  const warningCount = budgets.filter((b) => b.isWarning).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Budget Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Plan category spending limits and monitor budget utilization in real-time.
          </p>
        </div>

        {/* Month & Year Selectors + New Budget button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent py-1.5 px-2 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent py-1.5 px-2 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none border-l border-slate-200 dark:border-slate-700"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Set Budget
          </button>
        </div>
      </div>

      {/* Warnings & Alerts Banner */}
      {(exceededCount > 0 || warningCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exceededCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Attention: <span className="font-extrabold">{exceededCount}</span> category budget(s) have exceeded their 100% allocation limit.
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Caution: <span className="font-extrabold">{warningCount}</span> category budget(s) have reached 80% or more of their limits.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Summary KPI Banner */}
      {summary && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Budget
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(summary.totalBudget, currency)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across {budgets.length} categories</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Spent
              </p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(summary.totalSpentInBudgets, currency)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Actual expense recorded</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Remaining Limit
              </p>
              <p
                className={`text-xl sm:text-2xl font-black mt-1 ${
                  summary.remaining < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(summary.remaining, currency)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Net budget headroom</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Overall Utilization
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.overallPercentage}%
              </p>
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    summary.overallPercentage > 100
                      ? 'bg-rose-500'
                      : summary.overallPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Calculating actual spending against budget limits..." />
      ) : budgets.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <WalletCards className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Budgets Set for this Month
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Setting category budgets helps keep your spending disciplined and provides warning indicators when you reach 80% capacity.
          </p>
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={(budget) => {
                setEditingBudget(budget);
                setIsModalOpen(true);
              }}
              onDelete={(budget) => setDeletingBudget(budget)}
            />
          ))}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBudget}
        activeMonth={selectedMonth}
        activeYear={selectedYear}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Category Budget"
        message={`Are you sure you want to remove the monthly budget limit for "${deletingBudget?.category}"? Actual transactions won't be deleted.`}
      />
    </div>
  );
};

export default Budgets;
