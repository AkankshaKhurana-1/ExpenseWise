import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const TransactionTable = ({
  transactions = [],
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { currency } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        Loading transactions...
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Tag className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No transactions found</h4>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or add a new transaction.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-4">Transaction</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const categoryColor = CATEGORY_COLORS[tx.category] || '#64748B';

            return (
              <tr
                key={tx._id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Title & Desc */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {tx.title}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{tx.description}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: categoryColor }}
                    />
                    {tx.category}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>

                {/* Amount */}
                <td
                  className={`py-3.5 px-4 text-right font-bold text-sm whitespace-nowrap ${
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(tx)}
                        title="Delete transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
