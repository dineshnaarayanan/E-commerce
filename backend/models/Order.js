import mongoose from 'mongoose';
import { JSONModel } from './fallback.js';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true }
});

const courierTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  desc: { type: String, default: '' },
  completed: { type: Boolean, default: false }
});

const courierSchema = new mongoose.Schema({
  partner: { type: String, default: 'Unassigned' },
  trackingId: { type: String, default: 'N/A' },
  status: { type: String, default: 'Processing' },
  timeline: [courierTimelineSchema]
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['Payment Verification Pending', 'Confirmed', 'Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Payment Verification Pending' 
  },
  paymentMethod: { type: String, required: true },
  paymentDetails: {
    razorpayPaymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    utrNumber: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['Unverified', 'Verified', 'Failed'], default: 'Unverified' },
    verifiedAt: { type: Date },
    verifiedBy: { type: String }
  },
  shipping: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  items: [orderItemSchema],
  courier: { type: courierSchema, default: () => ({}) }
}, { timestamps: true });

const MongooseOrder = mongoose.model('Order', orderSchema);
const jsonOrder = new JSONModel('Order');

const Order = {
  find: (query) => global.useJSONDb ? jsonOrder.find(query) : MongooseOrder.find(query),
  findOne: (query) => global.useJSONDb ? jsonOrder.findOne(query) : MongooseOrder.findOne(query),
  countDocuments: () => global.useJSONDb ? jsonOrder.countDocuments() : MongooseOrder.countDocuments(),
  insertMany: (items) => global.useJSONDb ? jsonOrder.insertMany(items) : MongooseOrder.insertMany(items),
  create: (item) => global.useJSONDb ? jsonOrder.create(item) : MongooseOrder.create(item),
  findOneAndDelete: (query) => global.useJSONDb ? jsonOrder.findOneAndDelete(query) : MongooseOrder.findOneAndDelete(query)
};

export default Order;
