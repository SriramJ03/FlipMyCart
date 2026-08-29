import { useEffect, useState } from 'react';
import { getSellerPerformanceApi, getSalesAnalysisApi } from '../../api/analytics';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';

export default function SalesAnalytics() {
  const { user } = useAuth();
  const [myPerformance, setMyPerformance] = useState(null);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSellerPerformanceApi(), getSalesAnalysisApi()])
      .then(([perfRes, salesRes]) => {
        setMyPerformance(perfRes.data.find((s) => s.seller_id === user.sellerId) || null);
        setSales(salesRes.data);
      })
      .finally(() => setLoading(false));
  }, [user.sellerId]);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Sales analytics</h1>

      {myPerformance && (
        <div className="stat-row">
          <div className="stat-card"><span>{myPerformance.order_count}</span><label>My orders</label></div>
          <div className="stat-card"><span>{myPerformance.units_sold}</span><label>My units sold</label></div>
          <div className="stat-card"><span>{formatCurrency(myPerformance.total_revenue)}</span><label>My revenue</label></div>
        </div>
      )}

      <div className="dashboard-panel">
        <h2>Platform best-selling products</h2>
        <table className="data-table">
          <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {sales.bestSellingProducts.map((p) => (
              <tr key={p.product_id}><td>{p.product_name}</td><td>{p.units_sold}</td><td>{formatCurrency(p.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-panel">
        <h2>Category-wise sales (platform)</h2>
        <table className="data-table">
          <thead><tr><th>Category</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {sales.categorySales.map((c) => (
              <tr key={c.category}><td>{c.category}</td><td>{c.units_sold}</td><td>{formatCurrency(c.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
