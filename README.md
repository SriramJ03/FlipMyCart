# FlipMyCart

**A Commission-Free E-Commerce Marketplace Using Polyglot Persistence**

An academic full-stack project (NoSQL course) demonstrating **MySQL + MongoDB polyglot
persistence** in a real e-commerce application, built with React, Node.js/Express,
MySQL, and MongoDB/Mongoose.

## 1. Project description

FlipMyCart is a marketplace where sellers list and sell products directly to buyers.
Buyers browse, search, cart, wishlist, order, review, and message sellers. Sellers
manage products/media/inventory, view their orders, and see sales analytics. Admins
manage users, sellers, categories, and moderate products. Customer support staff
triage and resolve support tickets. The project's core academic purpose is to
**genuinely and meaningfully use two different databases** for the parts of the data
model each one fits best — see `docs/PolyglotPersistence.md`.

## 2. Problem statement

Traditional marketplaces charge sellers a commission on every sale, which erodes
seller margins as they scale. FlipMyCart instead charges sellers a **single one-time
onboarding fee** and takes **zero commission** on any subsequent sale. A seller's
products can only go live (`status = 'active'`) once that onboarding fee is paid —
enforced server-side, not just in the UI.

## 3. Features

- JWT authentication (bcrypt-hashed passwords), role-based authorization for
  **buyer / seller / admin / support**
- Buyer: browse/search/filter products, cart, wishlist, checkout, order history,
  reviews, seller messaging, notifications, support tickets
- Seller: registration, one-time onboarding (simulated payment), product CRUD with
  image/video upload, category-specific specifications, inventory, order fulfillment,
  sales analytics, buyer messaging
- Admin: user/seller management, product moderation, category management,
  platform-wide analytics, admin/support account creation
- Support: ticket queue, assignment, status/resolution workflow
- Cross-database product model: MySQL core fields + MongoDB media/specifications,
  merged into one API response
- Data analysis across 5 dimensions: sales, seller performance, product analysis,
  customer behaviour (MongoDB clickstream), inventory

## 4. Technology stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, JavaScript, React Router, Axios, Context API |
| Backend | Node.js, Express.js |
| Relational DB | MySQL 8 (`mysql2`) |
| NoSQL DB | MongoDB 6+ (Mongoose) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Uploads | Multer (local disk storage) |
| Validation | `express-validator` |

## 5. Architecture

See `docs/Architecture.md` for the full write-up (layering, request flow, roadmap).
Short version: `React SPA → Express API (routes → controllers → services) → MySQL pool
+ Mongoose`.

## 6. Polyglot Persistence explanation

See `docs/PolyglotPersistence.md` and `docs/DatabaseDesign.md`. In short: MySQL owns
transactional/relational data (users, sellers, products' core fields, cart, orders,
payments, support tickets); MongoDB owns flexible/high-volume data (product media,
category-varying specifications, reviews, chat messages, user activity clickstream,
notifications). Cross-database references use plain MySQL integer ids, never Mongo
ObjectIds standing in for them. Cross-database consistency (no distributed
transaction is possible) is handled with an explicit **compensating-action strategy**
implemented in `backend/services/productService.js`.

## 7. Project structure

```
FlipMyCart/
├── backend/
│   ├── config/            # mysql.js, mongodb.js
│   ├── controllers/       # request/response handling
│   ├── database/          # schema.sql, seed.sql, mongoSeed.js
│   ├── middleware/        # auth, error handling, validation, upload
│   ├── models/mongodb/    # Mongoose schemas
│   ├── routes/
│   ├── services/          # business logic, cross-DB orchestration, analytics
│   ├── utils/
│   ├── uploads/products/  # uploaded product media (gitignored contents)
│   ├── app.js / server.js
│   ├── package.json / .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # axios client + one module per resource
│   │   ├── components/    # Navbar, ProductCard, StarRating, ...
│   │   ├── context/       # AuthContext, CartContext, NotificationContext
│   │   ├── layouts/       # MainLayout, DashboardLayout
│   │   ├── pages/         # public/ buyer/ seller/ admin/ support/ shared/
│   │   ├── routes/        # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── utils/
│   │   ├── App.jsx / main.jsx / index.css
│   ├── package.json / vite.config.js / .env.example
├── docs/
│   ├── Architecture.md
│   ├── DatabaseDesign.md
│   ├── API-Documentation.md
│   └── PolyglotPersistence.md
├── README.md
└── .gitignore
```

## 8. Prerequisites

- Node.js 18+ and npm
- MySQL 8.x server
- MongoDB 6.x+ server (local or Atlas)

## 9. MySQL installation

Ubuntu/Debian:
```bash
sudo apt-get update && sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
```
macOS (Homebrew): `brew install mysql && brew services start mysql`
Windows: use the MySQL Installer from mysql.com.

**Create a dedicated application user** (do not use root over TCP):
```sql
CREATE DATABASE flipmycart CHARACTER SET utf8mb4;
CREATE USER 'flipmycart_app'@'%' IDENTIFIED BY 'a_strong_password_here';
GRANT ALL PRIVILEGES ON flipmycart.* TO 'flipmycart_app'@'%';
FLUSH PRIVILEGES;
```

## 10. MongoDB installation

Ubuntu/Debian: follow the official MongoDB Community Edition apt instructions for
your distro, then `sudo systemctl enable --now mongod`.
macOS (Homebrew): `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`.
Windows: use the MongoDB Community Server installer.
Alternatively use a free MongoDB Atlas cluster and set `MONGO_URI` accordingly.

## 11. Environment configuration

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Edit `backend/.env` with your real `DB_USER`/`DB_PASSWORD` and a long random
`JWT_SECRET`. Never commit `.env` files — only `.env.example` is tracked.

## 12. Database setup

```bash
mysql -u flipmycart_app -p flipmycart < backend/database/schema.sql
mysql -u flipmycart_app -p flipmycart < backend/database/seed.sql
```

## 13. Seed data

MySQL seed (`backend/database/seed.sql`) creates: 1 admin, 2 support, 4 sellers (one
with onboarding still `pending` to demonstrate the draft-product rule), 5 buyers, 6
categories, 15 products (including one out-of-stock and one low-stock item), carts,
wishlists, 6 orders with items/payments, seller onboarding payments, and support
tickets. **All seed users share the password `Password123!`.**

MongoDB seed (`backend/database/mongoSeed.js`) references the **exact same ids** used
in `seed.sql` (products 1–15, users 1–12, sellers 1–4) so the two databases describe
one consistent dataset. Run it after `backend/.env` is configured and both DB servers
are running:
```bash
cd backend
npm install
npm run seed:mongo
```

## 14. Backend setup

```bash
cd backend
npm install
npm run dev      # nodemon, http://localhost:5000
# or: npm start
```
On startup the server verifies both the MySQL pool and the MongoDB connection before
listening, and exits with a clear error message if either is unreachable.

## 15. Frontend setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## 16. Running the project

1. Start MySQL and MongoDB.
2. `backend/`: `npm install`, configure `.env`, run schema.sql + seed.sql, `npm run
   seed:mongo`, then `npm run dev`.
3. `frontend/`: `npm install`, configure `.env`, `npm run dev`.
4. Visit `http://localhost:5173`. Log in with any seed account (e.g.
   `admin@flipmycart.com` / `seller1@flipmycart.com` / `buyer1@flipmycart.com` /
   `support1@flipmycart.com`), password `Password123!`.

## 17. Testing

**What was actually verified in this development environment** (no MySQL/MongoDB
server or Docker was available here — see `docs/Architecture.md`/this section for the
honest distinction between static validation and live integration testing):

- Every backend file (`app.js`, all `controllers/`, `routes/`, `middleware/`,
  `services/`, `models/mongodb/`) was `require()`d successfully with no syntax or
  import errors (`node --check` on every file, plus a full `require('./app.js')`
  load test).
- `npm install` succeeded for both `backend/` and `frontend/` with no unresolved
  dependencies.
- `npm run build` succeeded for the frontend (155 modules, zero errors) — this
  compiles/type-checks every React component's imports and JSX.
- Route ordering was manually checked to avoid Express path collisions (e.g.
  `/products/mine` and `/orders/mine` are registered before their `/:id` siblings).
- MySQL/MongoDB seed data cross-references were manually verified for consistency
  (e.g. every `productId` used in `mongoSeed.js` exists in `seed.sql`).

**What was NOT live-tested** (no DB server / Docker in this environment): actual
request/response round trips against a running MySQL+MongoDB stack, the
create-product cross-database compensating-action rollback path, JWT
issuance/verification against a live DB-backed user lookup, and the React app's
runtime behavior against the real API. **Do this locally** — see the reproduction
steps below.

### How to test locally

1. Follow sections 9–16 above to get both DBs, backend, and frontend running.
2. `curl http://localhost:5000/api/health` → should return `{"success":true,...}`.
3. Register a buyer and a seller via the UI (or `POST /api/auth/register`).
4. As the seller: `POST /sellers/onboarding/pay`, then create a product with
   `status: 'active'` — confirm it stays `draft` before paying and goes `active`
   after.
5. As the buyer: add the product to cart, place an order, confirm stock decrements
   in MySQL and a `payments` row is created; try reviewing it (should be blocked
   until the order is `delivered`, which you can set via the seller Orders page or
   `PUT /orders/:id/status`).
6. Start a conversation from the product page as the buyer, reply as the seller, and
   confirm a buyer/non-participant cannot `GET` that conversation's messages (403).
7. Check `/api/analytics/*` as an admin and confirm figures match what you just did.
8. Log in as `support1@flipmycart.com`, view/assign/resolve a ticket.

## 18. API documentation

See `docs/API-Documentation.md` for every endpoint, required role, request body, and
example responses.

## 19. Known limitations

- Payments (order + seller onboarding) are **simulated** — no real payment gateway is
  integrated, by design for this academic project.
- Buyer-seller chat is REST-based (poll-driven on the frontend); Socket.IO real-time
  delivery is listed as a future improvement, not implemented.
- File uploads are stored on local disk (`backend/uploads/`), not an external object
  store — fine for a local/college deployment, not for a multi-instance production
  deployment.
- No automated test suite (unit/integration) is included; testing in this project was
  manual + the static validation described in section 17.
- The frontend's `npm audit` currently flags a moderate/high advisory in Vite's
  bundled `esbuild` (dev-server-only request-forgery risk, does not affect the
  production build output) — fixing it requires the Vite 8 major upgrade, which was
  left as-is here to avoid destabilizing a verified-working build; see
  `npm audit` output for details if you want to apply it yourself.

## 20. Future improvements

- Real payment gateway integration (Razorpay/Stripe) behind the same simulated-flow
  interface.
- Socket.IO for real-time chat and live order-status push notifications.
- Redis caching for hot product-listing queries.
- Automated test suite (Jest/Supertest for backend, React Testing Library for
  frontend).
- Object storage (S3-compatible) for product media instead of local disk.
- Elasticsearch/Atlas Search for full-text product search instead of SQL `LIKE`.
