import express from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock data for testing without MongoDB
const mockProducts = [
  {
    _id: '1',
    name: 'Samsung Galaxy A54 5G',
    description: 'Stunning 6.4-inch Super AMOLED display with 120Hz refresh rate. Powerful 50MP triple camera system for amazing photography.',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    category: 'Electronics',
    images: [{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'Samsung Galaxy A54' }],
    stock: 25,
    isFeatured: true,
    features: ['5G Connectivity', 'Triple Camera', '120Hz Display', 'Fast Charging']
  },
  {
    _id: '2',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt perfect for casual wear. Available in multiple colors and sizes.',
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    category: 'Fashion',
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'Cotton T-Shirt' }],
    stock: 50,
    isFeatured: true,
    features: ['100% Cotton', 'Machine Washable', 'Multiple Colors', 'Comfortable Fit']
  },
  {
    _id: '3',
    name: 'Bluetooth Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation and long battery life. Perfect for music and calls.',
    price: 2800,
    category: 'Accessories',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless Headphones' }],
    stock: 35,
    isFeatured: true,
    features: ['Bluetooth 5.0', 'Noise Cancellation', '20H Battery', 'Quick Charge']
  },
  {
    _id: '4',
    name: 'Non-Stick Cookware Set',
    description: 'Complete 7-piece non-stick cookware set perfect for modern kitchens. Easy to clean and durable.',
    price: 3500,
    originalPrice: 4000,
    discount: 12,
    category: 'Home & Kitchen',
    images: [{ url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500', alt: 'Cookware Set' }],
    stock: 20,
    isFeatured: false,
    features: ['Non-Stick Coating', '7-Piece Set', 'Dishwasher Safe', 'Heat Resistant']
  },
  {
    _id: '5',
    name: 'Apple iPhone 14',
    description: 'Advanced dual-camera system with Photographic Styles, Cinematic mode, and Action mode. A15 Bionic chip for lightning-fast performance.',
    price: 85000,
    originalPrice: 90000,
    discount: 5,
    category: 'Electronics',
    images: [{ url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500', alt: 'iPhone 14' }],
    stock: 15,
    isFeatured: true,
    features: ['A15 Bionic Chip', 'Dual Camera', 'Face ID', 'Wireless Charging']
  },
  {
    _id: '6',
    name: 'Smart Watch - Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, and smartphone notifications.',
    price: 4500,
    originalPrice: 5000,
    discount: 10,
    category: 'Accessories',
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Smart Watch' }],
    stock: 25,
    isFeatured: true,
    features: ['Heart Rate Monitor', 'Sleep Tracking', 'Waterproof', 'Long Battery']
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BuyIn Backend is running!' });
});

// Get all products with filtering
app.get('/api/products', (req, res) => {
  const { featured, category, search, limit = 12, page = 1 } = req.query;
  let filteredProducts = [...mockProducts];
  
  // Filter by featured
  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }
  
  // Filter by category
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(filteredProducts.length / Number(limit)),
      totalProducts: filteredProducts.length,
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: Number(page) > 1
    }
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Get related products
app.get('/api/products/:id/related', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const relatedProducts = mockProducts
    .filter(p => p._id !== product._id && p.category === product.category)
    .slice(0, 4);
  
  res.json(relatedProducts);
});

// Search products
app.get('/api/products/search/:query', (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;
  
  const searchLower = query.toLowerCase();
  const searchResults = mockProducts
    .filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    )
    .slice(0, Number(limit));
  
  res.json(searchResults);
});

// Get categories
app.get('/api/products/meta/categories', (req, res) => {
  const categories = [...new Set(mockProducts.map(p => p.category))];
  res.json(categories);
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  
  console.log('Contact form submission:', { name, email, phone, subject, message });
  res.json({ message: 'Your message has been sent successfully! We will get back to you soon.' });
});

// Create order (mock)
app.post('/api/orders', (req, res) => {
  const { customer, items, notes } = req.body;
  
  if (!customer.name || !customer.phone || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required information' });
  }
  
  const orderNumber = `NTF${String(Date.now()).slice(-6)}`;
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.status(201).json({
    message: 'Order created successfully',
    order: {
      orderNumber,
      totalAmount,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BuyIn Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛍️  Products API: http://localhost:${PORT}/api/products`);
});