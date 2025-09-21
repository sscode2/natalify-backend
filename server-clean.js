import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'natalify-secret-key-2024';

// Auth middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Mock data for testing without MongoDB
const mockAdmin = {
  _id: 'admin1',
  username: 'admin',
  email: 'admin@natalify.com',
  password: '$2b$10$znLWFaGeRQUHdNtYgns.S.iS.KtlXQxt80DMBOmTpvXsawOAmnZM.', // password: admin123
  role: 'admin',
  name: 'Admin User',
  createdAt: new Date()
};

const mockOrders = [
  {
    _id: 'order1',
    orderNumber: 'NAT-2024-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+8801712345678',
      address: 'Dhaka, Bangladesh'
    },
    items: [
      {
        productId: '1',
        name: 'Samsung Galaxy A54 5G',
        price: 45000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
      }
    ],
    totalAmount: 45000,
    status: 'pending',
    paymentMethod: 'cod',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'order2',
    orderNumber: 'NAT-2024-002',
    customer: {
      name: 'Sarah Ahmed',
      email: 'sarah@example.com',
      phone: '+8801798765432',
      address: 'Chittagong, Bangladesh'
    },
    items: [
      {
        productId: '2',
        name: 'Premium Cotton T-Shirt',
        price: 1200,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
      }
    ],
    totalAmount: 2400,
    status: 'confirmed',
    paymentMethod: 'cod',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

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

// Payment routes
app.use('/api/payments', paymentRoutes);

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

// Admin Authentication Routes
app.post('/api/admin/login', async (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Check if user exists
  if (username !== mockAdmin.username) {
    console.log('❌ Username not found:', username);
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  console.log('✅ Username found, checking password...');
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, mockAdmin.password);
  console.log('🔑 Password check result:', isValidPassword);
  
  if (!isValidPassword) {
    console.log('❌ Invalid password');
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: mockAdmin._id, username: mockAdmin.username, role: mockAdmin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  console.log('✅ Login successful, token generated');
  
  res.json({
    message: 'Login successful',
    token,
    admin: {
      id: mockAdmin._id,
      username: mockAdmin.username,
      email: mockAdmin.email,
      name: mockAdmin.name,
      role: mockAdmin.role
    }
  });
});

// Admin Dashboard Data
app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  // Calculate statistics
  const totalProducts = mockProducts.length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const recentOrders = mockOrders.filter(order => new Date(order.createdAt) >= lastMonth);
  
  const ordersByStatus = {
    pending: mockOrders.filter(o => o.status === 'pending').length,
    confirmed: mockOrders.filter(o => o.status === 'confirmed').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length
  };
  
  res.json({
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrdersCount: recentOrders.length
    },
    ordersByStatus,
    recentOrders: mockOrders.slice(0, 5)
  });
});

// Admin Products Management
app.get('/api/admin/products', authenticateAdmin, (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  let filteredProducts = [...mockProducts];
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Category filter
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
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

// Create Product
app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const { name, description, price, originalPrice, category, stock, images, features, isFeatured } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ message: 'Name, description, price, and category are required' });
  }
  
  const newProduct = {
    _id: (mockProducts.length + 1).toString(),
    name,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    category,
    stock: Number(stock) || 0,
    images: images || [{ url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', alt: name }],
    features: features || [],
    isFeatured: Boolean(isFeatured),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProducts.push(newProduct);
  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

// Update Product
app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const productIndex = mockProducts.findIndex(p => p._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Update product
  mockProducts[productIndex] = {
    ...mockProducts[productIndex],
    ...updates,
    _id: id, // Ensure ID doesn't change
    updatedAt: new Date()
  };
  
  res.json({ message: 'Product updated successfully', product: mockProducts[productIndex] });
});

// Delete Product
app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  const productIndex = mockProducts.findIndex(p => p._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  mockProducts.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Admin Orders Management
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  let filteredOrders = [...mockOrders];
  
  // Status filter
  if (status && status !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredOrders = filteredOrders.filter(o => 
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customer.name.toLowerCase().includes(searchLower) ||
      o.customer.phone.includes(search)
    );
  }
  
  // Sort by creation date (newest first)
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  res.json({
    orders: paginatedOrders,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(filteredOrders.length / Number(limit)),
      totalOrders: filteredOrders.length,
      hasNextPage: endIndex < filteredOrders.length,
      hasPrevPage: Number(page) > 1
    }
  });
});

// Update Order Status
app.patch('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const orderIndex = mockOrders.findIndex(o => o._id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  // Update order
  mockOrders[orderIndex] = {
    ...mockOrders[orderIndex],
    status,
    notes: notes || mockOrders[orderIndex].notes,
    updatedAt: new Date()
  };
  
  res.json({ message: 'Order status updated successfully', order: mockOrders[orderIndex] });
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

// Create order
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod, notes } = req.body;
  
  console.log('📦 Order creation attempt:', { customer: customer?.name, itemsCount: items?.length, paymentMethod });
  
  if (!customer.name || !customer.phone || !customer.address || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required information' });
  }
  
  // Generate order number
  const orderNumber = `NAT-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`;
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Create new order
  const newOrder = {
    _id: `order${mockOrders.length + 1}`,
    orderNumber,
    customer: {
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address
    },
    items: items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    totalAmount,
    status: paymentMethod === 'online' ? 'pending' : 'confirmed',
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
    notes: notes || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add to mock orders
  mockOrders.push(newOrder);
  
  console.log('✅ Order created successfully:', orderNumber);
  
  res.status(201).json({
    message: 'Order created successfully',
    order: {
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status
    }
  });
});

// Error handling middleware
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