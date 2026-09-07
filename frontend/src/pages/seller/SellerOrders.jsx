import { useEffect, useState } from 'react';
import { getSellerOrdersApi, updateOrderStatusApi } from '../../api/orders';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const nextStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getSellerOrdersApi().then((res) => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId, status) => {
    setError('');
    try {
      await updateOrderStatusApi(orderId, status);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Orders for my products</h1>
      <ErrorMessage message={error} />
      {items.length === 0 ? (
        <p className="empty-state">No orders yet.</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>Order</th><th>Product</th><th>Buyer</th><th>Qty</th><th>Line total</th><th>Placed</th><th>Item status</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.order_item_id}>
                <td>#{item.order_id}</td>
                <td>{item.product_name}</td>
                <td>{item.buyer_name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.line_total)}</td>
                <td>{formatDateTime(item.order_created_at)}</td>
                <td>
                  <select value={item.order_status} onChange={(e) => handleStatusChange(item.order_id, e.target.value)}>
                    {nextStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
