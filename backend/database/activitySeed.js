require('dotenv').config();

const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const UserActivity = require('../models/mongodb/UserActivity');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipmycart';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('[seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[seed] MongoDB connected');

    console.log('[seed] Reading FlipMyCart data from MySQL...');

  const [users] = await pool.query(`
  SELECT user_id AS userId
  FROM users
  WHERE role = 'buyer'
  LIMIT 20
`);

   const [products] = await pool.query(`
  SELECT product_id AS productId,
         category_id AS categoryId
  FROM products
  WHERE status = 'active'
  LIMIT 30
`);

const [categories] = await pool.query(`
  SELECT category_id AS categoryId
  FROM categories
  LIMIT 15
`);

    if (!users.length || !products.length || !categories.length) {
      throw new Error(
        'Required users, products, or categories were not found in MySQL.'
      );
    }

    console.log(
      `[seed] Found ${users.length} buyers, ${products.length} products, ${categories.length} categories`
    );

    // Remove only activities created by this seed script.
    await UserActivity.deleteMany({
      'metadata.source': 'activity-seed',
    });

    const activities = [];

    const searchQueries = [
      'laptop',
      'phone',
      'headphones',
      'cotton shirt',
      'shoes',
      'cookware',
      'kettle',
      'lamp',
      'book',
      'smartwatch',
    ];

    const activityTypes = [
      'product_view',
      'product_search',
      'category_view',
      'wishlist_add',
      'cart_add',
    ];

    // Generate 500 activity events.
    for (let i = 0; i < 500; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product =
        products[Math.floor(Math.random() * products.length)];
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      const activityType =
        activityTypes[Math.floor(Math.random() * activityTypes.length)];

      let productId = null;
      let categoryId = null;
      let searchQuery = null;

      if (activityType === 'product_view') {
        productId = product.productId;
      }

      if (activityType === 'product_search') {
        searchQuery =
          searchQueries[Math.floor(Math.random() * searchQueries.length)];

        categoryId = product.categoryId || null;
      }

      if (activityType === 'category_view') {
        categoryId = category.categoryId;
      }

      if (activityType === 'wishlist_add') {
        productId = product.productId;
      }

      if (activityType === 'cart_add') {
        productId = product.productId;
      }

      activities.push({
        userId: user.userId,
        activityType,
        productId,
        categoryId,
        searchQuery,
        metadata: {
          source: 'activity-seed',
          synthetic: true,
        },
      });
    }

    await UserActivity.insertMany(activities);

    console.log(
      `[seed] Inserted ${activities.length} synthetic UserActivity records`
    );

    const counts = await UserActivity.aggregate([
      {
        $match: {
          'metadata.source': 'activity-seed',
        },
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    console.log('\n[seed] Activity summary:');

    counts.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\n[seed] Activity data created successfully.');
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    await mongoose.disconnect();
  }
}

main();