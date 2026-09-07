import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const dashboardPathByRole = {
  buyer: '/buyer/dashboard',
  seller: '/seller/dashboard',
  admin: '/admin/dashboard',
  support: '/support/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || dashboardPathByRole[data.user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Log in to FlipMyCart</h1>
        <ErrorMessage message={error} />
        <label>
          Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-hint">
          Seed accounts (password <code>Password123!</code>): admin@flipmycart.com, seller1@flipmycart.com, buyer1@flipmycart.com, support1@flipmycart.com
        </p>
      </form>
    </div>
  );
}
