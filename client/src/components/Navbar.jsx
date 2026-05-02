import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/add',       label: 'Add Expense', icon: '➕' },
  { to: '/history',   label: 'History', icon: '📋' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          <span className="navbar-logo">💸</span>
          <span className="navbar-title gradient-text">Smart Expense</span>
        </NavLink>

        {/* Navigation */}
        <nav className="navbar-nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              id={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="navbar-user">
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="user-avatar"
            />
          )}
          <span className="user-name">{user?.name?.split(' ')[0]}</span>
          <button
            id="logout-btn"
            className="btn btn-secondary logout-btn"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
