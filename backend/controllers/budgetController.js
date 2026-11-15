const Budget = require('../models/Budget');
const { Transaction } = require('../models/Transaction');

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Check duplicate
    const existingBudget = await Budget.findOne({
      userId: req.user._id,
      category,
      month: currentMonth,
      year: currentYear
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `A budget for category "${category}" already exists for ${currentMonth}/${currentYear}. You can edit it instead.`
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount: Number(amount),
      month: currentMonth,
      year: currentYear
    });

    res.status(201).json({
      success: true,
      message: 'Budget set successfully',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets for a specific month and year with calculated spending & remaining
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Month date boundaries
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year
    }).sort({ category: 1 });

    // Aggregate expenses for the given month grouped by category
    const categoryExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const expenseMap = {};
    categoryExpenses.forEach(item => {
      expenseMap[item._id] = item.totalSpent;
    });

    let totalBudgetAmount = 0;
    let totalSpentInBudgets = 0;

    const enrichedBudgets = budgets.map(b => {
      const spent = expenseMap[b.category] || 0;
      const remaining = Number((b.amount - spent).toFixed(2));
      const percentage = b.amount > 0 ? Number(((spent / b.amount) * 100).toFixed(1)) : 0;
      const isWarning = percentage >= 80 && percentage <= 100;
      const isExceeded = percentage > 100;

      totalBudgetAmount += b.amount;
      totalSpentInBudgets += spent;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        isWarning,
        isExceeded,
        createdAt: b.createdAt
      };
    });

    // Also get all expenses for the month to show total monthly expenses
    const totalMonthExpensesAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalMonthExpenses = totalMonthExpensesAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalBudget: Number(totalBudgetAmount.toFixed(2)),
        totalSpentInBudgets: Number(totalSpentInBudgets.toFixed(2)),
        totalMonthExpenses: Number(totalMonthExpenses.toFixed(2)),
        remaining: Number((totalBudgetAmount - totalSpentInBudgets).toFixed(2)),
        overallPercentage:
          totalBudgetAmount > 0
            ? Number(((totalSpentInBudgets / totalBudgetAmount) * 100).toFixed(1))
            : 0
      },
      budgets: enrichedBudgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized'
      });
    }

    const { amount, category } = req.body;

    if (category && category !== budget.category) {
      // Check if another budget already has this category
      const existing = await Budget.findOne({
        userId: req.user._id,
        category,
        month: budget.month,
        year: budget.year,
        _id: { $ne: budget._id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A budget for category "${category}" already exists for this month.`
        });
      }
      budget.category = category;
    }

    if (amount !== undefined) {
      budget.amount = Number(amount);
    }

    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
};
