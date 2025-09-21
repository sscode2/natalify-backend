import express from 'express';
import Stripe from 'stripe';
import axios from 'axios';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Payment Intent Creation
router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId, metadata = {} } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ 
        message: 'Amount and order ID are required' 
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        ...metadata
      }
    });

    // Update order with payment intent
    order.paymentDetails = {
      ...order.paymentDetails,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toUpperCase()
    };
    order.paymentMethod = 'Stripe';
    order.paymentStatus = 'Processing';
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});

// Stripe Payment Confirmation
router.post('/stripe/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment Intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Find and update order
      const order = await Order.findOne({ 
        'paymentDetails.paymentIntentId': paymentIntentId 
      });

      if (order) {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Confirmed';
        order.paymentDetails.paymentDate = new Date();
        order.paymentDetails.transactionId = paymentIntent.id;
        order.paymentDetails.gatewayResponse = paymentIntent;
        
        // Add to status history
        order.statusHistory.push({
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Payment confirmed via Stripe'
        });

        await order.save();

        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          order: {
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
          }
        });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ 
        message: 'Payment not successful',
        status: paymentIntent.status 
      });
    }

  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
});

// bKash Token Generation
async function getBkashToken() {
  try {
    const response = await axios.post(`${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': process.env.BKASH_USERNAME,
        'password': process.env.BKASH_PASSWORD
      }
    });
    
    return response.data.id_token;
  } catch (error) {
    console.error('bKash token generation error:', error);
    throw error;
  }
}

// bKash Payment Creation
router.post('/bkash/create-payment', async (req, res) => {
  try {
    const { amount, orderId, callbackURL } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ 
        message: 'Amount and order ID are required' 
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get bKash token
    const token = await getBkashToken();

    // Create payment
    const paymentResponse = await axios.post(`${process.env.BKASH_BASE_URL}/tokenized/checkout/create`, {
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: order.orderNumber,
      callbackURL: callbackURL || `${process.env.FRONTEND_URL}/payment/bkash/callback`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY
      }
    });

    // Update order with bKash payment details
    order.paymentDetails = {
      ...order.paymentDetails,
      bkashTransactionId: paymentResponse.data.paymentID,
      amount: amount,
      currency: 'BDT'
    };
    order.paymentMethod = 'bKash';
    order.paymentStatus = 'Processing';
    await order.save();

    res.json({
      success: true,
      paymentID: paymentResponse.data.paymentID,
      bkashURL: paymentResponse.data.bkashURL,
      callbackURL: paymentResponse.data.callbackURL,
      successCallbackURL: paymentResponse.data.successCallbackURL,
      failureCallbackURL: paymentResponse.data.failureCallbackURL,
      cancelledCallbackURL: paymentResponse.data.cancelledCallbackURL
    });

  } catch (error) {
    console.error('bKash payment creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create bKash payment',
      error: error.response?.data || error.message 
    });
  }
});

// bKash Payment Execution
router.post('/bkash/execute-payment', async (req, res) => {
  try {
    const { paymentID } = req.body;

    if (!paymentID) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    // Get bKash token
    const token = await getBkashToken();

    // Execute payment
    const executeResponse = await axios.post(`${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`, {
      paymentID: paymentID
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY
      }
    });

    if (executeResponse.data.transactionStatus === 'Completed') {
      // Find and update order
      const order = await Order.findOne({ 
        'paymentDetails.bkashTransactionId': paymentID 
      });

      if (order) {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Confirmed';
        order.paymentDetails.paymentDate = new Date();
        order.paymentDetails.transactionId = executeResponse.data.trxID;
        order.paymentDetails.gatewayResponse = executeResponse.data;
        
        // Add to status history
        order.statusHistory.push({
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Payment confirmed via bKash'
        });

        await order.save();

        res.json({
          success: true,
          message: 'Payment executed successfully',
          transactionId: executeResponse.data.trxID,
          order: {
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
          }
        });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ 
        message: 'Payment execution failed',
        status: executeResponse.data.transactionStatus 
      });
    }

  } catch (error) {
    console.error('bKash payment execution error:', error);
    res.status(500).json({ 
      message: 'Failed to execute bKash payment',
      error: error.response?.data || error.message 
    });
  }
});

// bKash Payment Query
router.get('/bkash/query-payment/:paymentID', async (req, res) => {
  try {
    const { paymentID } = req.params;

    // Get bKash token
    const token = await getBkashToken();

    // Query payment
    const queryResponse = await axios.get(`${process.env.BKASH_BASE_URL}/tokenized/checkout/payment/status/${paymentID}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY
      }
    });

    res.json(queryResponse.data);

  } catch (error) {
    console.error('bKash payment query error:', error);
    res.status(500).json({ 
      message: 'Failed to query bKash payment',
      error: error.response?.data || error.message 
    });
  }
});

// Stripe Webhook Handler
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Find and update order
      const order = await Order.findOne({ 
        'paymentDetails.paymentIntentId': paymentIntent.id 
      });

      if (order && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Confirmed';
        order.paymentDetails.paymentDate = new Date();
        order.paymentDetails.transactionId = paymentIntent.id;
        order.paymentDetails.gatewayResponse = paymentIntent;
        
        // Add to status history
        order.statusHistory.push({
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Payment confirmed via Stripe webhook'
        });

        await order.save();
        console.log('Order updated via Stripe webhook:', order.orderNumber);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      // Find and update order
      const failedOrder = await Order.findOne({ 
        'paymentDetails.paymentIntentId': failedPayment.id 
      });

      if (failedOrder) {
        failedOrder.paymentStatus = 'Failed';
        failedOrder.paymentDetails.gatewayResponse = failedPayment;
        
        // Add to status history
        failedOrder.statusHistory.push({
          status: 'Payment Failed',
          timestamp: new Date(),
          note: 'Payment failed via Stripe webhook'
        });

        await failedOrder.save();
        console.log('Order payment failed via Stripe webhook:', failedOrder.orderNumber);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

export default router;