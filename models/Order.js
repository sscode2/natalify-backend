import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: {
        type: String,
        required: true
      },
      area: String,
      city: {
        type: String,
        required: true
      },
      district: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Bangladesh'
      }
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String, // Store name for record keeping
    productImage: String, // Store image for record keeping
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Stripe', 'bKash', 'Nagad', 'Bank Transfer'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentIntentId: String, // For Stripe
    bkashTransactionId: String, // For bKash
    paymentDate: Date,
    amount: Number,
    currency: {
      type: String,
      default: 'BDT'
    },
    gatewayResponse: Object // Store raw response from payment gateway
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  trackingInfo: {
    trackingNumber: String,
    courier: String,
    trackingUrl: String
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `NTF${String(count + 1).padStart(6, '0')}`;
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: 'Order created'
    });
  }
  next();
});

// Index for efficient queries
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model('Order', orderSchema);