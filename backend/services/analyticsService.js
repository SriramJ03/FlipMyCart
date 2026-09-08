const { pool } = require('../config/mysql');
const ProductReview = require('../models/mongodb/ProductReview');
const UserActivity = require('../models/mongodb/UserActivity');
const OlistOrder = require('../models/mongodb/OlistOrder');
const OlistProduct = require('../models/mongodb/OlistProduct');
const OlistSeller = require('../models/mongodb/OlistSeller');
const OlistCustomer = require('../models/mongodb/OlistCustomer');
const OlistReview = require('../models/mongodb/OlistReview');

const OLIST_SALE_MATCH = { status: { $nin: ['canceled', 'unavailable'] } };

/* ---------------------------- 1. Sales analysis (MongoDB / Olist) --------------------------- */
async function salesAnalysis() {
  const [totals] = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    { $group: { _id: null, totalOrders: { $addToSet: '$_id' }, totalRevenue: { $sum: '$items.price' }, productsSold: { $sum: 1 } } },
    { $project: { _id: 0, totalOrders: { $size: '$totalOrders' }, totalRevenue: 1, productsSold: 1 } },
  ]);

  const monthlyTrend = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$purchaseTimestamp' } },
      orderIds: { $addToSet: '$_id' },
      revenue: { $sum: '$items.price' },
    } },
    { $project: { _id: 0, month: '$_id', orderCount: { $size: '$orderIds' }, revenue: 1 } },
    { $sort: { month: 1 } },
  ]);

  const bestSellingProducts = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', unitsSold: { $sum: 1 }, revenue: { $sum: '$items.price' }, category: { $first: '$items.productCategoryEnglish' } } },
    { $sort: { unitsSold: -1, revenue: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, productId: '$_id', unitsSold: 1, revenue: 1, category: 1 } },
  ]);

  const categorySales = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    { $group: { _id: '$items.productCategoryEnglish', unitsSold: { $sum: 1 }, revenue: { $sum: '$items.price' } } },
    { $sort: { revenue: -1 } },
    { $project: { _id: 0, category: '$_id', unitsSold: 1, revenue: 1 } },
  ]);

  return {
    source: 'Olist Brazilian E-Commerce Public Dataset',
    currency: 'BRL',
    totalOrders: totals?.totalOrders || 0,
    totalRevenue: Number(totals?.totalRevenue || 0),
    productsSold: totals?.productsSold || 0,
    monthlyTrend: monthlyTrend.map((r) => ({ ...r, revenue: Number(r.revenue) })),
    bestSellingProducts: bestSellingProducts.map((r) => ({ ...r, revenue: Number(r.revenue) })),
    categorySales: categorySales.map((r) => ({ ...r, revenue: Number(r.revenue) })),
  };
}

/* ------------------------ 2. Seller performance (MongoDB / Olist) --------------------------- */
async function sellerPerformance() {
  const rows = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    { $group: {
      _id: '$items.sellerId',
      orderIds: { $addToSet: '$_id' },
      unitsSold: { $sum: 1 },
      totalRevenue: { $sum: '$items.price' },
    } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 15 },
    { $lookup: { from: 'olistsellers', localField: '_id', foreignField: 'sellerId', as: 'seller' } },
    { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
    { $project: {
      _id: 0,
      sellerId: '$_id',
      orderCount: { $size: '$orderIds' },
      unitsSold: 1,
      totalRevenue: 1,
      city: '$seller.location.city',
      state: '$seller.location.state',
    } },
  ]);

  const totalSellers = await OlistSeller.countDocuments();
  return {
    source: 'Olist Brazilian E-Commerce Public Dataset',
    totalSellers,
    rows: rows.map((r) => ({ ...r, totalRevenue: Number(r.totalRevenue) })),
  };
}

/* --------------------- 3. Product analysis (MongoDB / Olist) ---------------------- */
async function mostViewedProducts() {
  const rows = await UserActivity.aggregate([
    {
      $match: {
        activityType: 'product_view',
        productId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$productId',
        views: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $sort: {
        views: -1
      }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        views: 1,
        uniqueUsers: {
          $size: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $ne: ['$$user', null] }
            }
          }
        }
      }
    }
  ]);

  if (!rows.length) return [];

  const productIds = rows.map((r) => r.productId);

  const [products] = await pool.query(
    `
      SELECT
        p.product_id AS productId,
        p.name,
        c.name AS category
      FROM products p
      LEFT JOIN categories c
        ON c.category_id = p.category_id
      WHERE p.product_id IN (?)
    `,
    [productIds]
  );

  const productMap = new Map(
    products.map((p) => [Number(p.productId), p])
  );

  return rows.map((r) => ({
    ...r,
    name: productMap.get(Number(r.productId))?.name || `Product ${r.productId}`,
    category: productMap.get(Number(r.productId))?.category || '-'
  }));
}


async function activityAnalytics() {
  // --------------------------------------------------
  // Most searched products / keywords
  // --------------------------------------------------
  const mostSearched = await UserActivity.aggregate([
    {
      $match: {
        activityType: 'product_search',
        searchQuery: {
          $exists: true,
          $nin: [null, '']
        }
      }
    },
    {
      $project: {
        searchQuery: {
          $toLower: {
            $trim: {
              input: '$searchQuery'
            }
          }
        },
        userId: 1
      }
    },
    {
      $match: {
        searchQuery: {
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: '$searchQuery',
        searches: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $sort: {
        searches: -1
      }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        query: '$_id',
        searches: 1,
        uniqueUsers: {
          $size: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $ne: ['$$user', null] }
            }
          }
        }
      }
    }
  ]);


  // --------------------------------------------------
  // Most viewed categories
  // --------------------------------------------------
  const mostViewedCategoriesRaw = await UserActivity.aggregate([
    {
      $match: {
        activityType: 'category_view',
        categoryId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$categoryId',
        views: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $sort: {
        views: -1
      }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        views: 1,
        uniqueUsers: {
          $size: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $ne: ['$$user', null] }
            }
          }
        }
      }
    }
  ]);


  // Get category names from MySQL
  let mostViewedCategories = [];

  if (mostViewedCategoriesRaw.length) {
    const categoryIds = mostViewedCategoriesRaw.map(
      (r) => r.categoryId
    );

    const [categories] = await pool.query(
      `
        SELECT
          category_id AS categoryId,
          name
        FROM categories
        WHERE category_id IN (?)
      `,
      [categoryIds]
    );

    const categoryMap = new Map(
      categories.map((c) => [Number(c.categoryId), c.name])
    );

    mostViewedCategories = mostViewedCategoriesRaw.map((r) => ({
      ...r,
      name:
        categoryMap.get(Number(r.categoryId)) ||
        `Category ${r.categoryId}`
    }));
  }


  // --------------------------------------------------
  // Activity type summary
  // --------------------------------------------------
  const activityByType = await UserActivity.aggregate([
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $project: {
        _id: 0,
        activityType: '$_id',
        count: 1,
        uniqueUsers: {
          $size: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $ne: ['$$user', null] }
            }
          }
        }
      }
    }
  ]);

  const totalEvents = activityByType.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  return {
    totalEvents,
    mostSearched,
    mostViewedCategories,
    activityByType
  };
}
async function productAnalysis() {
  const mostPurchased = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        timesPurchased: { $sum: 1 },
        revenue: { $sum: '$items.price' },
        category: { $first: '$items.productCategoryEnglish' }
      }
    },
    { $sort: { timesPurchased: -1, revenue: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        timesPurchased: 1,
        revenue: 1,
        category: 1
      }
    }
  ]);


  const ratings = await OlistReview.aggregate([
    {
      $group: {
        _id: '$orderId',
        avgRating: { $avg: '$reviewScore' },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'olistorders',
        localField: '_id',
        foreignField: 'orderId',
        as: 'order'
      }
    },
    { $unwind: '$order' },
    {
      $match: {
        $expr: {
          $eq: [{ $size: '$order.items' }, 1]
        }
      }
    },
    { $unwind: '$order.items' },
    {
      $group: {
        _id: '$order.items.productId',
        avgRating: { $avg: '$avgRating' },
        reviewCount: { $sum: '$reviewCount' },
        category: {
          $first: '$order.items.productCategoryEnglish'
        }
      }
    },
    { $sort: { avgRating: -1, reviewCount: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        avgRating: { $round: ['$avgRating', 2] },
        reviewCount: 1,
        category: 1
      }
    }
  ]);


  const lowestRated = await OlistReview.aggregate([
    {
      $group: {
        _id: '$orderId',
        avgRating: { $avg: '$reviewScore' },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'olistorders',
        localField: '_id',
        foreignField: 'orderId',
        as: 'order'
      }
    },
    { $unwind: '$order' },
    {
      $match: {
        $expr: {
          $eq: [{ $size: '$order.items' }, 1]
        }
      }
    },
    { $unwind: '$order.items' },
    {
      $group: {
        _id: '$order.items.productId',
        avgRating: { $avg: '$avgRating' },
        reviewCount: { $sum: '$reviewCount' },
        category: {
          $first: '$order.items.productCategoryEnglish'
        }
      }
    },
    { $sort: { avgRating: 1, reviewCount: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        avgRating: { $round: ['$avgRating', 2] },
        reviewCount: 1,
        category: 1
      }
    }
  ]);


  // NEW: FlipMyCart product views
  const mostViewed = await mostViewedProducts();

  const totalProducts = await OlistProduct.countDocuments();

  return {
    source:
      'Olist Brazilian E-Commerce Public Dataset + FlipMyCart UserActivity',

    totalProducts,

    mostPurchased: mostPurchased.map((r) => ({
      ...r,
      revenue: Number(r.revenue)
    })),

    mostViewed,

    highestRated: ratings,

    lowestRated,

    note:
      'Purchase and rating analysis uses Olist. Product view analysis uses FlipMyCart MongoDB UserActivity.'
  };
}

/* --------------------- 4. Customer behaviour (MongoDB / Olist) ----------------------- */
async function customerBehaviour() {
  const [summary] = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    {
      $group: {
        _id: '$customerUniqueId',
        orders: { $sum: 1 },
        spent: { $sum: { $sum: '$items.price' } }
      }
    },
    {
      $group: {
        _id: null,
        uniqueCustomers: { $sum: 1 },
        repeatCustomers: {
          $sum: {
            $cond: [{ $gt: ['$orders', 1] }, 1, 0]
          }
        },
        totalCustomerOrders: { $sum: '$orders' },
        totalSpent: { $sum: '$spent' }
      }
    }
  ]);


  const topCategories = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productCategoryEnglish',
        purchases: { $sum: 1 },
        revenue: { $sum: '$items.price' }
      }
    },
    { $sort: { purchases: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        category: '$_id',
        purchases: 1,
        revenue: 1
      }
    }
  ]);


  const paymentMethods = await OlistOrder.aggregate([
    { $match: OLIST_SALE_MATCH },
    { $unwind: '$payments' },
    {
      $group: {
        _id: '$payments.type',
        transactions: { $sum: 1 },
        value: { $sum: '$payments.value' }
      }
    },
    { $sort: { value: -1 } },
    {
      $project: {
        _id: 0,
        method: '$_id',
        transactions: 1,
        value: 1
      }
    }
  ]);


  // NEW: actual FlipMyCart user activity
  const activity = await activityAnalytics();

  const uniqueCustomers = summary?.uniqueCustomers || 0;

  return {
    source:
      'Olist Brazilian E-Commerce Public Dataset + FlipMyCart UserActivity',

    totalCustomers: uniqueCustomers,

    returningCustomers: summary?.repeatCustomers || 0,

    returningCustomerRate: uniqueCustomers
      ? Number(
          (
            (summary.repeatCustomers / uniqueCustomers) *
            100
          ).toFixed(2)
        )
      : 0,

    averageOrdersPerCustomer: uniqueCustomers
      ? Number(
          (
            summary.totalCustomerOrders /
            uniqueCustomers
          ).toFixed(2)
        )
      : 0,

    topCategories: topCategories.map((r) => ({
      ...r,
      revenue: Number(r.revenue)
    })),

    paymentMethods: paymentMethods.map((r) => ({
      ...r,
      value: Number(r.value)
    })),

    // NEW
    activity,

    note:
      'Purchase behaviour uses Olist. Search, product-view and category-view behaviour uses FlipMyCart MongoDB UserActivity.'
  };
}

/* -------------------------- 5. Inventory analysis (FlipMyCart / MySQL) ------------------------- */
async function inventoryAnalysis(lowStockThreshold = 10) {
  const [lowStock] = await pool.query(
    `SELECT product_id, name, stock_quantity, seller_id FROM products WHERE stock_quantity > 0 AND stock_quantity <= ? AND status = 'active' ORDER BY stock_quantity ASC`,
    [lowStockThreshold]
  );
  const [outOfStock] = await pool.query(
    `SELECT product_id, name, seller_id FROM products WHERE stock_quantity = 0 AND status = 'active'`
  );
  const [[availability]] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN status='active' AND stock_quantity > 0 THEN stock_quantity ELSE 0 END),0) AS available_units,
       COALESCE(SUM(CASE WHEN status='active' AND stock_quantity = 0 THEN 1 ELSE 0 END),0) AS out_of_stock,
       COALESCE(SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END),0) AS draft,
       COUNT(*) AS total_products
     FROM products`
  );

  return { source: 'FlipMyCart transactional MySQL database', lowStock, outOfStock, availability };
}

module.exports = { salesAnalysis, sellerPerformance, productAnalysis, customerBehaviour, inventoryAnalysis };
