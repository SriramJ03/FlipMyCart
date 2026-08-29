import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const dashboardPathByRole = {
  buyer: '/buyer/dashboard',
  seller: '/seller/dashboard',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', businessName: '', businessDescription: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register({ ...form, role });
      navigate(dashboardPathByRole[data.user.role], { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <ErrorMessage message={error} />

        <div className="role-toggle">
          <button type="button" className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>I'm a buyer</button>
          <button type="button" className={role === 'seller' ? 'active' : ''} onClick={() => setRole('seller')}>I'm a seller</button>
        </div>

        <label>
          Full name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>

        {role === 'seller' && (
          <>
            <label>
              Business name
              <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </label>
            <label>
              Business description
              <textarea rows={3} value={form.businessDescription} onChange={(e) => setForm({ ...form, businessDescription: e.target.value })} />
            </label>
            <p className="form-note">
              After registering, you'll need to pay a one-time onboarding fee before your products can go live (simulated payment).
            </p>
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
