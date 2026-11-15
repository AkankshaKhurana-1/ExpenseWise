const { Transaction } = require('../models/Transaction');

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions with search, filter, sort & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = { userId: req.user._id };

    // Search by title
    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate && !isNaN(new Date(startDate).getTime())) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate && !isNaN(new Date(endDate).getTime())) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting (with deterministic secondary tie-breaker)
    const sort = {};
    const validSortFields = ['date', 'amount', 'title', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    if (sortField !== '_id') {
      sort['_id'] = sortOrder === 'asc' ? 1 : -1;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
    }

    const { title, amount, type, category, date, description } = req.body;

    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description;

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
