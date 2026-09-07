import { useEffect, useState } from 'react';
import { getAllSellersApi } from '../../api/admin';
import { formatDate } from '../../utils/format';
import Loader from '../../components/Loader';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSellersApi().then((res) => setSellers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Sellers</h1>
      <table className="data-table">
        <thead><tr><th>Business</th><th>Owner</th><th>Email</th><th>Onboarding</th><th>Rating</th><th>Joined</th></tr></thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.seller_id}>
              <td>{s.business_name}</td>
              <td>{s.owner_name}</td>
              <td>{s.owner_email}</td>
              <td><span className={`status-badge status-${s.onboarding_status === 'paid' ? 'delivered' : 'placed'}`}>{s.onboarding_status}</span></td>
              <td>{s.rating_avg}</td>
              <td>{formatDate(s.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
