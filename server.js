import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for product images
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/natalify');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('⚠️  MongoDB not available. Running without database...');
    // Don't exit process if MongoDB is not available
  }
};

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BuyIn Backend is running!' });
});

// Mock products endpoint for testing without MongoDB
app.get('/api/products', (req, res) => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Samsung Galaxy A54 5G',
      description: 'Stunning 6.4-inch Super AMOLED display with 120Hz refresh rate.',
      price: 45000,
      originalPrice: 50000,
      discount: 10,
      category: 'Electronics',
      images: [{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'Samsung Galaxy A54' }],
      stock: 25,
      isFeatured: true
    },
    {
      _id: '2',
      name: 'Premium Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt perfect for casual wear.',
      price: 1200,
      originalPrice: 1500,
      discount: 20,
      category: 'Fashion',
      images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'Cotton T-Shirt' }],
      stock: 50,
      isFeatured: true
    },
    {
      _id: '3',
      name: 'Bluetooth Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation.',
      price: 2800,
      category: 'Accessories',
      images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless Headphones' }],
      stock: 35,
      isFeatured: true
    },
    {
      _id: '4',
      name: 'Non-Stick Cookware Set',
      description: 'Complete 7-piece non-stick cookware set perfect for modern kitchens.',
      price: 3500,
      originalPrice: 4000,
      discount: 12,
      category: 'Home & Kitchen',
      images: [{ url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500', alt: 'Cookware Set' }],
      stock: 20,
      isFeatured: false
    }
  ];
  
  const { featured, category } = req.query;
  let filteredProducts = mockProducts;
  
  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }
  
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  res.json({
    products: filteredProducts,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProducts: filteredProducts.length
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 BuyIn Backend running on port ${PORT}`);
  });
};

startServer();