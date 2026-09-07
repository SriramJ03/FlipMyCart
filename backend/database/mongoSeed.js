/**
 * FlipMyCart MongoDB seed script.
 * Run with:  npm run seed:mongo   (from backend/, after backend/.env is set up)
 *
 * IMPORTANT: this data intentionally references the exact same ids used in
 * backend/database/seed.sql (products 1-15, users 1-12, sellers 1-4) so the
 * two databases describe the same consistent sample dataset.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const ProductMedia = require('../models/mongodb/ProductMedia');
const ProductSpecification = require('../models/mongodb/ProductSpecification');
const ProductReview = require('../models/mongodb/ProductReview');
const Conversation = require('../models/mongodb/Conversation');
const Message = require('../models/mongodb/Message');
const UserActivity = require('../models/mongodb/UserActivity');
const Notification = require('../models/mongodb/Notification');

const PLACEHOLDER = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const productMedia = [
  { productId: 1, images: [
    { url: PLACEHOLDER('flipphone-x12-1'), altText: 'FlipPhone X12 front', isPrimary: true, sortOrder: 1 },
    { url: PLACEHOLDER('flipphone-x12-2'), altText: 'FlipPhone X12 back', isPrimary: false, sortOrder: 2 },
  ], videos: [{ url: 'https://example.com/videos/flipphone-x12.mp4', title: 'FlipPhone X12 overview', durationSeconds: 45 }] },
  { productId: 2, images: [{ url: PLACEHOLDER('nova-1'), altText: 'Nova Smartphone', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 3, images: [
    { url: PLACEHOLDER('ultrabook-1'), altText: 'UltraBook Pro open', isPrimary: true, sortOrder: 1 },
    { url: PLACEHOLDER('ultrabook-2'), altText: 'UltraBook Pro side', isPrimary: false, sortOrder: 2 },
  ], videos: [] },
  { productId: 4, images: [{ url: PLACEHOLDER('soundwave-1'), altText: 'SoundWave Headphones', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 5, images: [{ url: PLACEHOLDER('smartwatch-1'), altText: 'SmartWatch Fit 2', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 6, images: [{ url: PLACEHOLDER('shirt-1'), altText: "Men's Cotton Shirt", isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 7, images: [{ url: PLACEHOLDER('kurti-1'), altText: "Women's Kurti", isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 8, images: [{ url: PLACEHOLDER('shoes-1'), altText: 'Running Shoes', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 9, images: [{ url: PLACEHOLDER('jacket-1'), altText: 'Denim Jacket', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 10, images: [{ url: PLACEHOLDER('cookware-1'), altText: 'Cookware Set', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 11, images: [{ url: PLACEHOLDER('kettle-1'), altText: 'Electric Kettle', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 12, images: [{ url: PLACEHOLDER('lamp-1'), altText: 'LED Table Lamp', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 13, images: [{ url: PLACEHOLDER('book-1'), altText: 'Data Structures Handbook cover', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 14, images: [{ url: PLACEHOLDER('budgetphone-1'), altText: 'BudgetPhone Lite', isPrimary: true, sortOrder: 1 }], videos: [] },
  { productId: 15, images: [{ url: PLACEHOLDER('mouse-1'), altText: 'Wireless Mouse Combo', isPrimary: true, sortOrder: 1 }], videos: [] },
];

const productSpecifications = [
  { productId: 1, categorySlug: 'mobiles', attributes: { RAM: '8GB', Storage: '128GB', Battery: '5000mAh', Camera: '64MP + 12MP + 8MP', OperatingSystem: 'Android 14', Display: '6.5" AMOLED', Network: '5G' } },
  { productId: 2, categorySlug: 'mobiles', attributes: { RAM: '6GB', Storage: '128GB', Battery: '5000mAh', Camera: '50MP + 8MP', OperatingSystem: 'Android 14', Display: '6.4" IPS LCD', Network: '4G' } },
  { productId: 3, categorySlug: 'electronics', attributes: { Processor: 'Intel Core i5 13th Gen', RAM: '16GB', Storage: '512GB SSD', Display: '14" FHD IPS', GraphicsCard: 'Integrated', BatteryLife: 'Up to 10 hours' } },
  { productId: 4, categorySlug: 'electronics', attributes: { Type: 'Over-ear', BatteryLife: '30 hours', Connectivity: 'Bluetooth 5.2', NoiseCancellation: true, Weight: '250g' } },
  { productId: 5, categorySlug: 'electronics', attributes: { DisplayType: 'AMOLED', BatteryLife: '7 days', WaterResistance: '5 ATM', Sensors: ['Heart Rate', 'SpO2', 'Accelerometer'] } },
  { productId: 6, categorySlug: 'clothing', attributes: { Size: ['S', 'M', 'L', 'XL'], Color: 'Sky Blue', Material: '100% Cotton', Brand: 'FlipMyCart Basics', Fit: 'Regular' } },
  { productId: 7, categorySlug: 'clothing', attributes: { Size: ['S', 'M', 'L', 'XL', 'XXL'], Color: 'Maroon Print', Material: 'Cotton Blend', Brand: 'Fashion Point', Fit: 'A-line' } },
  { productId: 8, categorySlug: 'footwear', attributes: { Size: ['6', '7', '8', '9', '10'], Color: 'Black/White', Material: 'Mesh + Rubber Sole', Brand: 'Fashion Point', Type: 'Running' } },
  { productId: 9, categorySlug: 'clothing', attributes: { Size: ['M', 'L', 'XL'], Color: 'Blue', Material: 'Denim', Brand: 'Fashion Point', Fit: 'Regular' } },
  { productId: 10, categorySlug: 'home-kitchen', attributes: { Pieces: 5, Material: 'Aluminium with Non-Stick Coating', InductionCompatible: true, Warranty: '1 Year' } },
  { productId: 11, categorySlug: 'home-kitchen', attributes: { Capacity: '1.5L', Material: 'Stainless Steel', Wattage: '1500W', AutoShutOff: true } },
  { productId: 12, categorySlug: 'home-kitchen', attributes: { LightType: 'LED', BrightnessLevels: 3, PowerSource: 'USB / Adapter', Color: 'White' } },
  { productId: 13, categorySlug: 'books', attributes: { Author: 'FlipMyCart Editorial Team', Pages: 420, Language: 'English', Format: 'Paperback', Publisher: 'FMC Press' } },
  { productId: 14, categorySlug: 'mobiles', attributes: { RAM: '4GB', Storage: '64GB', Battery: '4000mAh', Camera: '13MP', OperatingSystem: 'Android 13' } },
  { productId: 15, categorySlug: 'electronics', attributes: { Connectivity: 'Wireless 2.4GHz', BatteryLife: '12 months (mouse) / 24 months (keyboard)', Compatibility: ['Windows', 'macOS', 'Linux'] } },
];

const productReviews = [
  { productId: 1, userId: 8, userName: 'Rahul Sharma', rating: 5, reviewText: 'Excellent camera and battery life, very happy with this purchase.' },
  { productId: 1, userId: 9, userName: 'Priya Patel', rating: 4, reviewText: 'Great phone, slightly heavy but performance is solid.' },
  { productId: 2, userId: 10, userName: 'Amit Kumar', rating: 4, reviewText: 'Good value for money smartphone.' },
  { productId: 3, userId: 12, userName: 'Vikram Singh', rating: 5, reviewText: 'Perfect laptop for coding and everyday work.' },
  { productId: 4, userId: 8, userName: 'Rahul Sharma', rating: 4, reviewText: 'Comfortable and great sound quality.' },
  { productId: 6, userId: 9, userName: 'Priya Patel', rating: 5, reviewText: 'Very comfortable fabric, true to size.' },
  { productId: 8, userId: 9, userName: 'Priya Patel', rating: 3, reviewText: 'Decent shoes but sizing runs a little small.' },
  { productId: 7, userId: 11, userName: 'Sneha Reddy', rating: 2, reviewText: 'Color faded slightly after first wash.' },
  { productId: 13, userId: 8, userName: 'Rahul Sharma', rating: 5, reviewText: 'Clear explanations, great for exam prep.' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[mongoSeed] connected to', mongoose.connection.name);

  await Promise.all([
    ProductMedia.deleteMany({}),
    ProductSpecification.deleteMany({}),
    ProductReview.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    UserActivity.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('[mongoSeed] cleared existing collections');

  await ProductMedia.insertMany(productMedia);
  await ProductSpecification.insertMany(productSpecifications);
  await ProductReview.insertMany(productReviews);
  console.log('[mongoSeed] inserted product media, specifications, reviews');

  // Conversations: buyerId/sellerUserId -> users, sellerId -> sellers, productId -> products
  const conv1 = await Conversation.create({
    buyerId: 8, sellerUserId: 4, sellerId: 1, productId: 1, productName: 'FlipPhone X12 5G',
    lastMessage: 'Sure, it ships within 2 business days.', lastMessageAt: new Date('2026-06-08T10:05:00Z'),
  });
  const conv2 = await Conversation.create({
    buyerId: 9, sellerUserId: 5, sellerId: 2, productId: 6, productName: "Men's Cotton Casual Shirt",
    lastMessage: 'Yes, size M is in stock.', lastMessageAt: new Date('2026-07-01T09:15:00Z'),
  });
  console.log('[mongoSeed] inserted conversations');

  await Message.insertMany([
    { conversationId: conv1._id, senderId: 8, message: 'Hi, does this phone ship with a charger?', createdAt: new Date('2026-06-08T10:00:00Z'), isRead: true },
    { conversationId: conv1._id, senderId: 4, message: 'Yes, a 25W charger is included in the box.', createdAt: new Date('2026-06-08T10:02:00Z'), isRead: true },
    { conversationId: conv1._id, senderId: 8, message: 'Great, how fast does it ship?', createdAt: new Date('2026-06-08T10:04:00Z'), isRead: true },
    { conversationId: conv1._id, senderId: 4, message: 'Sure, it ships within 2 business days.', createdAt: new Date('2026-06-08T10:05:00Z'), isRead: false },
    { conversationId: conv2._id, senderId: 9, message: 'Is size M available in blue?', createdAt: new Date('2026-07-01T09:10:00Z'), isRead: true },
    { conversationId: conv2._id, senderId: 5, message: 'Yes, size M is in stock.', createdAt: new Date('2026-07-01T09:15:00Z'), isRead: false },
  ]);
  console.log('[mongoSeed] inserted messages');

  await UserActivity.insertMany([
    { userId: 8, activityType: 'product_view', productId: 1, createdAt: new Date('2026-06-05T08:00:00Z') },
    { userId: 8, activityType: 'product_view', productId: 4, createdAt: new Date('2026-06-05T08:05:00Z') },
    { userId: 8, activityType: 'cart_add', productId: 4, createdAt: new Date('2026-06-05T08:06:00Z') },
    { userId: 9, activityType: 'product_search', searchQuery: 'cotton shirt', createdAt: new Date('2026-06-28T11:00:00Z') },
    { userId: 9, activityType: 'category_view', categoryId: 3, createdAt: new Date('2026-06-28T11:01:00Z') },
    { userId: 9, activityType: 'product_view', productId: 6, createdAt: new Date('2026-06-28T11:02:00Z') },
    { userId: 9, activityType: 'wishlist_add', productId: 1, createdAt: new Date('2026-06-29T09:00:00Z') },
    { userId: 10, activityType: 'product_search', searchQuery: 'laptop', createdAt: new Date('2026-08-01T13:00:00Z') },
    { userId: 10, activityType: 'product_view', productId: 3, createdAt: new Date('2026-08-01T13:01:00Z') },
    { userId: 10, activityType: 'product_view', productId: 2, createdAt: new Date('2026-08-03T15:00:00Z') },
    { userId: 11, activityType: 'product_search', searchQuery: 'shoes', createdAt: new Date('2026-07-10T10:00:00Z') },
    { userId: 11, activityType: 'product_view', productId: 8, createdAt: new Date('2026-07-10T10:01:00Z') },
    { userId: null, activityType: 'product_view', productId: 13, createdAt: new Date('2026-08-15T12:00:00Z') },
    { userId: 12, activityType: 'product_view', productId: 3, createdAt: new Date('2026-06-20T09:00:00Z') },
    { userId: 12, activityType: 'category_view', categoryId: 1, createdAt: new Date('2026-06-20T09:01:00Z') },
  ]);
  console.log('[mongoSeed] inserted user activity events');

  await Notification.insertMany([
    { userId: 8, type: 'order_update', title: 'Order Delivered', message: 'Your order #1 has been delivered.', link: '/orders/1', isRead: true, createdAt: new Date('2026-06-14T10:00:00Z') },
    { userId: 8, type: 'seller_message', title: 'New message from TechHub Electronics', message: 'Sure, it ships within 2 business days.', link: '/messages', isRead: false, createdAt: new Date('2026-06-08T10:05:00Z') },
    { userId: 9, type: 'order_update', title: 'Order Shipped', message: 'Your order #2 has shipped.', link: '/orders/2', isRead: false, createdAt: new Date('2026-07-03T09:00:00Z') },
    { userId: 9, type: 'support_update', title: 'Support ticket updated', message: 'Your ticket about a duplicate charge is in progress.', link: '/support', isRead: false, createdAt: new Date('2026-07-03T08:35:00Z') },
    { userId: 4, type: 'payment_update', title: 'Onboarding payment received', message: 'Your seller onboarding payment was successful.', link: '/seller/dashboard', isRead: true, createdAt: new Date('2026-01-05T09:01:00Z') },
    { userId: 7, type: 'payment_update', title: 'Onboarding payment failed', message: 'Your onboarding payment could not be processed. Please retry to activate products.', link: '/seller/onboarding', isRead: false, createdAt: new Date('2026-08-01T09:01:00Z') },
    { userId: 11, type: 'order_update', title: 'Order Cancelled', message: 'Your order #5 was cancelled.', link: '/orders/5', isRead: true, createdAt: new Date('2026-07-15T11:35:00Z') },
  ]);
  console.log('[mongoSeed] inserted notifications');

  console.log('[mongoSeed] done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[mongoSeed] failed:', err);
  process.exit(1);
});
