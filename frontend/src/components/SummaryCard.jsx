import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SummaryCard = ({
  title,
  amount,
  changePct,
  changeLabel = 'vs last month',
  icon: Icon,
  colorScheme = 'blue',
  subtitle
}) => {
  const { currency } = useAuth();

  const colorVariants = {
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      border: 'border-slate-200/80 dark:border-slate-800'
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      border: 'border-slate-200/80 dark:border-slate-800'
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      border: 'border-slate-200/80 dark:border-slate-800'
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      border: 'border-slate-200/80 dark:border-slate-800'
    }
  };

  const scheme = colorVariants[colorScheme] || colorVariants.blue;

  return (
    <div
      className={`p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border ${scheme.border} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(amount, currency)}
        </h3>

        {changePct !== undefined && changePct !== null ? (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
            {changePct > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                +{changePct}%
              </span>
            ) : changePct < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5" />
                {changePct}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                <Minus className="w-3.5 h-3.5" />
                0%
              </span>
            )}
            <span className="text-slate-400 font-normal">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};

export default SummaryCard;
