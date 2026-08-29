import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listCategoriesApi } from '../../api/categories';
import { createProductApi, updateProductApi, getProductApi, uploadProductMediaApi } from '../../api/products';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';
import { mediaUrl } from '../../utils/media';

const emptyAttr = () => ({ key: '', value: '' });

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', price: '', stockQuantity: '', status: 'draft' });
  const [attributes, setAttributes] = useState([emptyAttr()]);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    listCategoriesApi().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProductApi(id).then((res) => {
      const p = res.data;
      setForm({
        categoryId: p.categoryId,
        name: p.name,
        description: p.description || '',
        price: p.price,
        stockQuantity: p.stockQuantity,
        status: p.status,
      });
      const attrs = Object.entries(p.specifications || {}).map(([key, value]) => ({
        key,
        value: Array.isArray(value) ? value.join(', ') : String(value),
      }));
      setAttributes(attrs.length ? attrs : [emptyAttr()]);
      setImages(p.media?.images || []);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateAttr = (idx, field, value) => {
    setAttributes((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };
  const addAttrRow = () => setAttributes((prev) => [...prev, emptyAttr()]);
  const removeAttrRow = (idx) => setAttributes((prev) => prev.filter((_, i) => i !== idx));

  const buildAttributesObject = () =>
    attributes.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), attributes: buildAttributesObject() };
      if (isEdit) {
        await updateProductApi(id, payload);
        setNotice('Product updated');
      } else {
        const { data } = await createProductApi(payload);
        navigate(`/seller/products/${data.productId}/edit`, { replace: true });
        return;
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const { data } = await uploadProductMediaApi(id, formData);
      setImages(data.images);
      setFiles([]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>{isEdit ? 'Edit product' : 'Add product'}</h1>
      <ErrorMessage message={error} />
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="dashboard-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Category
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </label>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="span-2">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>Price (INR)<input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label>Stock quantity<input type="number" min="0" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="active">Active (requires paid onboarding)</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="span-2">
            <h3>Specifications (category-specific attributes)</h3>
            <p className="form-note">
              Add whatever attributes make sense for this product's category (e.g. RAM/Battery for
              mobiles, Size/Color/Material for clothing). Stored flexibly in MongoDB.
            </p>
            {attributes.map((attr, idx) => (
              <div className="attr-row" key={idx}>
                <input placeholder="Attribute (e.g. RAM)" value={attr.key} onChange={(e) => updateAttr(idx, 'key', e.target.value)} />
                <input placeholder="Value (e.g. 8GB)" value={attr.value} onChange={(e) => updateAttr(idx, 'value', e.target.value)} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => removeAttrRow(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addAttrRow}>+ Add attribute</button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </form>
      </div>

      {isEdit && (
        <div className="dashboard-panel">
          <h2>Product media</h2>
          {images.length > 0 && (
            <div className="media-preview-grid">
              {images.map((img) => (
                <img key={img.url} src={mediaUrl(img.url)} alt={img.altText} />
              ))}
            </div>
          )}
          <form onSubmit={handleUpload} className="upload-form">
            <input type="file" multiple accept="image/*,video/mp4,video/webm" onChange={(e) => setFiles(Array.from(e.target.files))} />
            <button type="submit" className="btn btn-outline btn-sm" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload images'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
