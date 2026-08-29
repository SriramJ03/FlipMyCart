import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderApi, updateOrderStatusApi } from '../../api/orders';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getOrderApi(id).then((res) => setOrder(res.data)).catch((err) => setError(extractErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    setError('');
    try {
      await updateOrderStatusApi(id, 'cancelled');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;
  if (!order) return <ErrorMessage message={error || 'Order not found'} />;

  return (
    <div className="dashboard-page">
      <h1>Order #{order.order_id}</h1>
      <ErrorMessage message={error} />
      <div className="dashboard-panel">
        <p><strong>Status:</strong> <span className={`status-badge status-${order.status}`}>{order.status}</span></p>
        <p><strong>Placed:</strong> {formatDateTime(order.created_at)}</p>
        <p><strong>Shipping address:</strong> {order.shipping_address}</p>
        <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>

        {['placed', 'processing'].includes(order.status) && (
          <button className="btn btn-outline btn-sm" onClick={handleCancel}>Cancel order</button>
        )}
      </div>

      <div className="dashboard-panel">
        <h2>Items</h2>
        <table className="data-table">
          <thead><tr><th>Product</th><th>Unit price</th><th>Qty</th><th>Line total</th><th>Status</th></tr></thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.order_item_id}>
                <td>{item.product_name}</td>
                <td>{formatCurrency(item.unit_price)}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.line_total)}</td>
                <td><span className={`status-badge status-${item.item_status}`}>{item.item_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-panel">
        <h2>Payment</h2>
        {order.payments.map((p) => (
          <p key={p.payment_id}>
            {formatCurrency(p.amount)} via {p.method} — <span className={`status-badge status-${p.status}`}>{p.status}</span>
            {' '}(ref: {p.transaction_ref})
          </p>
        ))}
      </div>
    </div>
  );
}
