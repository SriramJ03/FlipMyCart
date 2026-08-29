import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMySellerProfileApi, updateMySellerProfileApi } from '../../api/sellers';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function SellerProfile() {
  const { user, updateProfile } = useAuth();
  const [seller, setSeller] = useState(null);
  const [userForm, setUserForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [sellerForm, setSellerForm] = useState({ businessName: '', businessDescription: '', gstNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getMySellerProfileApi().then((res) => {
      setSeller(res.data);
      setSellerForm({
        businessName: res.data.business_name,
        businessDescription: res.data.business_description || '',
        gstNumber: res.data.gst_number || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await updateProfile(userForm);
      setNotice('Account details updated');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const { data } = await updateMySellerProfileApi(sellerForm);
      setSeller(data);
      setNotice('Business details updated');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Seller profile</h1>
      <ErrorMessage message={error} />
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="dashboard-panel">
        <h2>Account</h2>
        <form className="form-grid" onSubmit={handleUserSubmit}>
          <label>Name<input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>Phone<input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Save account</button>
        </form>
      </div>

      <div className="dashboard-panel">
        <h2>Business details</h2>
        <p><strong>Onboarding status:</strong> {seller.onboarding_status}</p>
        <p><strong>Rating:</strong> {seller.rating_avg} / 5</p>
        <form className="form-grid" onSubmit={handleSellerSubmit}>
          <label>Business name<input value={sellerForm.businessName} onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })} /></label>
          <label>GST number<input value={sellerForm.gstNumber} onChange={(e) => setSellerForm({ ...sellerForm, gstNumber: e.target.value })} /></label>
          <label className="span-2">Description<textarea rows={3} value={sellerForm.businessDescription} onChange={(e) => setSellerForm({ ...sellerForm, businessDescription: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Save business details</button>
        </form>
      </div>
    </div>
  );
}
