# FlipMyCart — Architecture (Phase 0)

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, JavaScript, React Router v6, Axios, Context API |
| Backend | Node.js + Express.js |
| Relational DB | MySQL 8 (via `mysql2` driver, connection pool, parameterized queries) |
| NoSQL DB | MongoDB 6+ (via Mongoose ODM) |
| Auth | JWT (access token) + bcrypt (password hashing) |
| File upload | Multer (disk storage under `backend/uploads/`) |
| Realtime (optional/future) | Socket.IO — not implemented in v1, chat is REST-based |

## 2. System Architecture

```
React (Vite) SPA  --Axios/HTTP-->  Express API  --mysql2-->  MySQL   (structured, transactional)
                                        |
                                        --mongoose-->  MongoDB (flexible, high-volume, semi-structured)
```

Backend layering: **Routes → Controllers → Services → Data access (MySQL pool / Mongoose models)**.
- Routes: URL + HTTP method + middleware wiring only.
- Controllers: parse request, call service(s), shape HTTP response.
- Services: business logic, including cross-database orchestration.
- `config/mysql.js` exposes a promise pool; `config/mongodb.js` opens the Mongoose connection.

## 3. Polyglot Persistence Split

**MySQL owns anything transactional, relational, or requiring strong consistency / joins:**
users, sellers, categories, products (core fields), carts, cart_items, wishlists, orders,
order_items, payments, seller_onboarding_payments, support_tickets.

**MongoDB owns anything flexible, schema-varying, or high-write-volume:**
ProductMedia, ProductSpecifications (varies wildly per category — this is the textbook
reason to avoid a rigid relational schema), ProductReviews, Conversations, Messages
(one document per message, not embedded, so a conversation is never a single unbounded
document), UserActivity (high write volume, append-only clickstream-like data),
Notifications.

## 4. Cross-Database Reference Strategy

MongoDB documents that describe a MySQL entity store the **MySQL integer id** in a plain
field (`productId`, `userId`, `sellerId`, `sellerUserId`) — never a Mongo ObjectId as a
stand-in for a relational id. ObjectIds are used only for relationships that live entirely
inside MongoDB (e.g. `Message.conversationId → Conversation._id`).

## 5. Cross-Database Consistency Strategy

MySQL transactions cannot roll back MongoDB writes and vice versa, so FlipMyCart uses an
explicit **compensating-action (saga-style) strategy** documented in
`docs/PolyglotPersistence.md` and implemented in `backend/services/productService.js`:

1. Create the row in MySQL first (it's the source of truth for the id).
2. Attempt the MongoDB writes (media + specifications) using that id.
3. If any MongoDB write fails, delete whatever MongoDB documents were already created
   for that product, then delete the MySQL row — leaving the system as if the create
   never happened.
4. The reverse direction (product delete) deletes MongoDB documents for the product
   first, then the MySQL row, and logs (but does not fail the request) if the Mongo
   cleanup is partial, since an orphaned Mongo doc for a deleted product id is harmless
   and can be swept by a maintenance job.

## 6. Authentication Architecture

- Register (buyer/seller only) → bcrypt-hash password → insert into `users` (+ `sellers`
  row if role=seller) → issue JWT.
- Login → verify bcrypt hash → issue JWT `{ userId, role }` signed with `JWT_SECRET`,
  expiring per `JWT_EXPIRES_IN`.
- `middleware/auth.js` verifies the bearer token and attaches `req.user`.
- `middleware/authorize(...roles)` gates role-based routes (admin, support, seller, buyer).
- Admin and Support accounts are seed-only / admin-created — never via public register.
- Passwords/hashes are never included in any API response (`sanitizeUser` helper strips them).

## 7. Seller Onboarding Rule

`sellers.onboarding_status` (`pending` | `paid`). A seller may create products, but a
product can only be set to `active` status if `onboarding_status = 'paid'`; otherwise it
is forced to `draft`. This is enforced server-side in `productService`, not just the UI.
No commission is ever computed on order totals.

## 8. Frontend Architecture

- `src/api/` — one Axios instance (`client.js`) with a request interceptor attaching the
  JWT and a response interceptor handling 401s, plus one module per resource
  (`auth.js`, `products.js`, `orders.js`, …).
- `src/context/` — `AuthContext` (user/token/role, persisted to localStorage),
  `CartContext` (server-backed cart, refetched on auth change), `NotificationContext`
  (unread count/poll).
- `src/routes/` — `ProtectedRoute` (auth required) and `RoleRoute` (auth + role required)
  wrap `react-router` routes defined in `AppRoutes.jsx`.
- `src/pages/` — grouped by audience: `public/`, `buyer/`, `seller/`, `admin/`, `support/`.

## 9. Data Analysis Strategy

Analytics endpoints live under `/api/analytics/*` and combine both databases in the
service layer:
- Sales/revenue/inventory/seller-performance → SQL aggregate queries (`GROUP BY`,
  `SUM`, `COUNT`) against `orders`/`order_items`/`products`.
- Product ratings/review analysis → Mongo aggregation pipeline over `ProductReviews`.
- Customer behaviour (most searched/viewed, popular categories) → Mongo aggregation over
  `UserActivity`, joined in application code against MySQL product/category names.

## 10. Security Strategy

bcrypt password hashing, JWT auth, `express-validator` input validation, parameterized
`mysql2` queries (no string concatenation), role-based authorization middleware, Multer
file-type/size validation, `.env`-driven config (never committed), centralized error
middleware, consistent HTTP status codes, `cors` configured to the frontend origin only.

## 11. Roadmap

Phases 1–19 as listed in the project brief are implemented in this workspace in order,
building on top of each other without breaking prior phases. See `README.md` for how to
run each part locally.
