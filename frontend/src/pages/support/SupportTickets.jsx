import { useEffect, useState } from 'react';
import { getAllTicketsApi, assignTicketApi, updateTicketStatusApi } from '../../api/support';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const statuses = ['open', 'in_progress', 'resolved', 'closed'];

export default function SupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesDraft, setNotesDraft] = useState({});

  const load = () => {
    setLoading(true);
    getAllTicketsApi(statusFilter ? { status: statusFilter } : {}).then((res) => setTickets(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleAssignToMe = async (ticketId) => {
    setError('');
    try {
      await assignTicketApi(ticketId, user.userId);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    setError('');
    try {
      await updateTicketStatusApi(ticketId, { status, resolutionNotes: notesDraft[ticketId] });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-panel-header">
        <h1>Support tickets</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <ErrorMessage message={error} />
      {tickets.length === 0 ? (
        <p className="empty-state">No tickets found.</p>
      ) : (
        <div className="ticket-list">
          {tickets.map((t) => (
            <div key={t.ticket_id} className="ticket-card">
              <div className="ticket-card-header">
                <h3>{t.subject}</h3>
                <span className={`status-badge status-${t.status}`}>{t.status}</span>
              </div>
              <p className="ticket-meta">From {t.user_name} ({t.user_email}) — {t.category} — priority: {t.priority} — {formatDateTime(t.created_at)}</p>
              <p>{t.description}</p>
              <p className="ticket-meta">Assigned to: {t.assignee_name || 'Unassigned'}</p>

              <div className="ticket-actions">
                {!t.assigned_to && <button className="btn btn-outline btn-sm" onClick={() => handleAssignToMe(t.ticket_id)}>Assign to me</button>}
                <textarea
                  rows={2}
                  placeholder="Resolution notes"
                  value={notesDraft[t.ticket_id] ?? t.resolution_notes ?? ''}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [t.ticket_id]: e.target.value })}
                />
                <select defaultValue={t.status} onChange={(e) => handleStatusChange(t.ticket_id, e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
