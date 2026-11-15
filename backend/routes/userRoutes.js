const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency preference'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark')
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateProfileRules, validate, updateUserProfile);
router.put('/change-password', changePasswordRules, validate, changePassword);

module.exports = router;
