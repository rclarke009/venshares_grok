import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import Footer from './components/Footer'; // adjust path if needed

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const confirmed = params.get('confirmed');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, password });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(`✅ Logged in as ${data.user.email}`);
      localStorage.setItem('authToken', data.session?.access_token ?? '');

      // Insert or upsert user details into your users table
      const { id, email, user_metadata } = data.user;
      try {
        const { error: upsertError } = await supabase
          .from('users')
          .upsert([
            {
              id,
              email,
              username: user_metadata.username,
              first_name: user_metadata.first_name,
              last_name: user_metadata.last_name,
              phone_number: user_metadata.phone_number,
              date_of_birth: user_metadata.date_of_birth,
              ssn_last_four: user_metadata.ssn_last_four,
              ein: user_metadata.ein,
            }
          ], { onConflict: 'id' });

        if (upsertError) {
          // Show a non-blocking warning
          setMessage(prev => prev + ' ⚠️ (Profile not fully saved. Please contact support if this continues.)');
          // Optionally log to console or error tracking
          console.error('User upsert error:', upsertError.message);
        }
      } catch (err) {
        setMessage(prev => prev + ' ⚠️ (Unexpected error saving profile.)');
        console.error('Unexpected upsert error:', err);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">VENSHARES</div>
        <nav className="nav">
          <Link to="/" className="nav-btn">HOME</Link>
            <Link to="/contact" className="nav-btn">CONTACT US</Link>
          <Link to="/login" className="nav-btn">LOGIN/JOIN</Link>
        </nav>
      </header>
      <div className="login-banner-bg" />
      <div className="login-page-container">
        <h2 className="login-title">LOGIN</h2>
        <div className="login-card">
          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
            />
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'LOG IN'}
            </button>
            {message && (
              <div className={`login-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                {message.startsWith('❌') && <span className="error-icon">✗</span>}
                {message.replace(/^✅ |^❌ /, '')}
              </div>
            )}
          </form>
          <div className="login-links">
            <div>
              Need to register?{' '}
              <Link to="/register" className="login-link-btn">Click here</Link>
            </div>
            <div className="login-help">
              Need help logging in?{' '}
              <Link to="/reset-password" className="login-link">Click here</Link>
            </div>
          </div>
          {confirmed && <div className="success-message">Your email is confirmed! Please log in.</div>}
        </div>
      </div>
      <Footer />
    </>
  );
}