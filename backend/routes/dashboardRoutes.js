const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getMonthlyOverview,
  getCategoryBreakdown,
  getRecentTransactions
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/monthly-overview', getMonthlyOverview);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/recent-transactions', getRecentTransactions);

module.exports = router;
