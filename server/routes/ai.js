const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { parseExpense } = require('../controllers/aiController');

const router = express.Router();

// @route   POST /api/ai/parse
// @desc    Parse natural language expense input using Gemini AI
// @access  Private
router.post('/parse', protect, parseExpense);

module.exports = router;
