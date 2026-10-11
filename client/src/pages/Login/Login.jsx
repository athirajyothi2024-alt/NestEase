import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid email or password.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'resident') {
        navigate('/resident');
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Your account role is not recognized.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-brand-panel">
          <div className="login-brand">
            <span className="brand-mark">N</span>
            <span>NestEase</span>
          </div>

          <div className="brand-message">
            <span className="brand-eyebrow">WELCOME TO NESTEASE</span>
            <h1>Comfortable living. Simpler management.</h1>
            <p>
              Your home, community updates, payments, and requests — all in one
              place.
            </p>

            <div className="brand-feature">
              <span>✓</span>
              <div>
                <strong>Everything in one place</strong>
                <small>Manage your apartment with ease.</small>
              </div>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <div>
                <strong>Stay connected</strong>
                <small>Keep up with notices and requests.</small>
              </div>
            </div>
          </div>

          <p className="brand-footer">
            A better way to manage community living.
          </p>
        </aside>

        <section className="login-form-panel">
          <div className="login-form-content">
            <div className="login-mobile-brand">
              <span className="brand-mark">N</span>
              <span>NestEase</span>
            </div>

            <div className="login-heading">
              <span className="login-lock-icon">↗</span>
              <h2>Welcome back</h2>
              <p>Sign in to access your NestEase account.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in to NestEase'}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="login-security-note">
              <span>♢</span>
              Your account is protected by secure authentication.
            </div>
          </div>

          <p className="login-bottom-note">
            NestEase · Apartment Management System
          </p>
        </section>
      </section>
    </main>
  );
}

export default Login;
