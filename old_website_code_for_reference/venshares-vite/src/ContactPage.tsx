import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<number | null>(null);

  const COOLDOWN_MS = 30000; // 30 seconds

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) return 'Name is required.';
    if (form.name.length > 100) return 'Name must be 100 characters or less.';
    if (!emailRegex.test(form.email)) return 'Please enter a valid email address.';
    if (!form.message.trim()) return 'Message is required.';
    if (form.message.length > 1000) return 'Message must be 1000 characters or less.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check cooldown
    const now = Date.now();
    if (lastSubmission && now - lastSubmission < COOLDOWN_MS) {
      setError(`Please wait ${Math.ceil((COOLDOWN_MS - (now - lastSubmission)) / 1000)} seconds before submitting again.`);
      return;
    }

    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL || 'https://qtrozwdslfwzltbywzxk.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Contact-Form-Key': import.meta.env.VITE_CONTACT_FORM_KEY,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setLastSubmission(now);
      } else {
        setError(data.details || data.error || 'Failed to send your message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
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
        <h2 className="login-title">CONTACT US</h2>
        <div className="login-card">
          <p className="mb-4 text-center">
            Please enter your contact information below.<br />
            We will have a team member respond as soon as possible.
          </p>
          {submitted ? (
            <div className="login-message success text-center">
              Thank you for contacting us! We will respond soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="name" className="login-label">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="login-input"
                disabled={loading}
              />
              <label htmlFor="email" className="login-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="login-input"
                disabled={loading}
              />
              <label htmlFor="message" className="login-label">Message</label>
              <textarea
                id="message"
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                className="login-input"
                rows={4}
                disabled={loading}
              />
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {error && (
                <div className="login-message error text-center" style={{ color: 'red', marginTop: '10px' }}>
                  {error}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}