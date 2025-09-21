import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customer, items, notes } = req.body;

    // Validate required fields
    if (!customer.name || !customer.phone || !customer.address.street || !customer.address.city) {
      return res.status(400).json({ message: 'Missing required customer information' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Validate and calculate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0]?.url || '',
        quantity: item.quantity,
        price: itemPrice,
        totalPrice: itemTotal
      });
      
      totalAmount += itemTotal;
    }

    // Create order
    const order = new Order({
      customer,
      items: orderItems,
      totalAmount,
      notes,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get order by order number
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name images category')
      .select('-__v');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Get order by phone number (for customer to check their orders)
router.get('/customer/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.phone': req.params.phone })
      .select('orderNumber totalAmount orderStatus createdAt estimatedDelivery')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;