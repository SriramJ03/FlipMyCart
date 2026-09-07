import { useEffect, useState } from 'react';
import { getSalesAnalysisApi } from '../../api/analytics';
import { getAllUsersApi, getAllSellersApi } from '../../api/admin';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';

export default function AdminDashboard() {
  const [sales, setSales] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSalesAnalysisApi(), getAllUsersApi(), getAllSellersApi()])
      .then(([salesRes, usersRes, sellersRes]) => {
        setSales(salesRes.data);
        setUserCount(usersRes.data.length);
        setSellerCount(sellersRes.data.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Admin overview</h1>
      <div className="stat-row">
        <div className="stat-card"><span>{userCount}</span><label>Total users</label></div>
        <div className="stat-card"><span>{sellerCount}</span><label>Sellers</label></div>
        <div className="stat-card"><span>{sales.totalOrders}</span><label>Total orders</label></div>
        <div className="stat-card"><span>{formatCurrency(sales.totalRevenue)}</span><label>Total revenue</label></div>
      </div>

      <div className="dashboard-panel">
        <h2>Revenue by category</h2>
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
