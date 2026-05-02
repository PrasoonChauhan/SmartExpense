import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import ExpensePieChart from '../components/Charts/PieChart';
import ExpenseBarChart from '../components/Charts/BarChart';
import './Dashboard.css';

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

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, fetchStats, loading } = useExpense();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const monthChange = stats
    ? stats.lastMonth > 0
      ? (((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100).toFixed(1)
      : null
    : null;

  const topCategory = stats?.byCategory?.[0];

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div className="dash-header animate-fadeInUp">
        <div>
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p>Here's your spending overview.</p>
        </div>
        <button
          id="dash-add-btn"
          className="btn btn-primary"
          onClick={() => navigate('/add')}
        >
          ➕ Add Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="summary-grid animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="summary-card glass-card">
          <div className="summary-icon summary-icon-purple">💰</div>
          <div className="summary-info">
            <span className="summary-label">Total Spent</span>
            <span className="summary-value">{loading ? '—' : fmt(stats?.total || 0)}</span>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon summary-icon-cyan">📅</div>
          <div className="summary-info">
            <span className="summary-label">This Month</span>
            <span className="summary-value">{loading ? '—' : fmt(stats?.thisMonth || 0)}</span>
            {monthChange !== null && (
              <span className={`summary-change ${parseFloat(monthChange) > 0 ? 'change-up' : 'change-down'}`}>
                {parseFloat(monthChange) > 0 ? '▲' : '▼'} {Math.abs(monthChange)}% vs last month
              </span>
            )}
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon summary-icon-green">📊</div>
          <div className="summary-info">
            <span className="summary-label">Last Month</span>
            <span className="summary-value">{loading ? '—' : fmt(stats?.lastMonth || 0)}</span>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon summary-icon-orange">🏆</div>
          <div className="summary-info">
            <span className="summary-label">Top Category</span>
            <span className="summary-value">
              {loading ? '—' : topCategory ? `${getCategoryEmoji(topCategory.category)} ${topCategory.category}` : '—'}
            </span>
            {topCategory && (
              <span className="summary-change" style={{ color: 'var(--text-muted)' }}>
                {fmt(topCategory.total)} · {topCategory.count} transactions
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-grid animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {/* Pie chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3 className="chart-title">Spending by Category</h3>
            <span className="chart-badge">All Time</span>
          </div>
          {loading ? (
            <div className="chart-skeleton skeleton" style={{ height: 280 }} />
          ) : stats?.byCategory?.length > 0 ? (
            <ExpensePieChart data={stats.byCategory} />
          ) : (
            <EmptyChart message="No expenses yet" />
          )}
        </div>

        {/* Bar chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Trend</h3>
            <span className="chart-badge">Last 6 Months</span>
          </div>
          {loading ? (
            <div className="chart-skeleton skeleton" style={{ height: 280 }} />
          ) : stats?.monthlyTrend?.length > 0 ? (
            <ExpenseBarChart data={stats.monthlyTrend} />
          ) : (
            <EmptyChart message="Not enough data yet" />
          )}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="recent-card glass-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        <div className="recent-header">
          <h3 className="chart-title">Recent Transactions</h3>
          <button
            id="view-all-btn"
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            onClick={() => navigate('/history')}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
            ))}
          </div>
        ) : stats?.recent?.length > 0 ? (
          <div className="recent-list">
            {stats.recent.map((expense) => (
              <div key={expense._id} className="recent-item">
                <div className={`recent-cat-icon badge badge-${expense.category}`}>
                  {getCategoryEmoji(expense.category)}
                </div>
                <div className="recent-info">
                  <span className="recent-product">{expense.product}</span>
                  <span className="recent-date">{fmtDate(expense.date)}</span>
                </div>
                <div className="recent-right">
                  <span className="recent-amount">{fmt(expense.amount)}</span>
                  <span className={`badge badge-${expense.category}`}>{expense.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-recent">
            <p>No expenses yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              Add your first expense →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="empty-chart">
      <span style={{ fontSize: '2.5rem' }}>📭</span>
      <p>{message}</p>
    </div>
  );
}
