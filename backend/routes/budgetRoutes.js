const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const budgetRules = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Expense category is required'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Budget amount must be at least 1'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be valid')
];

const updateBudgetRules = [
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Budget amount must be at least 1'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
];

router.use(protect);

router.route('/')
  .post(budgetRules, validate, createBudget)
  .get(getBudgets);

router.route('/:id')
  .put(updateBudgetRules, validate, updateBudget)
  .delete(deleteBudget);

module.exports = router;
