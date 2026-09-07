import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePasswordApi } from '../../api/auth';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    addressLine1: user.address_line1 || '',
    addressLine2: user.address_line2 || '',
    city: user.city || '',
    state: user.state || '',
    postalCode: user.postal_code || '',
    country: user.country || 'India',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwNotice, setPwNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await updateProfile(form);
      setNotice('Profile updated');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwNotice('');
    try {
      await changePasswordApi(pwForm);
      setPwNotice('Password changed');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(extractErrorMessage(err));
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Profile</h1>
      <div className="dashboard-panel">
        <ErrorMessage message={error} />
        {notice && <div className="alert alert-success">{notice}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Address line 1<input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} /></label>
          <label>Address line 2<input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} /></label>
          <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>State<input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
          <label>Postal code<input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></label>
          <label>Country<input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </form>
      </div>

      <div className="dashboard-panel">
        <h2>Change password</h2>
        <ErrorMessage message={pwError} />
        {pwNotice && <div className="alert alert-success">{pwNotice}</div>}
        <form className="form-grid" onSubmit={handlePasswordSubmit}>
          <label>Current password<input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} /></label>
          <label>New password<input type="password" required minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} /></label>
          <button type="submit" className="btn btn-outline">Update password</button>
        </form>
      </div>
    </div>
  );
}
