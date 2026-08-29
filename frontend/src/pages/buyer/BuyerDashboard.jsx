import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyOrdersApi } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/format';
import Loader from '../../components/Loader';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  const recentOrders = orders.slice(0, 5);
  const totalSpent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user.name.split(' ')[0]}</h1>

      <div className="stat-row">
        <div className="stat-card"><span>{orders.length}</span><label>Total orders</label></div>
        <div className="stat-card"><span>{formatCurrency(totalSpent)}</span><label>Total spent</label></div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Recent orders</h2>
          <Link to="/buyer/orders">View all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : recentOrders.length === 0 ? (
          <p className="empty-state">You haven't placed any orders yet. <Link to="/products">Start shopping</Link>.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.order_id}>
                  <td><Link to={`/buyer/orders/${o.order_id}`}>#{o.order_id}</Link></td>
                  <td>{formatDate(o.created_at)}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td>{formatCurrency(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
