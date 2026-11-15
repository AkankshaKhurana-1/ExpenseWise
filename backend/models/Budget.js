const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('./Transaction');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: 'Budget category must be a valid expense category'
      }
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be at least 1']
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate budgets for the same user, category, month and year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
