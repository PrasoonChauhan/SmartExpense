import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import './History.css';

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

const CATEGORY_EMOJI = {
  Food: '🍔', Travel: '✈️', Bills: '💡', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚', Other: '📦',
};

// Fallback emoji for custom categories
const getCategoryEmoji = (cat) => CATEGORY_EMOJI[cat] || '🏷️';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function History() {
  const { expenses, loading, fetchExpenses, deleteExpense, updateExpense, pagination } = useExpense();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ category: 'All', startDate: '', endDate: '', page: 1 });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const params = {};
    if (filters.category !== 'All') params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    params.page = filters.page;
    params.limit = 15;
    fetchExpenses(params);
  }, [filters]);

  // Client-side search filter
  const displayed = search.trim()
    ? expenses.filter(
        (e) =>
          e.product.toLowerCase().includes(search.toLowerCase()) ||
          e.description?.toLowerCase().includes(search.toLowerCase())
      )
    : expenses;

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    const knownCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];
    const isKnown = knownCategories.includes(expense.category);
    setEditForm({
      product: expense.product,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      category: isKnown ? expense.category : 'Other',
      notes: expense.notes || '',
    });
    setEditCustomCategory(isKnown ? '' : expense.category);
  };

  const handleEditSave = async (id) => {
    const finalCategory =
      editForm.category === 'Other' && editCustomCategory.trim()
        ? editCustomCategory.trim()
        : editForm.category;
    await updateExpense(id, { ...editForm, category: finalCategory });
    setEditingId(null);
    setEditCustomCategory('');
  };

  return (
    <div className="page-container">
      <div className="hist-header animate-fadeInUp">
        <div>
          <h1 className="page-title">Expense History</h1>
          <p>{pagination.total} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          ➕ Add Expense
        </button>
      </div>

      {/* Filters bar */}
      <div className="filters-bar glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="history-search"
            type="text"
            className="search-input"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="cat-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              type="button"
              className={`filter-chip ${filters.category === cat ? 'filter-chip-active' : ''}`}
              onClick={() => setFilters((f) => ({ ...f, category: cat, page: 1 }))}
            >
              {cat !== 'All' && getCategoryEmoji(cat)} {cat}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="date-filters">
          <input
            id="filter-start-date"
            type="date"
            className="input-field date-input"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value, page: 1 }))}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
          <input
            id="filter-end-date"
            type="date"
            className="input-field date-input"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value, page: 1 }))}
          />
          {(filters.startDate || filters.endDate) && (
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              onClick={() => setFilters((f) => ({ ...f, startDate: '', endDate: '', page: 1 }))}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expense list */}
      <div className="expense-list animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
          ))
        ) : displayed.length === 0 ? (
          <div className="empty-history glass-card">
            <span style={{ fontSize: '3rem' }}>📭</span>
            <p>No expenses found</p>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              Add your first expense
            </button>
          </div>
        ) : (
          displayed.map((expense) => (
            <div key={expense._id} className="expense-row glass-card">
              {editingId === expense._id ? (
                /* ── Edit mode ── */
                <div className="edit-form">
                  <div className="edit-row">
                    <input
                      className="input-field"
                      value={editForm.product}
                      onChange={(e) => setEditForm((f) => ({ ...f, product: e.target.value }))}
                      placeholder="Product"
                    />
                    <input
                      type="number"
                      className="input-field"
                      value={editForm.amount}
                      onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="Amount"
                    />
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.date}
                      onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                    />
                    <select
                      className="input-field"
                      value={editForm.category}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, category: e.target.value }));
                        if (e.target.value !== 'Other') setEditCustomCategory('');
                      }}
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {editForm.category === 'Other' && (
                      <input
                        type="text"
                        className="input-field"
                        value={editCustomCategory}
                        onChange={(e) => setEditCustomCategory(e.target.value)}
                        placeholder="Custom category..."
                        autoFocus
                      />
                    )}
                  </div>
                  <div className="edit-actions">
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleEditSave(expense._id)}>Save</button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="expense-view">
                  <div className={`exp-cat-badge badge badge-${expense.category}`}>
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="exp-info">
                    <span className="exp-product">{expense.product}</span>
                    <span className="exp-meta">
                      {fmtDate(expense.date)}
                      {expense.description && (
                        <span className="exp-desc"> · "{expense.description}"</span>
                      )}
                    </span>
                    {expense.notes && (
                      <span className="exp-notes">📝 {expense.notes}</span>
                    )}
                  </div>
                  <div className="exp-right">
                    <span className="exp-amount">{fmt(expense.amount)}</span>
                    <span className={`badge badge-${expense.category}`}>{expense.category}</span>
                  </div>
                  <div className="exp-actions">
                    <button
                      id={`edit-${expense._id}`}
                      className="btn btn-icon"
                      onClick={() => startEdit(expense)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      id={`delete-${expense._id}`}
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDelete(expense._id)}
                      disabled={deletingId === expense._id}
                      title="Delete"
                    >
                      {deletingId === expense._id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              id={`page-${i + 1}`}
              className={`page-btn ${filters.page === i + 1 ? 'page-btn-active' : ''}`}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
