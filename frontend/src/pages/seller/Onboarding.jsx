import { useEffect, useState } from 'react';
import { getMySellerProfileApi, payOnboardingFeeApi, getOnboardingPaymentsApi } from '../../api/sellers';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Onboarding() {
  const [seller, setSeller] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('mock_card');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getMySellerProfileApi(), getOnboardingPaymentsApi()])
      .then(([sellerRes, paymentsRes]) => {
        setSeller(sellerRes.data);
        setPayments(paymentsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePay = async () => {
    setError('');
    setNotice('');
    setPaying(true);
    try {
      await payOnboardingFeeApi({ method });
      setNotice('Onboarding payment successful! You can now activate products.');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Seller onboarding</h1>
      <div className="dashboard-panel">
        <p>
          FlipMyCart charges <strong>no recurring commission</strong>. Instead, sellers pay a single
          one-time onboarding fee of <strong>{formatCurrency(seller.onboarding_fee)}</strong>. Until this
          is paid, your products remain in <em>draft</em> status and are not visible to buyers.
        </p>
        <p><strong>Current status:</strong> <span className={`status-badge status-${seller.onboarding_status === 'paid' ? 'delivered' : 'placed'}`}>{seller.onboarding_status}</span></p>

        <ErrorMessage message={error} />
        {notice && <div className="alert alert-success">{notice}</div>}

        {seller.onboarding_status !== 'paid' && (
          <div className="onboarding-pay">
            <label>
              Payment method (simulated)
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="mock_card">Mock Card</option>
                <option value="mock_upi">Mock UPI</option>
                <option value="mock_wallet">Mock Wallet</option>
              </select>
            </label>
            <button className="btn btn-primary" disabled={paying} onClick={handlePay}>
              {paying ? 'Processing...' : `Pay ${formatCurrency(seller.onboarding_fee)} (simulated)`}
            </button>
            <p className="form-note">This is a simulated payment for the academic project — no real financial transaction occurs.</p>
          </div>
        )}
      </div>

      <div className="dashboard-panel">
        <h2>Payment history</h2>
        {payments.length === 0 ? (
          <p className="empty-state">No onboarding payment attempts yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.onboarding_payment_id}>
                  <td>{formatDateTime(p.created_at)}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{p.method}</td>
                  <td><span className={`status-badge status-${p.status === 'successful' ? 'delivered' : p.status === 'failed' ? 'cancelled' : 'placed'}`}>{p.status}</span></td>
                  <td>{p.transaction_ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
