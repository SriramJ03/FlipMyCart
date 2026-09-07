-- FlipMyCart MySQL schema
-- Run as: mysql -u flipmycart_app -p flipmycart < schema.sql
-- (create the database + app user first, see README.md)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------
-- users : all roles (buyer, seller, admin, support) — single account table
-- ------------------------------------------------------------------
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS seller_onboarding_payments;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sellers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  role            ENUM('buyer','seller','admin','support') NOT NULL DEFAULT 'buyer',
  address_line1   VARCHAR(255),
  address_line2   VARCHAR(255),
  city            VARCHAR(100),
  state           VARCHAR(100),
  postal_code     VARCHAR(20),
  country         VARCHAR(100) DEFAULT 'India',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- sellers : one-to-one extension of a user with role='seller'
-- ------------------------------------------------------------------
CREATE TABLE sellers (
  seller_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL UNIQUE,
  business_name      VARCHAR(150) NOT NULL,
  business_description TEXT,
  gst_number         VARCHAR(30),
  onboarding_status  ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  onboarding_fee     DECIMAL(10,2) NOT NULL DEFAULT 999.00,
  rating_avg         DECIMAL(3,2) DEFAULT 0.00,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sellers_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- categories
-- ------------------------------------------------------------------
CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   VARCHAR(255),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- products : core structured fields only. Media/specs live in MongoDB.
-- ------------------------------------------------------------------
CREATE TABLE products (
  product_id    INT AUTO_INCREMENT PRIMARY KEY,
  seller_id     INT NOT NULL,
  category_id   INT NOT NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  status        ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_seller (seller_id),
  INDEX idx_products_status (status),
  FULLTEXT INDEX ft_products_name_desc (name, description)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- carts / cart_items
-- ------------------------------------------------------------------
CREATE TABLE carts (
  cart_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id      INT NOT NULL,
  product_id   INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- wishlists
-- ------------------------------------------------------------------
CREATE TABLE wishlists (
  wishlist_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  product_id   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- orders / order_items
-- ------------------------------------------------------------------
CREATE TABLE orders (
  order_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  total_amount   DECIMAL(10,2) NOT NULL,
  status         ENUM('placed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  shipping_address VARCHAR(500) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  order_item_id  INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  product_id     INT NOT NULL,
  seller_id      INT NOT NULL,
  product_name   VARCHAR(200) NOT NULL,
  unit_price     DECIMAL(10,2) NOT NULL,
  quantity       INT NOT NULL,
  line_total     DECIMAL(10,2) NOT NULL,
  item_status    ENUM('placed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT fk_order_items_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id),
  INDEX idx_order_items_seller (seller_id),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- payments : order payment records (simulated)
-- ------------------------------------------------------------------
CREATE TABLE payments (
  payment_id    INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  user_id       INT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  method        ENUM('mock_card','mock_upi','mock_wallet','cod') NOT NULL DEFAULT 'mock_card',
  status        ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(64) NOT NULL UNIQUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- seller_onboarding_payments : one-time onboarding fee (simulated)
-- ------------------------------------------------------------------
CREATE TABLE seller_onboarding_payments (
  onboarding_payment_id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id     INT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  method        ENUM('mock_card','mock_upi','mock_wallet') NOT NULL DEFAULT 'mock_card',
  status        ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(64) NOT NULL UNIQUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_onboarding_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- support_tickets
-- ------------------------------------------------------------------
CREATE TABLE support_tickets (
  ticket_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  assigned_to     INT NULL,
  subject         VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  category        ENUM('order','payment','product','seller','account','other') NOT NULL DEFAULT 'other',
  status          ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  priority        ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  resolution_notes TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_tickets_status (status)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
