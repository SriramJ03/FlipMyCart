const { pool } = require('../config/mysql');
const ProductMedia = require('../models/mongodb/ProductMedia');
const ProductSpecification = require('../models/mongodb/ProductSpecification');
const ProductReview = require('../models/mongodb/ProductReview');
const ApiError = require('../utils/ApiError');

/**
 * Cross-database consistency strategy (see docs/PolyglotPersistence.md):
 * MySQL is the source of truth for product_id. We create the MySQL row first,
 * then attempt the MongoDB writes. If any MongoDB write fails, we compensate
 * by deleting whatever Mongo documents were created in this attempt AND the
 * MySQL row, so the operation is atomic from the caller's point of view even
 * though the two databases don't share a transaction.
 */

async function getSellerOnboardingStatus(sellerId) {
  const [rows] = await pool.query('SELECT onboarding_status FROM sellers WHERE seller_id = ?', [sellerId]);
  if (!rows[0]) throw new ApiError(404, 'Seller not found');
  return rows[0].onboarding_status;
}

async function createProduct(sellerId, { categoryId, name, description, price, stockQuantity, requestedStatus }, attributes) {
  const onboardingStatus = await getSellerOnboardingStatus(sellerId);
  // Business rule: a product can only be 'active' if the seller has paid the one-time onboarding fee.
  const status = requestedStatus === 'active' && onboardingStatus === 'paid' ? 'active' : 'draft';

  const [result] = await pool.query(
    `INSERT INTO products (seller_id, category_id, name, description, price, stock_quantity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sellerId, categoryId, name, description, price, stockQuantity, status]
  );
  const productId = result.insertId;

  try {
    const [category] = await pool.query('SELECT slug FROM categories WHERE category_id = ?', [categoryId]);
    await ProductSpecification.create({
      productId,
      categorySlug: category[0]?.slug || 'general',
      attributes: attributes || {},
    });
    await ProductMedia.create({ productId, images: [], videos: [] });
  } catch (mongoErr) {
    // Compensating action: undo the partially created Mongo docs, then the MySQL row.
    await ProductSpecification.deleteOne({ productId }).catch(() => {});
    await ProductMedia.deleteOne({ productId }).catch(() => {});
    await pool.query('DELETE FROM products WHERE product_id = ?', [productId]).catch(() => {});
    throw new ApiError(500, 'Failed to create product specifications/media, product creation rolled back', mongoErr.message);
  }

  return getProductById(productId);
}

async function updateProduct(productId, sellerId, updates, attributes) {
  const [existingRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
  const existing = existingRows[0];
  if (!existing) throw new ApiError(404, 'Product not found');
  if (existing.seller_id !== sellerId) throw new ApiError(403, 'You do not own this product');

  let status = existing.status;
  if (updates.status && updates.status !== existing.status) {
    if (updates.status === 'active') {
      const onboardingStatus = await getSellerOnboardingStatus(sellerId);
      if (onboardingStatus !== 'paid') {
        throw new ApiError(403, 'Complete seller onboarding payment before activating products');
      }
    }
    status = updates.status;
  }

  const fields = {
    category_id: updates.categoryId ?? existing.category_id,
    name: updates.name ?? existing.name,
    description: updates.description ?? existing.description,
    price: updates.price ?? existing.price,
    stock_quantity: updates.stockQuantity ?? existing.stock_quantity,
    status,
  };

  await pool.query(
    `UPDATE products SET category_id=?, name=?, description=?, price=?, stock_quantity=?, status=? WHERE product_id=?`,
    [fields.category_id, fields.name, fields.description, fields.price, fields.stock_quantity, fields.status, productId]
  );

  if (attributes) {
    const [category] = await pool.query('SELECT slug FROM categories WHERE category_id = ?', [fields.category_id]);
    await ProductSpecification.findOneAndUpdate(
      { productId },
      { productId, categorySlug: category[0]?.slug || 'general', attributes },
      { upsert: true, new: true }
    );
  }

  return getProductById(productId);
}

async function deleteProduct(productId, sellerId, isAdmin = false) {
  const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
  const product = rows[0];
  if (!product) throw new ApiError(404, 'Product not found');
  if (!isAdmin && product.seller_id !== sellerId) throw new ApiError(403, 'You do not own this product');

  // Delete Mongo documents first, then the MySQL row (see docs/PolyglotPersistence.md).
  await ProductMedia.deleteOne({ productId }).catch((e) => console.error('[productService] media cleanup failed:', e.message));
  await ProductSpecification.deleteOne({ productId }).catch((e) => console.error('[productService] spec cleanup failed:', e.message));
  await ProductReview.deleteMany({ productId }).catch((e) => console.error('[productService] review cleanup failed:', e.message));
  await pool.query('DELETE FROM products WHERE product_id = ?', [productId]);
  return { productId };
}

async function addMediaFiles(productId, sellerId, files) {
  const [rows] = await pool.query('SELECT seller_id FROM products WHERE product_id = ?', [productId]);
  if (!rows[0]) throw new ApiError(404, 'Product not found');
  if (rows[0].seller_id !== sellerId) throw new ApiError(403, 'You do not own this product');

  const images = files.map((f, idx) => ({
    url: `/uploads/products/${f.filename}`,
    altText: f.originalname,
    isPrimary: idx === 0,
    sortOrder: idx,
  }));

  const media = await ProductMedia.findOneAndUpdate(
    { productId },
    { $push: { images: { $each: images } } },
    { upsert: true, new: true }
  );
  return media;
}

function mergeProduct(sqlRow, media, spec) {
  return {
    productId: sqlRow.product_id,
    sellerId: sqlRow.seller_id,
    categoryId: sqlRow.category_id,
    categoryName: sqlRow.category_name,
    sellerName: sqlRow.business_name,
    name: sqlRow.name,
    description: sqlRow.description,
    price: Number(sqlRow.price),
    stockQuantity: sqlRow.stock_quantity,
    status: sqlRow.status,
    createdAt: sqlRow.created_at,
    updatedAt: sqlRow.updated_at,
    media: media ? { images: media.images, videos: media.videos } : { images: [], videos: [] },
    specifications: spec ? spec.attributes : {},
  };
}

async function getProductById(productId) {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, s.business_name
     FROM products p
     JOIN categories c ON c.category_id = p.category_id
     JOIN sellers s ON s.seller_id = p.seller_id
     WHERE p.product_id = ?`,
    [productId]
  );
  if (!rows[0]) throw new ApiError(404, 'Product not found');

  const [media, spec] = await Promise.all([
    ProductMedia.findOne({ productId }).lean(),
    ProductSpecification.findOne({ productId }).lean(),
  ]);

  return mergeProduct(rows[0], media, spec);
}

async function listProducts({ search, categoryId, sellerId, minPrice, maxPrice, status, inStock, page = 1, limit = 20 }) {
  const where = [];
  const params = [];

  if (status) {
    where.push('p.status = ?');
    params.push(status);
  } else {
    where.push("p.status = 'active'");
  }
  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    where.push('p.category_id = ?');
    params.push(categoryId);
  }
  if (sellerId) {
    where.push('p.seller_id = ?');
    params.push(sellerId);
  }
  if (minPrice) {
    where.push('p.price >= ?');
    params.push(minPrice);
  }
  if (maxPrice) {
    where.push('p.price <= ?');
    params.push(maxPrice);
  }
  if (inStock === 'true') {
    where.push('p.stock_quantity > 0');
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, s.business_name
     FROM products p
     JOIN categories c ON c.category_id = p.category_id
     JOIN sellers s ON s.seller_id = p.seller_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
    params
  );

  const productIds = rows.map((r) => r.product_id);
  const mediaDocs = await ProductMedia.find({ productId: { $in: productIds } }).lean();
  const mediaMap = new Map(mediaDocs.map((m) => [m.productId, m]));

  const items = rows.map((r) => mergeProduct(r, mediaMap.get(r.product_id), null));

  return { items, total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  addMediaFiles,
  getProductById,
  listProducts,
  getSellerOnboardingStatus,
};
