import { useAuth } from '../context/AuthContext';
import './Login.css';

const FEATURES = [
  { icon: '🎤', title: 'Voice & Text Input', desc: 'Add expenses naturally by speaking or typing' },
  { icon: '🤖', title: 'AI-Powered Parsing', desc: 'Gemini AI auto-extracts product, amount, date & category' },
  { icon: '📊', title: 'Smart Dashboard', desc: 'Beautiful charts to understand your spending habits' },
  { icon: '✏️', title: 'Always Editable', desc: 'Review and correct AI results before saving' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="login-root">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-container">
        {/* Left panel */}
        <div className="login-left animate-fadeInUp">
          <div className="brand">
            <div className="brand-icon">💸</div>
            <div>
              <h1 className="brand-name gradient-text">Smart Expense</h1>
              <p className="brand-tagline">Track smarter, spend better.</p>
            </div>
          </div>

          <p className="login-description">
            The AI-powered expense tracker that understands your natural language.
            Just say <em>"Spent ₹450 on pizza yesterday"</em> and let the magic happen.
          </p>

          <button id="google-login-btn" className="google-btn" onClick={loginWithGoogle}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="login-note">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Right panel — feature cards */}
        <div className="login-right">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card glass-card animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="demo-pill">
            <span className="demo-dot" />
            AI processes your expense in under 1 second
          </div>
        </div>
      </div>
    </div>
  );
}
