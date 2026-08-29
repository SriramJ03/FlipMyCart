import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTicketsApi } from '../../api/support';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTicketsApi().then((res) => setTickets(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const assignedToMe = tickets.filter((t) => t.assigned_to === user.userId).length;

  return (
    <div className="dashboard-page">
      <h1>Support overview</h1>
      <div className="stat-row">
        <div className="stat-card"><span>{tickets.length}</span><label>Total tickets</label></div>
        <div className="stat-card"><span>{open}</span><label>Open</label></div>
        <div className="stat-card"><span>{inProgress}</span><label>In progress</label></div>
        <div className="stat-card"><span>{assignedToMe}</span><label>Assigned to me</label></div>
      </div>
      <Link to="/support/tickets" className="btn btn-primary btn-sm">View all tickets</Link>
    </div>
  );
}
