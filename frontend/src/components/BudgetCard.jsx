import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const { currency } = useAuth();
  const { category, amount, spent, remaining, percentage, isWarning, isExceeded } = budget;

  const categoryColor = CATEGORY_COLORS[category] || '#64748B';

  // Determine status color and styles
  let statusBadge = null;
  let barColor = 'bg-emerald-500';

  if (isExceeded) {
    barColor = 'bg-rose-500';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
        <AlertOctagon className="w-3 h-3" />
        Exceeded
      </span>
    );
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
        <AlertTriangle className="w-3 h-3" />
        80% Reached
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />
        On Track
      </span>
    );
  }

  // Clamped percentage for the progress bar visual (max 100%)
  const clampedProgress = Math.min(100, Math.max(0, percentage));

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-lg shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category}</h3>
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          <div className="flex items-center gap-1 border-l border-slate-100 dark:border-slate-800 pl-2">
            <button
              onClick={() => onEdit(budget)}
              title="Edit budget"
              className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              title="Delete budget"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline justify-between mt-2">
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(spent, currency)}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          of {formatCurrency(amount, currency)} limit
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs font-medium">
        <span className="text-slate-500 dark:text-slate-400">{percentage}% used</span>
        {isExceeded ? (
          <span className="text-rose-600 dark:text-rose-400 font-bold">
            Exceeded by {formatCurrency(Math.abs(remaining), currency)}
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            {formatCurrency(remaining, currency)} remaining
          </span>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
