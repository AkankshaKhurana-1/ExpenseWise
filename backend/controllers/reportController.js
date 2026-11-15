const { Transaction } = require('../models/Transaction');

// @desc    Get monthly income, expense & savings report for a given year
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let yearlyIncome = 0;
    let yearlyExpenses = 0;
    let totalTransactions = 0;

    const monthlyData = monthNames.map((name, index) => {
      const monthNum = index + 1;
      let income = 0;
      let expenses = 0;
      let count = 0;

      transactions.forEach(t => {
        if (t._id.month === monthNum) {
          count += t.count;
          if (t._id.type === 'income') income = t.total;
          if (t._id.type === 'expense') expenses = t.total;
        }
      });

      const savings = income - expenses;
      const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0;

      yearlyIncome += income;
      yearlyExpenses += expenses;
      totalTransactions += count;

      return {
        month: name,
        shortMonth: shortMonthNames[index],
        monthNumber: monthNum,
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        savings: Number(savings.toFixed(2)),
        savingsRate,
        transactionCount: count
      };
    });

    const yearlySavings = yearlyIncome - yearlyExpenses;
    const yearlySavingsRate = yearlyIncome > 0 ? Number(((yearlySavings / yearlyIncome) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      year,
      summary: {
        totalIncome: Number(yearlyIncome.toFixed(2)),
        totalExpenses: Number(yearlyExpenses.toFixed(2)),
        netSavings: Number(yearlySavings.toFixed(2)),
        savingsRate: yearlySavingsRate,
        avgMonthlyIncome: Number((yearlyIncome / 12).toFixed(2)),
        avgMonthlyExpense: Number((yearlyExpenses / 12).toFixed(2)),
        totalTransactions
      },
      monthlyData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get yearly summary report
// @route   GET /api/reports/yearly
// @access  Private
const getYearlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const yearlyAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1 } }
    ]);

    const yearsMap = {};

    yearlyAgg.forEach(item => {
      const yr = item._id.year;
      if (!yearsMap[yr]) {
        yearsMap[yr] = { year: yr, income: 0, expenses: 0, count: 0 };
      }
      yearsMap[yr].count += item.count;
      if (item._id.type === 'income') yearsMap[yr].income = item.total;
      if (item._id.type === 'expense') yearsMap[yr].expenses = item.total;
    });

    const yearlyData = Object.values(yearsMap)
      .map(item => ({
        year: item.year,
        income: Number(item.income.toFixed(2)),
        expenses: Number(item.expenses.toFixed(2)),
        savings: Number((item.income - item.expenses).toFixed(2)),
        savingsRate:
          item.income > 0
            ? Number((((item.income - item.expenses) / item.income) * 100).toFixed(1))
            : 0,
        transactionCount: item.count
      }))
      .sort((a, b) => b.year - a.year);

    res.status(200).json({
      success: true,
      yearlyData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise report
// @route   GET /api/reports/category-wise
// @access  Private
const getCategoryWiseReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'expense', startDate, endDate, year, month } = req.query;

    const matchQuery = {
      userId,
      type: type === 'income' ? 'income' : 'expense'
    };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate && !isNaN(new Date(startDate).getTime())) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchQuery.date.$gte = start;
      }
      if (endDate && !isNaN(new Date(endDate).getTime())) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    } else if (year && month) {
      const yr = parseInt(year, 10);
      const mo = parseInt(month, 10);
      matchQuery.date = {
        $gte: new Date(yr, mo - 1, 1, 0, 0, 0, 0),
        $lte: new Date(yr, mo, 0, 23, 59, 59, 999)
      };
    } else if (year) {
      const yr = parseInt(year, 10);
      matchQuery.date = {
        $gte: new Date(yr, 0, 1, 0, 0, 0, 0),
        $lte: new Date(yr, 11, 31, 23, 59, 59, 999)
      };
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

    const grandTotal = categoryAgg.reduce((sum, item) => sum + item.total, 0);

    const categories = categoryAgg.map(item => ({
      category: item._id,
      amount: Number(item.total.toFixed(2)),
      count: item.count,
      percentage: grandTotal > 0 ? Number(((item.total / grandTotal) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      type: matchQuery.type,
      totalAmount: Number(grandTotal.toFixed(2)),
      categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  getYearlyReport,
  getCategoryWiseReport
};
