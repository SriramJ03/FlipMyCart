import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerDashboardApi } from '../../api/sellers';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerDashboardApi().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const { seller, products, orders } = data;

  return (
    <div className="dashboard-page">
      <h1>{seller.business_name}</h1>

      {seller.onboarding_status !== 'paid' && (
        <div className="alert alert-warning">
          Onboarding payment is pending. Your products stay in <strong>draft</strong> until you{' '}
          <Link to="/seller/onboarding">complete the one-time onboarding payment</Link>.
        </div>
      )}

      <div className="stat-row">
        <div className="stat-card"><span>{products.total_products}</span><label>Total products</label></div>
        <div className="stat-card"><span>{products.active_products}</span><label>Active products</label></div>
        <div className="stat-card"><span>{products.draft_products}</span><label>Draft products</label></div>
        <div className="stat-card"><span>{products.out_of_stock}</span><label>Out of stock</label></div>
      </div>

      <div className="stat-row">
        <div className="stat-card"><span>{orders.order_count}</span><label>Orders</label></div>
        <div className="stat-card"><span>{orders.units_sold}</span><label>Units sold</label></div>
        <div className="stat-card"><span>{formatCurrency(orders.total_revenue)}</span><label>Total revenue</label></div>
      </div>

      <p className="form-note">FlipMyCart charges no commission on this revenue — only the one-time onboarding fee.</p>
    </div>
  );
}
