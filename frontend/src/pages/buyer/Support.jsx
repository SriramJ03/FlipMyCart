import { useEffect, useState } from 'react';
import { createTicketApi, getMyTicketsApi } from '../../api/support';
import { formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const categories = ['order', 'payment', 'product', 'seller', 'account', 'other'];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', description: '', category: 'order', priority: 'medium' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    getMyTicketsApi().then((res) => setTickets(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await createTicketApi(form);
      setForm({ subject: '', description: '', category: 'order', priority: 'medium' });
      setNotice('Support ticket created');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Support</h1>

      <div className="dashboard-panel">
        <h2>Raise a ticket</h2>
        <ErrorMessage message={error} />
        {notice && <div className="alert alert-success">{notice}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
          <label>
            Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="span-2">Description<textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Submit ticket</button>
        </form>
      </div>

      <div className="dashboard-panel">
        <h2>My tickets</h2>
        {loading ? <Loader /> : tickets.length === 0 ? (
          <p className="empty-state">No support tickets yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.ticket_id}>
                  <td>{t.subject}</td>
                  <td>{t.category}</td>
                  <td>{t.priority}</td>
                  <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
                  <td>{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
