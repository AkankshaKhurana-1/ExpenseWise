const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getYearlyReport,
  getCategoryWiseReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/category-wise', getCategoryWiseReport);

module.exports = router;
