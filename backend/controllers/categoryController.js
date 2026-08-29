const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY name');
  res.json({ success: true, data: rows });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) throw new ApiError(400, 'name and slug are required');
  const [result] = await pool.query('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, description || null]);
  const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: rows[0] });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, isActive } = req.body;
  const [existing] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'Category not found');
  await pool.query(
    'UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = ?, is_active = COALESCE(?, is_active) WHERE category_id = ?',
    [name ?? null, slug ?? null, description ?? existing[0].description, isActive === undefined ? null : Number(isActive), req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const [existing] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'Category not found');
  await pool.query('UPDATE categories SET is_active = 0 WHERE category_id = ?', [req.params.id]);
  res.json({ success: true, message: 'Category deactivated' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
