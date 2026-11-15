const mongoose = require('mongoose');

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];
const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent',
  'Transportation',
  'Other'
];

const ALL_CATEGORIES = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      validate: {
        validator: function (val) {
          if (this.type === 'income') {
            return INCOME_CATEGORIES.includes(val);
          } else if (this.type === 'expense') {
            return EXPENSE_CATEGORIES.includes(val);
          }
          return ALL_CATEGORIES.includes(val);
        },
        message: props => `${props.value} is not a valid category for this transaction type`
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, date: -1, type: 1 });

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES
};
