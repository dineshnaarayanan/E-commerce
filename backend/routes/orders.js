import express from 'express';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import BankTransaction from '../models/BankTransaction.js';

const router = express.Router();

// Get all orders (Admin view)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get orders for a specific customer (Customer History)
router.get('/customer', async (req, res) => {
  const { customerId } = req.query;
  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }
  try {
    const orders = await Order.find({ customerId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place order (Storefront Checkout)
router.post('/', async (req, res) => {
  const {
    customerId: reqCustomerId,
    name,
    email,
    phone,
    location,
    items,
    paymentMethod,
    shipping,
    tax,
    subtotal,
    total,
    razorpayPaymentId,
    utrNumber
  } = req.body;

  try {
    // 1. Identify or Create Customer
    let customer = null;
    if (reqCustomerId) {
      customer = await Customer.findOne({ id: reqCustomerId });
    }
    if (!customer && email) {
      customer = await Customer.findOne({ email });
    }

    if (!customer) {
      // Create new customer
      const newCustomerId = 'c_' + Date.now();
      customer = await Customer.create({
        id: newCustomerId,
        name,
        email,
        phone: phone || '',
        location: location || '',
        password: '',
        orderCount: 1,
        totalSpent: total
      });
    } else {
      // Update existing customer stats
      customer.phone = phone || customer.phone;
      customer.location = location || customer.location;
      customer.orderCount = (customer.orderCount || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + total;
      await customer.save();
    }

    // 2. Decrement Product Stock levels
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // 3. Generate sequential invoice Order ID starting from 1007
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextId = 1007;
    if (lastOrder) {
      const numericId = parseInt(lastOrder.id);
      if (!isNaN(numericId)) {
        nextId = numericId + 1;
      }
    }

    // 4. Create Order document
    const order = await Order.create({
      id: nextId.toString(),
      customerId: customer.id,
      date: new Date(),
      status: 'Payment Verification Pending',
      paymentMethod,
      paymentDetails: {
        razorpayPaymentId: razorpayPaymentId || '',
        utrNumber: utrNumber || '',
        verificationStatus: 'Unverified'
      },
      shipping: shipping || 0,
      tax: tax || 0,
      subtotal,
      total,
      items,
      courier: {
        partner: 'Unassigned',
        trackingId: 'N/A',
        status: 'Processing',
        timeline: [
          { status: 'Processing', date: new Date(), desc: 'Order details verified & approved by merchant.', completed: true }
        ]
      }
    });
    res.status(201).json({ success: true, orderId: order.id, order });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Reconcile and Verify Payment (Admin dashboard action)
router.post('/:id/verify-payment', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentDetails.verificationStatus === 'Verified') {
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    const method = order.paymentMethod.toLowerCase();

    if (method.includes('upi')) {
      const utr = order.paymentDetails.utrNumber;
      if (!utr) {
        return res.status(400).json({ success: false, message: 'No UTR number submitted for this UPI payment.' });
      }

      // Check simulated bank statement ledger
      const transaction = await BankTransaction.findOne({ utrNumber: utr });
      if (!transaction) {
        return res.status(400).json({ 
          success: false, 
          message: `Reconciliation Failed: UTR #${utr} was not found in the incoming bank statement log. Verification failed.` 
        });
      }

      if (transaction.isReconciled) {
        return res.status(400).json({
          success: false,
          message: `Reconciliation Warning: UTR #${utr} has already been reconciled with another order.`
        });
      }

      // Check if amount matches (tolerate small decimal differences if any)
      if (Math.abs(transaction.amount - order.total) > 1.0) {
        return res.status(400).json({
          success: false,
          message: `Reconciliation Failed: UTR #${utr} payment amount ($${transaction.amount}) does not match order total ($${order.total}).`
        });
      }

      // Reconcile successful
      transaction.isReconciled = true;
      await transaction.save();

      order.status = 'Confirmed';
      order.paymentDetails.verificationStatus = 'Verified';
      order.paymentDetails.verifiedAt = new Date();
      order.paymentDetails.verifiedBy = 'dinesh (Bank Reconciliation)';
      await order.save();

      res.json({ success: true, message: `Successfully matched UTR #${utr}! Confirmed transaction of $${transaction.amount} from ${transaction.senderName}.`, order });

    } else if (method.includes('razorpay') || method.includes('credit card') || method.includes('paypal') || method.includes('apple pay')) {
      // Razorpay / Credit card automated verification
      const rpPaymentId = order.paymentDetails.razorpayPaymentId;
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret || rpPaymentId === 'MOCK_PAYMENT_ID' || !rpPaymentId) {
        // Run simulation
        order.status = 'Confirmed';
        order.paymentDetails.verificationStatus = 'Verified';
        order.paymentDetails.verifiedAt = new Date();
        order.paymentDetails.verifiedBy = 'System (Razorpay Simulation)';
        await order.save();

        return res.json({ 
          success: true, 
          message: 'Razorpay Verification: Captured successfully (Simulated Developer Mode).', 
          order 
        });
      }

      // Real API verification
      try {
        const authHeader = 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64');
        const response = await fetch(`https://api.razorpay.com/v1/payments/${rpPaymentId}`, {
          headers: { 'Authorization': authHeader }
        });
        const data = await response.json();

        if (response.ok && data.status === 'captured') {
          order.status = 'Confirmed';
          order.paymentDetails.verificationStatus = 'Verified';
          order.paymentDetails.verifiedAt = new Date();
          order.paymentDetails.verifiedBy = 'Razorpay API';
          await order.save();

          res.json({ success: true, message: `Razorpay payment ${rpPaymentId} verified successfully.`, order });
        } else {
          res.status(400).json({ 
            success: false, 
            message: `Razorpay payment verification failed: Payment status is ${data.status || 'unknown'}` 
          });
        }
      } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to contact Razorpay API: ' + err.message });
      }

    } else {
      // Other generic methods (e.g. mock cash/drafts)
      order.status = 'Confirmed';
      order.paymentDetails.verificationStatus = 'Verified';
      order.paymentDetails.verifiedAt = new Date();
      order.paymentDetails.verifiedBy = 'dinesh (Manual)';
      await order.save();
      res.json({ success: true, message: 'Order manually verified and confirmed.', order });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Courier Shipping info
router.put('/:id/shipment', async (req, res) => {
  const { id } = req.params;
  const { partner, trackingId, status, timeline } = req.body;

  try {
    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.courier = {
      partner: partner || order.courier.partner,
      trackingId: trackingId || order.courier.trackingId,
      status: status || order.courier.status,
      timeline: timeline || order.courier.timeline
    };

    // If shipment delivered or processing, sync the global order status
    if (status === 'Delivered') {
      order.status = 'Delivered';
    } else if (status === 'Processing') {
      order.status = 'Confirmed'; // Back to confirmed
    } else if (status === 'Shipped') {
      order.status = 'Shipped';
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
