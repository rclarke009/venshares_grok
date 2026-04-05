import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Link } from 'react-router-dom';
import Footer from './components/Footer'; // adjust path if needed

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    ssn_last_four: '',
    ein: ''
  });

  const [message, setMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  let emailCheckCooldown = false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Debounced email checker
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      checkEmailExists(form.email);
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [form.email]);

  const checkEmailExists = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (emailCheckCooldown) {
      setEmailStatus('⚠️ Please wait a moment before checking again.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });

    if (error) {
      if (error.message.includes('For security purposes')) {
        emailCheckCooldown = true;
        setTimeout(() => { emailCheckCooldown = false }, 20000);
        setEmailStatus('⚠️ Please wait 20 seconds before checking again.');
      } else {
        setEmailStatus('');
      }
    } else {
      setEmailStatus('⚠️ This email is already registered.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          phone_number: form.phone_number || null,
          date_of_birth: form.date_of_birth || null,
          ssn_last_four: form.ssn_last_four,
          ein: form.ein
        }
      }
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Registered! Please check your email to confirm.');
    }
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
        <h2 className="login-title">REGISTER</h2>
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username" className="login-label">Username</label>
            <input name="username" id="username" placeholder="Username" required value={form.username} onChange={handleChange} className="login-input" />

            <label htmlFor="first_name" className="login-label">First Name</label>
            <input name="first_name" id="first_name" placeholder="First Name" required value={form.first_name} onChange={handleChange} className="login-input" />

            <label htmlFor="last_name" className="login-label">Last Name</label>
            <input name="last_name" id="last_name" placeholder="Last Name" required value={form.last_name} onChange={handleChange} className="login-input" />

            <label htmlFor="email" className="login-label">Email</label>
            <input name="email" id="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="login-input" />
            {emailStatus && <div className="text-sm mb-2 text-gray-600">{emailStatus}</div>}

            <label htmlFor="password" className="login-label">Password</label>
            <input name="password" id="password" type="password" placeholder="Password (min 6 characters)" required minLength={6} value={form.password} onChange={handleChange} className="login-input" />

            <label htmlFor="phone_number" className="login-label">Phone Number (optional)</label>
            <input name="phone_number" id="phone_number" placeholder="Phone Number (optional)" value={form.phone_number} onChange={handleChange} className="login-input" />

            <label htmlFor="date_of_birth" className="login-label">Date of Birth</label>
            <input name="date_of_birth" id="date_of_birth" type="date" placeholder="Date of Birth" value={form.date_of_birth} onChange={handleChange} className="login-input" />

            <label htmlFor="ssn_last_four" className="login-label">Last 4 of SSN</label>
            <input name="ssn_last_four" id="ssn_last_four" placeholder="Last 4 of SSN" maxLength={4} pattern="\d{4}" value={form.ssn_last_four} onChange={handleChange} className="login-input" />

            <label htmlFor="ein" className="login-label">EIN (optional)</label>
            <input name="ein" id="ein" placeholder="EIN (optional)" value={form.ein} onChange={handleChange} className="login-input" />

            <button type="submit" className="login-btn">Register</button>
          </form>

          {message && (
            <div className={`login-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
              {message.startsWith('❌') && <span className="error-icon">✗</span>}
              {message.replace(/^✅ |^❌ /, '')}
            </div>
          )}

          <div className="login-links">
            <span>
              Already have an account?{' '}
              <Link to="/login" className="login-link-btn">Log in</Link>
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}