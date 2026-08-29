const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const productService = require('../services/productService');
const { getSellerRowForUser } = require('./sellerController');
const { logActivity } = require('../services/activityService');

const listProducts = asyncHandler(async (req, res) => {
  const { search, categoryId, sellerId, minPrice, maxPrice, inStock, page, limit } = req.query;

  if (search) {
    logActivity({ userId: req.user?.userId, activityType: 'product_search', searchQuery: search }).catch(() => {});
  }
  if (categoryId) {
    logActivity({ userId: req.user?.userId, activityType: 'category_view', categoryId: Number(categoryId) }).catch(() => {});
  }

  const result = await productService.listProducts({ search, categoryId, sellerId, minPrice, maxPrice, inStock, page, limit });
  res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit } });
});

// Seller's own products, including drafts (not exposed via the public listProducts endpoint).
// listProducts() defaults to status='active' unless a status is given, so when the seller
// doesn't filter by a specific status we fetch all three statuses and merge them.
const listMyProducts = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const { search, categoryId, minPrice, maxPrice, page, limit, status } = req.query;

  if (status) {
    const result = await productService.listProducts({ search, categoryId, sellerId: seller.seller_id, minPrice, maxPrice, page, limit, status });
    return res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit } });
  }

  const all = await Promise.all(['active', 'draft', 'inactive'].map((s) =>
    productService.listProducts({ search, categoryId, minPrice, maxPrice, sellerId: seller.seller_id, status: s, limit: 100 })
  ));
  const items = all.flatMap((r) => r.items).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: items, meta: { total: items.length } });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  if (product.status !== 'active') {
    const isOwner = req.user?.role === 'seller' && req.user.userId && (await getSellerRowForUser(req.user.userId).catch(() => null))?.seller_id === product.sellerId;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) throw new ApiError(404, 'Product not found');
  }

  logActivity({ userId: req.user?.userId, activityType: 'product_view', productId: product.productId }).catch(() => {});
  res.json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const { categoryId, name, description, price, stockQuantity, status, attributes } = req.body;

  if (!categoryId || !name || price === undefined) {
    throw new ApiError(400, 'categoryId, name and price are required');
  }

  const product = await productService.createProduct(
    seller.seller_id,
    { categoryId, name, description, price, stockQuantity: stockQuantity || 0, requestedStatus: status || 'draft' },
    attributes || {}
  );
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  const { categoryId, name, description, price, stockQuantity, status, attributes } = req.body;
  const product = await productService.updateProduct(
    req.params.id,
    seller.seller_id,
    { categoryId, name, description, price, stockQuantity, status },
    attributes
  );
  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  let sellerId = null;
  if (!isAdmin) {
    const seller = await getSellerRowForUser(req.user.userId);
    sellerId = seller.seller_id;
  }
  await productService.deleteProduct(req.params.id, sellerId, isAdmin);
  res.json({ success: true, message: 'Product deleted' });
});

const uploadProductMedia = asyncHandler(async (req, res) => {
  const seller = await getSellerRowForUser(req.user.userId);
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded');
  const media = await productService.addMediaFiles(req.params.id, seller.seller_id, req.files);
  res.json({ success: true, data: media });
});

module.exports = { listProducts, listMyProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadProductMedia };
