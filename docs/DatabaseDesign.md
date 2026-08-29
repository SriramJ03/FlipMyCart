# FlipMyCart — Database Design

## MySQL (relational, transactional)

Full DDL: `backend/database/schema.sql`. Seed data: `backend/database/seed.sql`.

| Table | Purpose | Key columns |
|---|---|---|
| `users` | All four roles in one table (`role` enum) | `user_id` PK, `email` unique, `password_hash`, `role` |
| `sellers` | 1:1 extension of a `user` with `role='seller'` | `seller_id` PK, `user_id` FK unique, `onboarding_status` |
| `categories` | Product categories | `category_id` PK, `slug` unique |
| `products` | Core structured product fields only | `product_id` PK, `seller_id` FK, `category_id` FK, `price`, `stock_quantity`, `status` |
| `carts` / `cart_items` | One cart per user, line items | `cart_id`/`cart_item_id`, unique `(cart_id, product_id)` |
| `wishlists` | Buyer ↔ product, many-to-many | unique `(user_id, product_id)` |
| `orders` / `order_items` | Order header + line items, with **price and product name snapshotted** at order time | `order_id`/`order_item_id`, `unit_price`, `product_name` frozen |
| `payments` | Order payment records (simulated) | `transaction_ref` unique |
| `seller_onboarding_payments` | One-time onboarding fee records (simulated) | `transaction_ref` unique |
| `support_tickets` | Customer support workflow | `status`, `assigned_to` FK to `users` |

Entity relationships (simplified):

```
users 1───1 sellers 1───* products *───1 categories
users 1───1 carts 1───* cart_items *───1 products
users 1───* wishlists *───1 products
users 1───* orders 1───* order_items *───1 products
orders 1───* payments
sellers 1───* seller_onboarding_payments
users 1───* support_tickets (assigned_to → users)
```

## MongoDB (flexible / semi-structured / high-volume)

Mongoose schemas: `backend/models/mongodb/`. Seed data: `backend/database/mongoSeed.js`.

| Collection | Purpose | Cross-DB reference |
|---|---|---|
| `productmedia` | Images/videos per product | `productId → MySQL products.product_id` |
| `productspecifications` | Category-varying attributes (`Mixed` type) | `productId → MySQL products.product_id` |
| `productreviews` | Rating + text, one per (product, user) | `productId`, `userId → MySQL` |
| `conversations` | Buyer↔seller thread metadata, denormalized `lastMessage` | `buyerId`, `sellerUserId → users`; `sellerId → sellers`; `productId → products` |
| `messages` | One document per chat message | `conversationId → Conversation._id` (Mongo-internal); `senderId → MySQL users` |
| `useractivities` | Append-only clickstream (views/searches/etc.) | `userId`, `productId → MySQL` |
| `notifications` | Per-user notification feed | `userId → MySQL users` |

See `docs/PolyglotPersistence.md` for the full rationale and the cross-database
consistency (compensating action) strategy used when a single logical operation
touches both databases.
