const Expense = require('../models/Expense');

// ── Get All Expenses ───────────────────────────────────────────────────────────
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Create Expense ─────────────────────────────────────────────────────────────
const createExpense = async (req, res) => {
  try {
    const { description, product, amount, date, category, rawVoiceText, notes } = req.body;

    if (!product || amount === undefined) {
      return res.status(400).json({ message: 'Product and amount are required' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      description: description || '',
      product,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      category: category || 'Other',
      rawVoiceText: rawVoiceText || '',
      notes: notes || '',
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Update Expense ─────────────────────────────────────────────────────────────
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { product, amount, date, category, description, notes } = req.body;

    if (product !== undefined) expense.product = product;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (date !== undefined) expense.date = new Date(date);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Delete Expense ─────────────────────────────────────────────────────────────
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Dashboard Stats ────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total all time
    const totalResult = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // This month total
    const thisMonthResult = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Last month total
    const lastMonthResult = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // By category (all time)
    const byCategory = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent 5 expenses
    const recent = await Expense.find({ userId }).sort({ date: -1 }).limit(5);

    res.json({
      total: totalResult[0]?.total || 0,
      thisMonth: thisMonthResult[0]?.total || 0,
      lastMonth: lastMonthResult[0]?.total || 0,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
      })),
      monthlyTrend: monthlyTrend.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        total: m.total,
        count: m.count,
      })),
      recent,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getStats };
