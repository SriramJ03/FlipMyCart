# FlipMyCart — API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require header: `Authorization: Bearer <JWT>`.
All responses follow `{ success: boolean, data?, message?, meta? }`.

## Auth (`/api/auth`)

| Endpoint | Method | Auth | Roles | Body | Notes |
|---|---|---|---|---|---|
| `/auth/register` | POST | No | - | `{ name, email, password, phone?, role: 'buyer'\|'seller', businessName?, businessDescription? }` | Public registration only allows buyer/seller. `businessName` required for seller. Returns `{ user, sellerId, token }`. |
| `/auth/login` | POST | No | - | `{ email, password }` | Returns `{ user, sellerId, token }`. |
| `/auth/profile` | GET | Yes | any | - | Returns `{ user, seller }` (seller null unless role=seller). |
| `/auth/profile` | PUT | Yes | any | `{ name?, phone?, addressLine1?, addressLine2?, city?, state?, postalCode?, country? }` | |
| `/auth/change-password` | PUT | Yes | any | `{ currentPassword, newPassword }` | |

## Sellers (`/api/sellers`) — all require role `seller`

| Endpoint | Method | Body |
|---|---|---|
| `/sellers/me` | GET | - |
| `/sellers/me` | PUT | `{ businessName?, businessDescription?, gstNumber? }` |
| `/sellers/onboarding/pay` | POST | `{ method?: 'mock_card'\|'mock_upi'\|'mock_wallet' }` — simulated, always succeeds |
| `/sellers/onboarding/payments` | GET | - |
| `/sellers/dashboard` | GET | - returns seller row + product/order stats |

## Categories (`/api/categories`)

| Endpoint | Method | Auth | Roles |
|---|---|---|---|
| `/categories` | GET | No | - |
| `/categories` | POST | Yes | admin |
| `/categories/:id` | PUT | Yes | admin |
| `/categories/:id` | DELETE | Yes | admin (soft-deactivate) |

## Products (`/api/products`)

Combines MySQL (core fields) with MongoDB (media + specifications) into one response object:
`{ productId, sellerId, categoryId, categoryName, sellerName, name, description, price, stockQuantity, status, media: { images, videos }, specifications: {...} }`.

| Endpoint | Method | Auth | Roles | Notes |
|---|---|---|---|---|
| `/products` | GET | Optional | - | Query: `search, categoryId, sellerId, minPrice, maxPrice, inStock, page, limit`. Only `status=active` products unless `status` explicitly requested elsewhere. |
| `/products/mine` | GET | Yes | seller | Includes draft/inactive products owned by the caller. |
| `/products/:id` | GET | Optional | - | |
| `/products` | POST | Yes | seller | `{ categoryId, name, description, price, stockQuantity, status, attributes }`. `status: 'active'` is downgraded to `draft` server-side if onboarding isn't paid. |
| `/products/:id` | PUT | Yes | seller (owner) | Same body, partial. |
| `/products/:id` | DELETE | Yes | seller (owner) or admin | |
| `/products/:id/media` | POST | Yes | seller (owner) | `multipart/form-data`, field `files` (up to 6, images/mp4/webm, 5MB each default) |

## Cart (`/api/cart`) — role `buyer`

| Endpoint | Method | Body |
|---|---|---|
| `/cart` | GET | - |
| `/cart/items` | POST | `{ productId, quantity }` |
| `/cart/items/:itemId` | PUT | `{ quantity }` |
| `/cart/items/:itemId` | DELETE | - |

## Wishlist (`/api/wishlist`) — role `buyer`

| Endpoint | Method | Body |
|---|---|---|
| `/wishlist` | GET | - |
| `/wishlist` | POST | `{ productId }` |
| `/wishlist/:productId` | DELETE | - |

## Orders (`/api/orders`)

| Endpoint | Method | Auth | Roles | Body |
|---|---|---|---|---|
| `/orders` | POST | Yes | buyer | `{ shippingAddress, paymentMethod? }` — validates cart/stock in one MySQL transaction, snapshots price, decrements stock, creates a `successful` mock payment. |
| `/orders/mine` | GET | Yes | buyer | |
| `/orders/seller` | GET | Yes | seller | Order items belonging to the seller's products. |
| `/orders/:id` | GET | Yes | any (ownership enforced for buyers) | |
| `/orders/:id/status` | PUT | Yes | buyer/seller/admin | `{ status }`. Buyers may only cancel `placed`/`processing` orders (restocks items). |

## Payments (`/api/payments`) — simulated, read-only records

| Endpoint | Method | Roles |
|---|---|---|
| `/payments/mine` | GET | any authenticated |
| `/payments` | GET | admin |

## Reviews (`/api/reviews`)

| Endpoint | Method | Auth | Roles | Notes |
|---|---|---|---|---|
| `/reviews/product/:productId` | GET | No | - | Returns `{ reviews, summary: { count, average } }`. |
| `/reviews` | POST | Yes | buyer | `{ productId, rating (1-5), reviewText }` — requires a delivered order for that product; one review per (product, user). |
| `/reviews/:id` | PUT | Yes | buyer (own review) | `{ rating?, reviewText? }` |
| `/reviews/:id` | DELETE | Yes | buyer (own) or admin | |

## Chat (`/api/chat`) — roles `buyer`, `seller`, `admin`

| Endpoint | Method | Notes |
|---|---|---|
| `/chat/conversations` | POST | Buyer only. `{ productId, message }` — finds or creates the (buyer, seller, product) thread. |
| `/chat/conversations` | GET | Lists the caller's conversations (as buyer or seller). |
| `/chat/conversations/:id/messages` | GET | Participant-only (403 otherwise). |
| `/chat/conversations/:id/messages` | POST | `{ message }`. Participant-only. |

## Notifications (`/api/notifications`)

| Endpoint | Method |
|---|---|
| `/notifications` | GET |
| `/notifications/unread-count` | GET |
| `/notifications/:id/read` | PUT |
| `/notifications/read-all` | PUT |

## Support (`/api/support`)

| Endpoint | Method | Roles | Body |
|---|---|---|---|
| `/support/tickets` | POST | any authenticated | `{ subject, description, category?, priority? }` |
| `/support/tickets/mine` | GET | any authenticated | |
| `/support/tickets` | GET | support, admin | Query: `status?` |
| `/support/tickets/:id/assign` | PUT | support, admin | `{ assignedTo: userId }` |
| `/support/tickets/:id/status` | PUT | support, admin | `{ status, resolutionNotes? }` |

## Analytics (`/api/analytics`) — roles `admin`, `seller`

| Endpoint | Method | Source | Returns |
|---|---|---|---|
| `/analytics/sales` | GET | MySQL | totals, monthly trend, best-sellers, category sales |
| `/analytics/sellers` | GET | MySQL | per-seller orders/units/revenue |
| `/analytics/products` | GET | MySQL + MongoDB | most purchased (SQL), most viewed (Mongo UserActivity), highest/lowest rated (Mongo reviews) |
| `/analytics/customer-behaviour` | GET | MongoDB | most searched terms, popular categories, activity breakdown |
| `/analytics/inventory` | GET | MySQL | low-stock, out-of-stock, availability counts. Query: `lowStockThreshold?` |

## Admin (`/api/admin`) — role `admin`

| Endpoint | Method | Body |
|---|---|---|
| `/admin/users` | GET | Query: `role?` |
| `/admin/users/:id/status` | PUT | `{ isActive: boolean }` |
| `/admin/users/staff` | POST | `{ name, email, password, role: 'admin'\|'support', phone? }` — the only way to create admin/support accounts |
| `/admin/sellers` | GET | - |
| `/admin/products` | GET | - |
| `/admin/products/:id/status` | PUT | `{ status: 'draft'\|'active'\|'inactive' }` |

## Example response shapes

Success:
```json
{ "success": true, "data": { "...": "..." } }
```

Error:
```json
{ "success": false, "message": "Insufficient stock for \"SoundWave Bluetooth Headphones\" (available: 3)" }
```
