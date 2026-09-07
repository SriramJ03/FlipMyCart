const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const serverOrigin = apiBase.replace(/\/api\/?$/, '');

// Product image URLs are either absolute (seed data uses placeholder URLs) or
// server-relative (uploaded files, e.g. "/uploads/products/xyz.jpg").
export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${serverOrigin}${path}`;
}
