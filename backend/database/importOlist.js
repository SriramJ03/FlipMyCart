/**
 * Import the real Olist Brazilian e-commerce dataset into MongoDB.
 *
 * Usage (from backend/):
 *   node database/importOlist.js "C:\\path\\to\\olist"
 *
 * The importer deliberately uses separate `olist*` MongoDB collections so
 * the existing FlipMyCart application collections are not overwritten.
 * Olist is the primary analytics dataset for the NoSQL assignment.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

const OlistOrder = require('../models/mongodb/OlistOrder');
const OlistProduct = require('../models/mongodb/OlistProduct');
const OlistSeller = require('../models/mongodb/OlistSeller');
const OlistCustomer = require('../models/mongodb/OlistCustomer');
const OlistReview = require('../models/mongodb/OlistReview');

const BATCH_SIZE = 500;

function parseCsvRecord(record) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < record.length; i += 1) {
    const ch = record[i];
    if (ch === '"') {
      if (quoted && record[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      out.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

async function* csvRows(file) {
  const input = fs.createReadStream(file, { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  let headers = null;
  let record = '';
  let inQuotes = false;

  for await (const line of rl) {
    record += (record ? '\n' : '') + line;
    for (let i = 0; i < line.length; i += 1) {
      if (line[i] !== '"') continue;
      if (line[i + 1] === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    }
    if (inQuotes) continue;

    const values = parseCsvRecord(record);
    if (!headers) {
      headers = values;
    } else {
      const row = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
      yield row;
    }
    record = '';
  }
}

function clean(v) {
  return v === '' || v === undefined ? null : v;
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function date(v) {
  const x = clean(v);
  return x ? new Date(x) : null;
}
function file(base, name) {
  const p = path.join(base, name);
  if (!fs.existsSync(p)) throw new Error(`Missing file: ${p}`);
  return p;
}

async function readCategoryMap(base) {
  const map = new Map();
  for await (const row of csvRows(file(base, 'product_category_name_translation.csv'))) {
    if (row.product_category_name) map.set(row.product_category_name, row.product_category_name_english);
  }
  return map;
}

async function readProducts(base, categoryMap) {
  const map = new Map();
  let batch = [];
  for await (const row of csvRows(file(base, 'olist_products_dataset.csv'))) {
    const category = clean(row.product_category_name);
    const doc = {
      productId: row.product_id,
      category,
      categoryEnglish: categoryMap.get(category) || category || 'unknown',
      attributes: {
        nameLength: num(row.product_name_lenght),
        descriptionLength: num(row.product_description_lenght),
        photosQuantity: num(row.product_photos_qty),
        weightGrams: num(row.product_weight_g),
        dimensionsCm: {
          length: num(row.product_length_cm),
          height: num(row.product_height_cm),
          width: num(row.product_width_cm),
        },
      },
    };
    map.set(row.product_id, doc);
    batch.push(doc);
    if (batch.length >= BATCH_SIZE) {
      await OlistProduct.insertMany(batch, { ordered: false });
      batch = [];
    }
  }
  if (batch.length) await OlistProduct.insertMany(batch, { ordered: false });
  return map;
}

async function readSellers(base) {
  const map = new Map();
  let batch = [];
  for await (const row of csvRows(file(base, 'olist_sellers_dataset.csv'))) {
    const doc = {
      sellerId: row.seller_id,
      location: {
        zipCodePrefix: num(row.seller_zip_code_prefix),
        city: clean(row.seller_city),
        state: clean(row.seller_state),
      },
    };
    map.set(row.seller_id, doc);
    batch.push(doc);
    if (batch.length >= BATCH_SIZE) {
      await OlistSeller.insertMany(batch, { ordered: false });
      batch = [];
    }
  }
  if (batch.length) await OlistSeller.insertMany(batch, { ordered: false });
  return map;
}

async function readCustomers(base) {
  const map = new Map();
  const byCustomerId = new Map();
  for await (const row of csvRows(file(base, 'olist_customers_dataset.csv'))) {
    const key = row.customer_unique_id;
    if (!map.has(key)) map.set(key, { customerUniqueId: key, addresses: [] });
    map.get(key).addresses.push({
      customerId: row.customer_id,
      zipCodePrefix: num(row.customer_zip_code_prefix),
      city: clean(row.customer_city),
      state: clean(row.customer_state),
    });
    byCustomerId.set(row.customer_id, map.get(key));
  }
  const docs = [...map.values()];
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    await OlistCustomer.insertMany(docs.slice(i, i + BATCH_SIZE), { ordered: false });
  }
  return { byUniqueId: map, byCustomerId };
}

async function readOrderParts(base) {
  const items = new Map();
  for await (const row of csvRows(file(base, 'olist_order_items_dataset.csv'))) {
    if (!items.has(row.order_id)) items.set(row.order_id, []);
    items.get(row.order_id).push({
      orderItemId: num(row.order_item_id),
      productId: row.product_id,
      sellerId: row.seller_id,
      price: num(row.price) || 0,
      freightValue: num(row.freight_value) || 0,
      shippingLimitDate: date(row.shipping_limit_date),
    });
  }

  const payments = new Map();
  for await (const row of csvRows(file(base, 'olist_order_payments_dataset.csv'))) {
    if (!payments.has(row.order_id)) payments.set(row.order_id, []);
    payments.get(row.order_id).push({
      sequential: num(row.payment_sequential),
      type: row.payment_type,
      installments: num(row.payment_installments),
      value: num(row.payment_value) || 0,
    });
  }
  return { items, payments };
}

async function readOrders(base, customers, products, orderParts) {
  let batch = [];
  let count = 0;
  for await (const row of csvRows(file(base, 'olist_orders_dataset.csv'))) {
    const customer = customers.byCustomerId.get(row.customer_id);
    const items = (orderParts.items.get(row.order_id) || []).map((item) => {
      const product = products.get(item.productId);
      return {
        ...item,
        productCategory: product?.category || null,
        productCategoryEnglish: product?.categoryEnglish || null,
      };
    });
    batch.push({
      orderId: row.order_id,
      customerId: row.customer_id,
      customerUniqueId: customer?.customerUniqueId || row.customer_id,
      customer: customer?.addresses?.[0] ? {
        city: customer.addresses[0].city,
        state: customer.addresses[0].state,
      } : {},
      status: row.order_status,
      purchaseTimestamp: date(row.order_purchase_timestamp),
      approvedAt: date(row.order_approved_at),
      deliveredCarrierDate: date(row.order_delivered_carrier_date),
      deliveredCustomerDate: date(row.order_delivered_customer_date),
      estimatedDeliveryDate: date(row.order_estimated_delivery_date),
      items,
      payments: orderParts.payments.get(row.order_id) || [],
    });
    if (batch.length >= BATCH_SIZE) {
      await OlistOrder.insertMany(batch, { ordered: false });
      count += batch.length;
      console.log(`[olistImport] orders inserted: ${count}`);
      batch = [];
    }
  }
  if (batch.length) {
    await OlistOrder.insertMany(batch, { ordered: false });
    count += batch.length;
  }
  return count;
}

async function readReviews(base) {
  let batch = [];
  let count = 0;
  for await (const row of csvRows(file(base, 'olist_order_reviews_dataset.csv'))) {
    batch.push({
      reviewId: row.review_id,
      orderId: row.order_id,
      reviewScore: num(row.review_score),
      title: clean(row.review_comment_title),
      message: clean(row.review_comment_message),
      creationDate: date(row.review_creation_date),
      answerTimestamp: date(row.review_answer_timestamp),
    });
    if (batch.length >= BATCH_SIZE) {
      await OlistReview.insertMany(batch, { ordered: false });
      count += batch.length;
      batch = [];
    }
  }
  if (batch.length) {
    await OlistReview.insertMany(batch, { ordered: false });
    count += batch.length;
  }
  return count;
}

async function main() {
  const base = path.resolve(process.argv[2] || '');
  if (!base || !fs.existsSync(base)) {
    throw new Error('Pass the folder containing the 9 Olist CSV files as the first argument.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('[olistImport] connected to', mongoose.connection.name);

  await Promise.all([
    OlistOrder.deleteMany({}),
    OlistProduct.deleteMany({}),
    OlistSeller.deleteMany({}),
    OlistCustomer.deleteMany({}),
    OlistReview.deleteMany({}),
  ]);
  console.log('[olistImport] cleared previous Olist analytics collections');

  const categoryMap = await readCategoryMap(base);
  console.log('[olistImport] category translations loaded:', categoryMap.size);

  const products = await readProducts(base, categoryMap);
  console.log('[olistImport] products loaded:', products.size);
  const sellers = await readSellers(base);
  console.log('[olistImport] sellers loaded:', sellers.size);
  const customers = await readCustomers(base);
  console.log('[olistImport] unique customers loaded:', customers.byUniqueId.size);
  const orderParts = await readOrderParts(base);
  console.log('[olistImport] order items loaded:', orderParts.items.size, 'orders with payments:', orderParts.payments.size);
  const orderCount = await readOrders(base, customers, products, orderParts);
  console.log('[olistImport] orders loaded:', orderCount);
  const reviewCount = await readReviews(base);
  console.log('[olistImport] reviews loaded:', reviewCount);

  console.log('[olistImport] COMPLETE');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('[olistImport] failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
