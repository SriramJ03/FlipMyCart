import { useEffect, useState } from 'react';
import { getAllUsersApi, setUserActiveStatusApi, createStaffUserApi } from '../../api/admin';
import { formatDate } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'support', phone: '' });

  const load = () => {
    setLoading(true);
    getAllUsersApi(roleFilter ? { role: roleFilter } : {}).then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);

  const handleToggleActive = async (user) => {
    setError('');
    try {
      await setUserActiveStatusApi(user.user_id, !user.is_active);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await createStaffUserApi(staffForm);
      setNotice(`${staffForm.role} account created`);
      setStaffForm({ name: '', email: '', password: '', role: 'support', phone: '' });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Users</h1>

      <div className="dashboard-panel">
        <h2>Create admin / support account</h2>
        <p className="form-note">Admin and support accounts cannot be created through public registration - only here.</p>
        <ErrorMessage message={error} />
        {notice && <div className="alert alert-success">{notice}</div>}
        <form className="form-grid" onSubmit={handleCreateStaff}>
          <label>Name<input required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></label>
          <label>Email<input type="email" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></label>
          <label>Password<input type="password" required minLength={6} value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></label>
          <label>
            Role
            <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
              <option value="support">Support</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Create account</button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>All users</h2>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
          </select>
        </div>
        {loading ? <Loader /> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>{u.is_active ? 'Active' : 'Deactivated'}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => handleToggleActive(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
