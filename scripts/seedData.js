import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Samsung Galaxy A54 5G',
    description: 'Stunning 6.4-inch Super AMOLED display with 120Hz refresh rate. Powerful 50MP triple camera system for amazing photography. 5000mAh battery for all-day use.',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    category: 'Electronics',
    subcategory: 'Smartphones',
    images: [
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'Samsung Galaxy A54' }
    ],
    stock: 25,
    features: ['5G Connectivity', 'Triple Camera', '120Hz Display', 'Fast Charging'],
    tags: ['samsung', 'smartphone', '5g', 'android'],
    isFeatured: true,
    specifications: {
      'Display': '6.4-inch Super AMOLED',
      'RAM': '8GB',
      'Storage': '256GB',
      'Camera': '50MP + 12MP + 5MP',
      'Battery': '5000mAh'
    }
  },
  {
    name: 'Apple iPhone 14',
    description: 'Advanced dual-camera system with Photographic Styles, Cinematic mode, and Action mode. A15 Bionic chip for lightning-fast performance.',
    price: 85000,
    originalPrice: 90000,
    discount: 5,
    category: 'Electronics',
    subcategory: 'Smartphones',
    images: [
      { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500', alt: 'iPhone 14' }
    ],
    stock: 15,
    features: ['A15 Bionic Chip', 'Dual Camera', 'Face ID', 'Wireless Charging'],
    tags: ['apple', 'iphone', 'smartphone', 'ios'],
    isFeatured: true
  },
  {
    name: 'HP Pavilion Laptop',
    description: '15.6-inch Full HD display with Intel Core i5 processor. Perfect for work, study, and entertainment. Lightweight and portable design.',
    price: 55000,
    category: 'Electronics',
    subcategory: 'Laptops',
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', alt: 'HP Pavilion Laptop' }
    ],
    stock: 10,
    features: ['Intel Core i5', '8GB RAM', '512GB SSD', 'Full HD Display'],
    tags: ['hp', 'laptop', 'computer', 'portable']
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt perfect for casual wear. Available in multiple colors and sizes.',
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    category: 'Fashion',
    subcategory: 'T-Shirts',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'Cotton T-Shirt' }
    ],
    stock: 50,
    features: ['100% Cotton', 'Machine Washable', 'Multiple Colors', 'Comfortable Fit'],
    tags: ['tshirt', 'cotton', 'casual', 'fashion'],
    isFeatured: true
  },
  {
    name: 'Denim Jeans - Slim Fit',
    description: 'High-quality denim jeans with slim fit design. Durable and comfortable for everyday wear.',
    price: 2500,
    category: 'Fashion',
    subcategory: 'Jeans',
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', alt: 'Denim Jeans' }
    ],
    stock: 30,
    features: ['Slim Fit', 'High Quality Denim', 'Multiple Sizes', 'Fade Resistant'],
    tags: ['jeans', 'denim', 'fashion', 'pants']
  },
  {
    name: 'Non-Stick Cookware Set',
    description: 'Complete 7-piece non-stick cookware set perfect for modern kitchens. Easy to clean and durable.',
    price: 3500,
    originalPrice: 4000,
    discount: 12,
    category: 'Home & Kitchen',
    subcategory: 'Cookware',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', alt: 'Cookware Set' }
    ],
    stock: 20,
    features: ['Non-Stick Coating', '7-Piece Set', 'Dishwasher Safe', 'Heat Resistant'],
    tags: ['cookware', 'kitchen', 'non-stick', 'cooking']
  },
  {
    name: 'Bluetooth Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation and long battery life. Perfect for music and calls.',
    price: 2800,
    category: 'Accessories',
    subcategory: 'Audio',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless Headphones' }
    ],
    stock: 35,
    features: ['Bluetooth 5.0', 'Noise Cancellation', '20H Battery', 'Quick Charge'],
    tags: ['headphones', 'bluetooth', 'audio', 'wireless'],
    isFeatured: true
  },
  {
    name: 'Smart Watch - Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, and smartphone notifications.',
    price: 4500,
    originalPrice: 5000,
    discount: 10,
    category: 'Accessories',
    subcategory: 'Wearables',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Smart Watch' }
    ],
    stock: 25,
    features: ['Heart Rate Monitor', 'Sleep Tracking', 'Waterproof', 'Long Battery'],
    tags: ['smartwatch', 'fitness', 'tracker', 'health'],
    isFeatured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/natalify');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted');

    // Create admin user
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || 'admin@natalify.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Natalify Admin',
      role: 'super_admin'
    });
    await admin.save();
    console.log('Admin user created');

    console.log('\\n✅ Database seeded successfully!');
    console.log('Admin credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();