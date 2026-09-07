# Olist real-data analytics

FlipMyCart now keeps its normal application data in MySQL and its existing MongoDB collections, while the real Olist Brazilian E-Commerce Public Dataset is imported into separate MongoDB collections prefixed with `olist`.

## Why MongoDB is the primary analytics store

- Olist orders are stored as MongoDB documents with embedded order items and payments.
- Product information is stored as flexible `attributes` documents.
- Customer records contain an `addresses` array, demonstrating a document-oriented model.
- Reviews are stored as separate documents and can be aggregated with orders.
- Sales, seller, product and customer-behaviour analytics are calculated with MongoDB aggregation pipelines.
- The existing FlipMyCart MySQL database is preserved and continues to handle application transactions and inventory.

## Import

1. Extract the Olist ZIP so the 9 CSV files are in one folder.
2. Make sure MongoDB is running.
3. From `backend/` run:

```cmd
npm run import:olist -- "C:\path\to\olist"
```

The importer clears only the five `olist*` analytics collections before rebuilding them. It does **not** delete FlipMyCart's normal MongoDB collections such as `productmedia`, `productspecifications`, `productreviews`, `conversations`, `messages`, `useractivities`, or `notifications`.

## Dataset limitations handled honestly

Olist contains orders, order items, payments, products, sellers, customers, reviews and geolocation. It does not contain browser/search clickstream events or product names.

Therefore:

- Customer analytics use repeat purchases, average orders/customer, preferred categories and payment methods.
- Product analytics use product IDs, categories, purchases and ratings where the reviewed order contains one item.
- The dashboard does not fabricate product views, search history or product names.
- Inventory remains based on FlipMyCart's MySQL stock because Olist does not contain current stock quantities.
- Olist monetary values are displayed in Brazilian Real (BRL), the dataset's original currency.
