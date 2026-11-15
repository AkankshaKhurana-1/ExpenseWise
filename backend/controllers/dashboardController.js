const { Transaction } = require('../models/Transaction');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Current month boundaries
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Previous month boundaries
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. All-time aggregation
    const allTimeAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    allTimeAgg.forEach(item => {
      transactionCount += item.count;
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const totalBalance = totalIncome - totalExpenses;

    // 2. Current month aggregation
    const currentMonthAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let thisMonthIncome = 0;
    let thisMonthExpenses = 0;

    currentMonthAgg.forEach(item => {
      if (item._id === 'income') thisMonthIncome = item.total;
      if (item._id === 'expense') thisMonthExpenses = item.total;
    });

    const monthlySavings = thisMonthIncome - thisMonthExpenses;

    // 3. Previous month aggregation for trend calculation
    const prevMonthAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let prevMonthIncome = 0;
    let prevMonthExpenses = 0;

    prevMonthAgg.forEach(item => {
      if (item._id === 'income') prevMonthIncome = item.total;
      if (item._id === 'expense') prevMonthExpenses = item.total;
    });

    const prevMonthSavings = prevMonthIncome - prevMonthExpenses;

    // Calculate percentage changes (using absolute previous value for correct directionality)
    const calculatePctChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
    };

    res.status(200).json({
      success: true,
      summary: {
        totalBalance: Number(totalBalance.toFixed(2)),
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        monthlySavings: Number(monthlySavings.toFixed(2)),
        thisMonthIncome: Number(thisMonthIncome.toFixed(2)),
        thisMonthExpenses: Number(thisMonthExpenses.toFixed(2)),
        prevMonthIncome: Number(prevMonthIncome.toFixed(2)),
        prevMonthExpenses: Number(prevMonthExpenses.toFixed(2)),
        prevMonthSavings: Number(prevMonthSavings.toFixed(2)),
        incomeChangePct: calculatePctChange(thisMonthIncome, prevMonthIncome),
        expenseChangePct: calculatePctChange(thisMonthExpenses, prevMonthExpenses),
        savingsChangePct: calculatePctChange(monthlySavings, prevMonthSavings),
        transactionCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly income vs expense financial trends (last 6 months)
// @route   GET /api/dashboard/monthly-overview
// @access  Private
const getMonthlyOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Compute last 6 months list
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      months.push({
        label: `${monthNames[monthIndex]} ${year}`,
        shortMonth: monthNames[monthIndex],
        monthIndex,
        year,
        startDate,
        endDate
      });
    }

    const sixMonthsAgo = months[0].startDate;
    const windowEnd = months[months.length - 1].endDate;

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo, $lte: windowEnd }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const result = months.map(m => {
      const monthNum = m.monthIndex + 1; // 1-12
      let income = 0;
      let expenses = 0;

      transactions.forEach(t => {
        if (t._id.year === m.year && t._id.month === monthNum) {
          if (t._id.type === 'income') income = t.total;
          if (t._id.type === 'expense') expenses = t.total;
        }
      });

      return {
        month: m.shortMonth,
        fullLabel: m.label,
        year: m.year,
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        savings: Number((income - expenses).toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      monthlyOverview: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense breakdown by category (pie/donut chart)
// @route   GET /api/dashboard/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    let matchQuery = { userId, type: 'expense' };

    // If allTime flag not set, default to given month/year
    if (req.query.allTime !== 'true') {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    const categoryAgg = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpense = categoryAgg.reduce((sum, item) => sum + item.total, 0);

    const breakdown = categoryAgg.map(item => ({
      category: item._id,
      amount: Number(item.total.toFixed(2)),
      count: item.count,
      percentage: totalExpense > 0 ? Number(((item.total / totalExpense) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      month,
      year,
      totalExpense: Number(totalExpense.toFixed(2)),
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest 5 recent transactions
// @route   GET /api/dashboard/recent-transactions
// @access  Private
const getRecentTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyOverview,
  getCategoryBreakdown,
  getRecentTransactions
};
