import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(item.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyChart = ({ data = [], height = 300 }) => {
  const { currency } = useAuth();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No monthly trend data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10B981"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            name="Expenses"
            dataKey="expenses"
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
