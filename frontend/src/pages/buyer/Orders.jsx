import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../../api/orders';
import { formatCurrency, formatDate } from '../../utils/format';
import Loader from '../../components/Loader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>My orders</h1>
      {orders.length === 0 ? (
        <p className="empty-state">No orders yet. <Link to="/products">Start shopping</Link>.</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Status</th><th>Total</th><th /></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>{formatDate(o.created_at)}</td>
                <td>{o.items.length}</td>
                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                <td>{formatCurrency(o.total_amount)}</td>
                <td><Link to={`/buyer/orders/${o.order_id}`} className="btn btn-outline btn-sm">Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
