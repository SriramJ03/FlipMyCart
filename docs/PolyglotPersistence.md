# Polyglot Persistence in FlipMyCart

## Why two databases?

FlipMyCart deliberately uses **MySQL** and **MongoDB** together, each for the kind of data
it is best at, instead of forcing every table into one engine.

## What lives where, and why

| Data | Database | Why |
|---|---|---|
| Users, sellers, auth | MySQL | Strong consistency, uniqueness constraints (email), relational integrity |
| Categories | MySQL | Small, structured, rarely changes |
| Core product fields (price, stock, status, seller/category FK) | MySQL | Needs joins, transactions, and strong consistency (stock decrement during checkout) |
| Product media (images/video metadata) | MongoDB | Variable number of images/videos per product; no fixed schema benefit from a relational table |
| Product specifications | MongoDB | **Every category has different attributes** — a phone has RAM/battery/camera, a shirt has size/color/material. Modeling this in MySQL would require either a giant sparse table or an EAV anti-pattern. MongoDB documents naturally hold whatever fields a category needs. |
| Cart / cart items | MySQL | Transactional — quantity × price must be consistent, joined with product/stock at checkout |
| Wishlist | MySQL | Simple relational many-to-many (user, product) |
| Orders / order items / payments | MySQL | Must be transactional and consistent (stock deduction, historical price snapshot) |
| Seller onboarding payments | MySQL | Financial record tied 1:1 to a seller row |
| Support tickets | MySQL | Structured workflow (status, assignee) benefits from relational queries |
| Product reviews | MongoDB | High volume, semi-structured (rating + free text), no need for SQL joins beyond a productId/userId reference |
| Conversations / messages | MongoDB | Message volume grows unbounded; each message is its own document (see below) so a conversation document never grows without limit |
| User activity (views/searches) | MongoDB | High write volume, append-only, clickstream-like — a relational table would be an anti-pattern here |
| Notifications | MongoDB | Semi-structured payload varies by notification type, high volume, mostly write-once/read-once |

## Cross-database references

MongoDB documents reference MySQL rows by their **plain integer id**, never by minting a
Mongo ObjectId in place of it:

```
ProductMedia.productId          -> MySQL products.product_id
ProductSpecification.productId  -> MySQL products.product_id
ProductReview.productId         -> MySQL products.product_id
ProductReview.userId            -> MySQL users.user_id
Conversation.buyerId            -> MySQL users.user_id
Conversation.sellerUserId       -> MySQL users.user_id
Conversation.sellerId           -> MySQL sellers.seller_id
Conversation.productId          -> MySQL products.product_id
UserActivity.userId             -> MySQL users.user_id
UserActivity.productId          -> MySQL products.product_id
Notification.userId             -> MySQL users.user_id
Message.conversationId          -> Conversation._id   (Mongo-internal relationship)
```

## Avoiding an unbounded conversation document

A naive design would embed all messages inside the `Conversation` document. That document
would grow without bound and eventually hit MongoDB's 16MB document limit, and would force
a full-document rewrite for every new message. Instead:

- `Conversation` stores only the thread metadata + a denormalized `lastMessage` /
  `lastMessageAt` (for fast inbox listing).
- `Message` is its own collection, one document per message, indexed on
  `(conversationId, createdAt)`, so paginating a conversation is a simple indexed query
  and sending a message is a single small insert.

## Cross-database consistency (no distributed transactions)

MySQL and MongoDB cannot share a transaction. Where an operation must touch both,
FlipMyCart uses a **compensating-action (saga) pattern**, implemented in
`backend/services/productService.js`:

### Create product
1. `INSERT` into MySQL `products` → get `product_id`.
2. Insert `ProductSpecification` (Mongo) using that id.
3. Insert `ProductMedia` documents (Mongo) using that id.
4. **If step 2 or 3 throws:** delete any Mongo documents that were created in this
   attempt, then `DELETE` the MySQL product row that was created in step 1. The API
   returns an error as if nothing happened — no orphaned MySQL row, no orphaned Mongo
   doc.

### Delete product
1. Delete `ProductMedia` + `ProductSpecification` + related reviews in MongoDB.
2. Delete the MySQL `products` row.
3. If the Mongo cleanup partially fails, the MySQL row is still removed (a product must
   not become permanently undeletable because of a Mongo hiccup) and the failure is
   logged server-side; an orphaned Mongo doc referencing a deleted `product_id` is inert
   (nothing ever joins to it again) and can be swept by a periodic maintenance script.

### Update product specifications/media
Mongo documents are upserted (`findOneAndUpdate(..., { upsert: true })`) keyed on
`productId`, which is naturally idempotent — safe to retry without creating duplicates.

This is the same pattern real polyglot-persistence systems use when a two-phase commit
across heterogeneous databases is impractical: make one database authoritative for id
generation, treat the second database's write as best-effort with explicit rollback of
the first on failure.
