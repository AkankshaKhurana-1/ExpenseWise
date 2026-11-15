import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import CategoryChart from '../components/CategoryChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportService, transactionService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { exportTransactionsToCSV } from '../utils/exportCsv';

const Reports = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportType, setReportType] = useState('expense'); // for category breakdown

  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { currency } = useAuth();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [monthlyRes, catRes, yearlyRes] = await Promise.all([
        reportService.getMonthly({ year: selectedYear }),
        reportService.getCategoryWise({ year: selectedYear, type: reportType }),
        reportService.getYearly()
      ]);

      if (monthlyRes.data?.success) {
        setMonthlyData(monthlyRes.data.monthlyData || []);
        setSummary(monthlyRes.data.summary || null);
      }
      if (catRes.data?.success) {
        setCategoryData(catRes.data.categories || []);
      }
      if (yearlyRes.data?.success) {
        setYearlyData(yearlyRes.data.yearlyData || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load financial report data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, reportType, showToast]);

  useEffect(() => {
    fetchReports();
    const handleTxUpdate = () => fetchReports();
    window.addEventListener('transaction-updated', handleTxUpdate);
    return () => window.removeEventListener('transaction-updated', handleTxUpdate);
  }, [fetchReports]);

  const handleExportCSV = async () => {
    try {
      const res = await transactionService.getAll({
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        limit: 1000
      });
      if (res.data?.transactions) {
        exportTransactionsToCSV(
          res.data.transactions,
          `expensewise_financial_report_${selectedYear}.csv`
        );
        showToast(`Exported full transaction report for ${selectedYear}`);
      }
    } catch (err) {
      showToast('Failed to export report CSV', 'error');
    }
  };

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((item, index) => (
            <div key={`tip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="font-medium text-slate-500" style={{ color: item.color }}>
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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Yearly and monthly financial trends, savings rates, and category distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Year selector */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 ml-2" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent py-1.5 px-2 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  Financial Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export Report CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Export Report CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Total Income ({selectedYear})</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(summary.totalIncome, currency)}
            </p>
            <span className="text-[10px] text-slate-400">Avg {formatCurrency(summary.avgMonthlyIncome, currency)}/mo</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Total Expenses ({selectedYear})</span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(summary.totalExpenses, currency)}
            </p>
            <span className="text-[10px] text-slate-400">Avg {formatCurrency(summary.avgMonthlyExpense, currency)}/mo</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Net Yearly Savings</span>
            <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {formatCurrency(summary.netSavings, currency)}
            </p>
            <span className="text-[10px] text-slate-400">Income minus expenses</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Savings Rate</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {summary.savingsRate}%
            </p>
            <span className="text-[10px] text-slate-400">Of total income retained</span>
          </div>
        </div>
      )}

      {/* Main Charts: 12-Month Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Month Trend Composed Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Financial Performance ({selectedYear})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Income, expenses, and net savings across all 12 calendar months
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Building charts..." />
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="shortMonth"
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
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 15, fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    name="Net Savings"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3B82F6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Chart */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Category Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">For year {selectedYear}</p>
              </div>

              {/* Type toggle */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <button
                  onClick={() => setReportType('expense')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    reportType === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setReportType('income')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    reportType === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <CategoryChart data={categoryData} height={200} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              {categoryData.length} distinct {reportType} categories recorded
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Detailed Monthly Breakdown ({selectedYear})
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Complete ledger of monthly income, expenditures, savings, and savings ratios.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3 text-right">Income</th>
                <th className="py-3 px-3 text-right">Expenses</th>
                <th className="py-3 px-3 text-right">Net Savings</th>
                <th className="py-3 px-3 text-right">Savings Rate</th>
                <th className="py-3 px-3 text-center">Tx Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {monthlyData.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {m.month}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(m.income, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(m.expenses, currency)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      m.savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(m.savings, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                    {m.savingsRate}%
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">
                    {m.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
