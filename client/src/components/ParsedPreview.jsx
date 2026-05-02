import { useState } from 'react';
import './ParsedPreview.css';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

const CATEGORY_EMOJI = {
  Food: '🍔', Travel: '✈️', Bills: '💡', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚', Other: '📦',
};

export default function ParsedPreview({ data, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    product: data.product || '',
    amount:  data.amount  || '',
    date:    data.date    || new Date().toISOString().split('T')[0],
    category: data.category || 'Other',
    notes: '',
  });
  const [customCategory, setCustomCategory] = useState(
    !CATEGORIES.includes(data.category) ? data.category : ''
  );

  const isOther = form.category === 'Other';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryClick = (cat) => {
    handleChange('category', cat);
    if (cat !== 'Other') setCustomCategory('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product.trim() || !form.amount) return;
    const finalCategory = isOther && customCategory.trim()
      ? customCategory.trim()
      : form.category;
    onSave({ ...form, category: finalCategory });
  };

  return (
    <div className="preview-overlay animate-fadeIn">
      <div className="preview-card glass-card animate-fadeInUp">
        {/* Header */}
        <div className="preview-header">
          <div className="preview-title-wrap">
            <div className="preview-ai-badge">
              <span>✨</span> AI Parsed
            </div>
            <h3 className="preview-title">Review & Save</h3>
            <p className="preview-subtitle">Edit any field before saving</p>
          </div>
          <button
            id="preview-close-btn"
            type="button"
            className="btn btn-icon"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="preview-form">
          {/* Product */}
          <div className="form-group">
            <label className="input-label" htmlFor="prev-product">Product / Item</label>
            <input
              id="prev-product"
              type="text"
              className="input-field"
              value={form.product}
              onChange={(e) => handleChange('product', e.target.value)}
              placeholder="What did you spend on?"
              required
            />
          </div>

          {/* Amount + Date (side by side) */}
          <div className="preview-row">
            <div className="form-group">
              <label className="input-label" htmlFor="prev-amount">Amount (₹)</label>
              <input
                id="prev-amount"
                type="number"
                className="input-field"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label" htmlFor="prev-date">Date</label>
              <input
                id="prev-date"
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="input-label">Category</label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`cat-${cat.toLowerCase()}`}
                  className={`cat-chip ${form.category === cat ? 'cat-chip-active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span>{CATEGORY_EMOJI[cat]}</span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
            {isOther && (
              <div className="custom-category-wrap">
                <input
                  id="custom-category-input"
                  type="text"
                  className="input-field"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Gym, Rent, Salary..."
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="input-label" htmlFor="prev-notes">Notes (optional)</label>
            <input
              id="prev-notes"
              type="text"
              className="input-field"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional details..."
            />
          </div>

          {/* Actions */}
          <div className="preview-actions">
            <button
              id="preview-cancel-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              id="preview-save-btn"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-sm" />
                  Saving...
                </>
              ) : (
                <>💾 Save Expense</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
