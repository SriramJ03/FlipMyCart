-- FlipMyCart MySQL seed data
-- Run AFTER schema.sql: mysql -u flipmycart_app -p flipmycart < seed.sql
--
-- All seed users share the password:  Password123!
-- (bcrypt hash below was generated with bcryptjs, 10 salt rounds)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------
-- USERS  (id order matters: 1=admin, 2-3=support, 4-7=sellers, 8-12=buyers)
-- ------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash, phone, role, address_line1, city, state, postal_code, country) VALUES
(1,  'System Admin',    'admin@flipmycart.com',    '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9000000001', 'admin',   'HQ Building, MG Road', 'Bengaluru', 'Karnataka', '560001', 'India'),
(2,  'Kavya Iyer',      'support1@flipmycart.com', '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9000000002', 'support', 'Support Center A',     'Bengaluru', 'Karnataka', '560002', 'India'),
(3,  'Rohan Desai',     'support2@flipmycart.com', '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9000000003', 'support', 'Support Center B',     'Pune',      'Maharashtra', '411001', 'India'),
(4,  'Arjun Mehta',     'seller1@flipmycart.com',  '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9111100001', 'seller',  'Plot 12, Electronic City', 'Bengaluru', 'Karnataka', '560100', 'India'),
(5,  'Neha Kapoor',     'seller2@flipmycart.com',  '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9111100002', 'seller',  '45 Textile Market',    'Surat',     'Gujarat',   '395001', 'India'),
(6,  'Suresh Nair',     'seller3@flipmycart.com',  '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9111100003', 'seller',  '7 Home Goods Complex', 'Chennai',   'Tamil Nadu','600001', 'India'),
(7,  'Deepak Rao',      'seller4@flipmycart.com',  '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9111100004', 'seller',  '3 New Ventures Park',  'Hyderabad', 'Telangana', '500001', 'India'),
(8,  'Rahul Sharma',    'buyer1@flipmycart.com',   '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9222200001', 'buyer',   '101 Green Park',       'Delhi',     'Delhi',     '110016', 'India'),
(9,  'Priya Patel',     'buyer2@flipmycart.com',   '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9222200002', 'buyer',   '22 Lake View Road',    'Ahmedabad', 'Gujarat',   '380001', 'India'),
(10, 'Amit Kumar',      'buyer3@flipmycart.com',   '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9222200003', 'buyer',   '9 MG Road',            'Bengaluru', 'Karnataka', '560025', 'India'),
(11, 'Sneha Reddy',     'buyer4@flipmycart.com',   '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9222200004', 'buyer',   '18 Jubilee Hills',     'Hyderabad', 'Telangana', '500033', 'India'),
(12, 'Vikram Singh',    'buyer5@flipmycart.com',   '$2b$10$SpQY2mAsgID7Q27Jb9DV5OBi72rCcibEwu/HfBxH3WTgcPv./MHG2', '9222200005', 'buyer',   '5 Civil Lines',        'Jaipur',    'Rajasthan', '302001', 'India');

-- ------------------------------------------------------------------
-- SELLERS  (seller4 has NOT completed onboarding -> pending)
-- ------------------------------------------------------------------
INSERT INTO sellers (seller_id, user_id, business_name, business_description, gst_number, onboarding_status, onboarding_fee, rating_avg) VALUES
(1, 4, 'TechHub Electronics', 'Electronics, laptops, mobiles and accessories.', '29ABCDE1234F1Z5', 'paid',    999.00, 4.30),
(2, 5, 'Fashion Point',       'Trendy clothing and footwear for men and women.', '24FGHIJ5678K1Z2', 'paid',    999.00, 4.10),
(3, 6, 'HomeEssentials',      'Home, kitchen and lifestyle products.',           '33LMNOP9012Q1Z9', 'paid',    999.00, 4.50),
(4, 7, 'NewSeller Store',     'Newly registered seller, onboarding in progress.', NULL,               'pending', 999.00, 0.00);

-- ------------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------------
INSERT INTO categories (category_id, name, slug, description) VALUES
(1, 'Electronics',    'electronics',     'Laptops, audio, wearables and gadgets'),
(2, 'Mobiles',        'mobiles',         'Smartphones and mobile accessories'),
(3, 'Clothing',       'clothing',        'Men''s and women''s apparel'),
(4, 'Footwear',       'footwear',        'Shoes and sandals'),
(5, 'Home & Kitchen', 'home-kitchen',    'Home, kitchen and lifestyle products'),
(6, 'Books',          'books',           'Books and educational material');

-- ------------------------------------------------------------------
-- PRODUCTS  (seller4's products remain 'draft' -> onboarding not paid)
-- ------------------------------------------------------------------
INSERT INTO products (product_id, seller_id, category_id, name, description, price, stock_quantity, status) VALUES
(1,  1, 2, 'FlipPhone X12 5G',              '6.5" AMOLED, 5G smartphone with triple camera.',           24999.00, 50,  'active'),
(2,  1, 2, 'Nova Smartphone 128GB',         'Reliable everyday smartphone, 128GB storage.',              15999.00, 80,  'active'),
(3,  1, 1, 'UltraBook Pro 14 Laptop',       '14" thin and light laptop for work and study.',             54999.00, 20,  'active'),
(4,  1, 1, 'SoundWave Bluetooth Headphones','Over-ear wireless headphones, 30 hour battery.',              1999.00, 150, 'active'),
(5,  1, 1, 'SmartWatch Fit 2',              'Fitness tracking smartwatch with heart-rate monitor.',        3499.00, 60,  'active'),
(6,  2, 3, 'Men''s Cotton Casual Shirt',    'Breathable 100% cotton casual shirt.',                         799.00, 200, 'active'),
(7,  2, 3, 'Women''s Printed Kurti',        'Comfortable printed cotton kurti.',                            899.00, 150, 'active'),
(8,  2, 4, 'Running Sports Shoes',          'Lightweight cushioned running shoes.',                        1899.00, 100, 'active'),
(9,  2, 3, 'Denim Jacket Unisex',           'Classic blue denim jacket.',                                  1499.00, 70,  'active'),
(10, 3, 5, 'Non-Stick Cookware Set',        '5-piece non-stick cookware set.',                             2499.00, 40,  'active'),
(11, 3, 5, 'Electric Kettle 1.5L',          'Stainless steel electric kettle, auto shut-off.',              999.00, 90,  'active'),
(12, 3, 5, 'LED Table Lamp',                'Adjustable brightness LED study lamp.',                        649.00, 5,   'active'),
(13, 3, 6, 'The Data Structures Handbook',  'Comprehensive guide to data structures & algorithms.',         399.00, 0,   'active'),
(14, 4, 2, 'BudgetPhone Lite',              'Affordable entry-level smartphone.',                          8999.00, 30,  'draft'),
(15, 4, 1, 'Wireless Mouse Combo',          'Wireless keyboard and mouse combo.',                           599.00, 25,  'draft');

-- ------------------------------------------------------------------
-- CARTS / CART ITEMS
-- ------------------------------------------------------------------
INSERT INTO carts (cart_id, user_id) VALUES
(1, 8), (2, 9), (3, 10), (4, 11), (5, 12);

INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(2, 5, 1),
(2, 9, 2),
(3, 12, 1);

-- ------------------------------------------------------------------
-- WISHLISTS
-- ------------------------------------------------------------------
INSERT INTO wishlists (user_id, product_id) VALUES
(8, 3), (8, 7), (9, 1), (10, 4), (11, 8);

-- ------------------------------------------------------------------
-- ORDERS / ORDER_ITEMS / PAYMENTS
-- ------------------------------------------------------------------
INSERT INTO orders (order_id, user_id, total_amount, status, shipping_address, created_at) VALUES
(1, 8,  28997.00, 'delivered',  '101 Green Park, Delhi, Delhi, 110016, India',      '2026-06-10 10:15:00'),
(2, 9,  3497.00,  'shipped',    '22 Lake View Road, Ahmedabad, Gujarat, 380001, India', '2026-07-02 14:20:00'),
(3, 10, 15999.00, 'processing', '9 MG Road, Bengaluru, Karnataka, 560025, India',   '2026-08-05 09:00:00'),
(4, 8,  3498.00,  'placed',     '101 Green Park, Delhi, Delhi, 110016, India',      '2026-08-20 18:45:00'),
(5, 11, 2697.00,  'cancelled',  '18 Jubilee Hills, Hyderabad, Telangana, 500033, India', '2026-07-15 11:30:00'),
(6, 12, 54999.00, 'delivered',  '5 Civil Lines, Jaipur, Rajasthan, 302001, India',  '2026-06-25 16:10:00');

INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity, line_total, item_status) VALUES
(1, 1, 1, 'FlipPhone X12 5G',               24999.00, 1, 24999.00, 'delivered'),
(1, 4, 1, 'SoundWave Bluetooth Headphones',  1999.00, 2,  3998.00, 'delivered'),
(2, 6, 2, 'Men''s Cotton Casual Shirt',        799.00, 2,  1598.00, 'shipped'),
(2, 8, 2, 'Running Sports Shoes',            1899.00, 1,  1899.00, 'shipped'),
(3, 2, 1, 'Nova Smartphone 128GB',          15999.00, 1, 15999.00, 'processing'),
(4, 10,3, 'Non-Stick Cookware Set',          2499.00, 1,  2499.00, 'placed'),
(4, 11,3, 'Electric Kettle 1.5L',             999.00, 1,   999.00, 'placed'),
(5, 7, 2, 'Women''s Printed Kurti',            899.00, 3,  2697.00, 'cancelled'),
(6, 3, 1, 'UltraBook Pro 14 Laptop',        54999.00, 1, 54999.00, 'delivered');

INSERT INTO payments (order_id, user_id, amount, method, status, transaction_ref, created_at) VALUES
(1, 8,  28997.00, 'mock_card',  'successful', 'TXN-ORD-0001', '2026-06-10 10:16:00'),
(2, 9,  3497.00,  'mock_upi',   'successful', 'TXN-ORD-0002', '2026-07-02 14:21:00'),
(3, 10, 15999.00, 'mock_card',  'successful', 'TXN-ORD-0003', '2026-08-05 09:01:00'),
(4, 8,  3498.00,  'mock_wallet','successful', 'TXN-ORD-0004', '2026-08-20 18:46:00'),
(5, 11, 2697.00,  'mock_card',  'failed',     'TXN-ORD-0005', '2026-07-15 11:31:00'),
(6, 12, 54999.00, 'mock_upi',   'successful', 'TXN-ORD-0006', '2026-06-25 16:11:00');

-- ------------------------------------------------------------------
-- SELLER ONBOARDING PAYMENTS (seller4 has none -> still pending)
-- ------------------------------------------------------------------
INSERT INTO seller_onboarding_payments (seller_id, amount, method, status, transaction_ref, created_at) VALUES
(1, 999.00, 'mock_card', 'successful', 'TXN-ONB-0001', '2026-01-05 09:00:00'),
(2, 999.00, 'mock_upi',  'successful', 'TXN-ONB-0002', '2026-01-10 09:00:00'),
(3, 999.00, 'mock_card', 'successful', 'TXN-ONB-0003', '2026-01-15 09:00:00'),
(4, 999.00, 'mock_card', 'failed',     'TXN-ONB-0004', '2026-08-01 09:00:00');

-- ------------------------------------------------------------------
-- SUPPORT TICKETS
-- ------------------------------------------------------------------
INSERT INTO support_tickets (user_id, assigned_to, subject, description, category, status, priority, resolution_notes, created_at) VALUES
(8,  2, 'Order not yet delivered',        'My order #1 was supposed to arrive last week.', 'order',   'resolved', 'medium', 'Confirmed delivery with courier; resolved.', '2026-06-18 12:00:00'),
(9,  3, 'Payment deducted twice',         'I was charged twice for order #2.',              'payment', 'in_progress','high', NULL, '2026-07-03 08:30:00'),
(10, NULL, 'Product quality issue',       'Received item does not match the description.',  'product', 'open',      'medium', NULL, '2026-08-06 10:00:00'),
(11, 2, 'Seller not responding',         'I messaged the seller about order #5 but no reply.', 'seller', 'closed', 'low', 'Seller contacted, buyer informed.', '2026-07-16 09:00:00');

SET FOREIGN_KEY_CHECKS = 1;
