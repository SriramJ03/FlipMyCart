import { useEffect, useState } from 'react';
import { listCategoriesApi, createCategoryApi, deleteCategoryApi } from '../../api/categories';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    listCategoriesApi().then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCategoryApi({ ...form, slug: slugify(form.name) });
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    setError('');
    try {
      await deleteCategoryApi(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Categories</h1>
      <div className="dashboard-panel">
        <h2>Add category</h2>
        <ErrorMessage message={error} />
        <form className="form-grid" onSubmit={handleCreate}>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Add category</button>
        </form>
      </div>

      <div className="dashboard-panel">
        {loading ? <Loader /> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th /></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.category_id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.description}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => handleDelete(c.category_id)}>Deactivate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
