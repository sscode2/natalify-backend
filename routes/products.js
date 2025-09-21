import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'createdAt',
      order = 'desc',
      featured 
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: skip + Number(limit) < total,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive) {
      return res.status(404).json({ message: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .limit(4)
    .select('name price images category originalPrice discount')
    .sort({ createdAt: -1 });
    
    res.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ message: 'Failed to fetch related products' });
  }
});

// Get product categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const products = await Product.find({
      $text: { $search: query },
      isActive: true
    })
    .limit(Number(limit))
    .select('name price images category')
    .sort({ score: { $meta: 'textScore' } });
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

export default router;