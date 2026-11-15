import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const DEFAULT_COLORS = [
  '#F59E0B', '#EC4899', '#0EA5E9', '#EF4444', '#8B5CF6',
  '#10B981', '#6366F1', '#F97316', '#14B8A6', '#64748B'
];

const CategoryTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200">{data.category}</p>
        <p className="font-semibold text-slate-900 dark:text-white mt-1">
          {formatCurrency(data.amount, currency)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ data = [], height = 280, showLegend = true }) => {
  const { currency } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-sm text-slate-400">
        <p>No expense data recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* Donut Chart */}
      <div style={{ width: height, height }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CategoryTooltip currency={currency} />} />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={height * 0.28}
              outerRadius={height * 0.42}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => {
                const color = CATEGORY_COLORS[entry.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Percentages */}
      {showLegend && (
        <div className="w-full max-w-xs space-y-2 max-h-56 overflow-y-auto pr-1">
          {data.map((item, idx) => {
            const color = CATEGORY_COLORS[item.category] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <span className="text-slate-400 w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryChart;
