const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats,
} = require('../controllers/expenseController');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET  /api/expenses/stats
router.get('/stats', getStats);

// @route   GET  /api/expenses
// @route   POST /api/expenses
router.route('/').get(getExpenses).post(createExpense);

// @route   PUT    /api/expenses/:id
// @route   DELETE /api/expenses/:id
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;
