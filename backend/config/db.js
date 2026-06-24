import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Admin from '../models/Admin.js';
import BankTransaction from '../models/BankTransaction.js';

// Setup global database type flag
global.useJSONDb = false;

const MOCK_PRODUCTS = [
  {
    id: "p1",
    title: "Apex Sounder Wireless Headphones",
    category: "Electronics",
    price: 199.99,
    comparePrice: 249.99,
    stock: 45,
    status: "Active",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    description: "Premium active noise-cancelling headphones featuring 40 hours of battery life, spatial audio support, and ergonomic memory foam cups for long listening sessions."
  },
  {
    id: "p2",
    title: "Chrono Minimalist Leather Watch",
    category: "Accessories",
    price: 149.00,
    comparePrice: 189.00,
    stock: 12,
    status: "Active",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    description: "Elegant quartz movement wrist watch fitted with a genuine Italian brown leather strap, water-resistant casing, and minimalist surgical-grade steel dial."
  },
  {
    id: "p3",
    title: "Nomad Waterproof Trail Backpack",
    category: "Travel & Outdoors",
    price: 89.50,
    comparePrice: 110.00,
    stock: 3,
    status: "Active",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    description: "Highly durable, military-grade ballistic nylon backpack featuring waterproof roll-top closures, laptop security sleeve, and custom ergonomic lumbar support frame."
  },
  {
    id: "p4",
    title: "KeyPro Mechanical RGB Keyboard",
    category: "Electronics",
    price: 129.99,
    comparePrice: 149.99,
    stock: 22,
    status: "Active",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
    description: "Hot-swappable tactile linear switches with double-shot PBT keycaps, fully customizable per-key RGB backlighting, and a multi-device wireless connection toggle."
  },
  {
    id: "p5",
    title: "ErgoFlow Mesh Office Chair",
    category: "Furniture",
    price: 249.99,
    comparePrice: 299.99,
    stock: 15,
    status: "Draft",
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=80",
    description: "Fully adjustable ergonomic desk chair featuring breathable elastic mesh, adjustable 3D armrests, dynamic lumbar support, and heavy-duty nylon wheels."
  },
  {
    id: "p6",
    title: "Vitals Pro Smart Health Watch",
    category: "Electronics",
    price: 179.99,
    comparePrice: 199.99,
    stock: 0,
    status: "Active",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80",
    description: "Comprehensive health and fitness wearable monitor with real-time heart rate sensor, blood oxygen tracker, sleep analysis, built-in GPS, and 10-day battery life."
  },
  {
    id: "p7",
    title: "Apex Sprint Lightweight Running Shoes",
    category: "Footwear",
    price: 110.00,
    comparePrice: 135.00,
    stock: 35,
    status: "Active",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    description: "Advanced performance running trainers utilizing a responsive carbon fiber plate, high-traction rubber outer treads, and breathable seamless flyknit uppers."
  },
  {
    id: "p8",
    title: "Organic Lavender Scented Candle",
    category: "Home Decor",
    price: 24.99,
    comparePrice: 29.99,
    stock: 80,
    status: "Active",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80",
    description: "Relaxing aromatherapy candle hand-poured with natural organic soy wax, pure lavender essential oil extract, and a wooden wick that crackles softly when lit."
  }
];

const MOCK_CUSTOMERS = [
  {
    id: "c1",
    name: "Eleanor Vance",
    email: "eleanor.vance@example.com",
    phone: "+1 (555) 019-2834",
    location: "Portland, OR, USA",
    password: "password123",
    orderCount: 3,
    totalSpent: 474.96
  },
  {
    id: "c2",
    name: "Marcus Aurelius",
    email: "marcus.aurelius@example.com",
    phone: "+1 (555) 124-7762",
    location: "New York, NY, USA",
    password: "password123",
    orderCount: 2,
    totalSpent: 328.99
  },
  {
    id: "c3",
    name: "Sophia Lin",
    email: "sophia.lin@example.com",
    phone: "+1 (555) 892-1209",
    location: "San Francisco, CA, USA",
    password: "password123",
    orderCount: 1,
    totalSpent: 110.00
  },
  {
    id: "c4",
    name: "David Koomson",
    email: "david.koomson@example.com",
    phone: "+1 (555) 431-9028",
    location: "Houston, TX, USA",
    password: "password123",
    orderCount: 1,
    totalSpent: 129.99
  },
  {
    id: "c5",
    name: "Isabella Rossi",
    email: "isabella.rossi@example.com",
    phone: "+1 (555) 302-8817",
    location: "Miami, FL, USA",
    password: "password123",
    orderCount: 1,
    totalSpent: 89.50
  }
];

const MOCK_ORDERS = [
  {
    id: "1001",
    customerId: "c2",
    date: new Date("2026-06-17T11:42:00Z"),
    status: "Delivered",
    paymentMethod: "Credit Card (Ending 4211)",
    paymentDetails: {
      verificationStatus: "Verified",
      verifiedAt: new Date("2026-06-17T12:00:00Z"),
      verifiedBy: "System"
    },
    shipping: 10.00,
    tax: 12.00,
    subtotal: 149.00,
    total: 171.00,
    items: [
      { productId: "p2", title: "Chrono Minimalist Leather Watch", price: 149.00, quantity: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "DHL",
      trackingId: "DHL-827361-NY",
      status: "Delivered",
      timeline: [
        { status: "Processing", date: new Date("2026-06-17T12:00:00Z"), desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: new Date("2026-06-17T16:30:00Z"), desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: new Date("2026-06-18T09:15:00Z"), desc: "Arrived at courier sorting facility in NY.", completed: true },
        { status: "Out for Delivery", date: new Date("2026-06-19T08:00:00Z"), desc: "Dispatched with local delivery runner.", completed: true },
        { status: "Delivered", date: new Date("2026-06-19T14:22:00Z"), desc: "Parcel delivered and signed for by client.", completed: true }
      ]
    }
  },
  {
    id: "1002",
    customerId: "c1",
    date: new Date("2026-06-20T08:12:00Z"),
    status: "Payment Verification Pending",
    paymentMethod: "PayPal (eleanor@example.com)",
    paymentDetails: {
      verificationStatus: "Unverified"
    },
    shipping: 0.00,
    tax: 18.00,
    subtotal: 224.98,
    total: 242.98,
    items: [
      { productId: "p1", title: "Apex Sounder Wireless Headphones", price: 199.99, quantity: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
      { productId: "p8", title: "Organic Lavender Scented Candle", price: 24.99, quantity: 1, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "FedEx",
      trackingId: "FX-83749-US",
      status: "Processing",
      timeline: [
        { status: "Processing", date: new Date("2026-06-20T08:30:00Z"), desc: "Order details verified & approved by merchant.", completed: true }
      ]
    }
  },
  {
    id: "1003",
    customerId: "c3",
    date: new Date("2026-06-21T14:30:00Z"),
    status: "Shipped",
    paymentMethod: "Apple Pay",
    paymentDetails: {
      verificationStatus: "Verified",
      verifiedAt: new Date("2026-06-21T15:00:00Z"),
      verifiedBy: "System"
    },
    shipping: 5.00,
    tax: 8.80,
    subtotal: 110.00,
    total: 123.80,
    items: [
      { productId: "p7", title: "Apex Sprint Lightweight Running Shoes", price: 110.00, quantity: 1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "UPS",
      trackingId: "UPS-928174-CA",
      status: "In Transit",
      timeline: [
        { status: "Processing", date: new Date("2026-06-21T15:00:00Z"), desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: new Date("2026-06-21T18:45:00Z"), desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: new Date("2026-06-22T10:11:00Z"), desc: "Consignment arrived at international airport terminal.", completed: true }
      ]
    }
  },
  {
    id: "1004",
    customerId: "c4",
    date: new Date("2026-06-22T09:15:00Z"),
    status: "Delivered",
    paymentMethod: "Credit Card (Ending 1098)",
    paymentDetails: {
      verificationStatus: "Verified",
      verifiedAt: new Date("2026-06-22T09:30:00Z"),
      verifiedBy: "System"
    },
    shipping: 8.00,
    tax: 10.40,
    subtotal: 129.99,
    total: 148.39,
    items: [
      { productId: "p4", title: "KeyPro Mechanical RGB Keyboard", price: 129.99, quantity: 1, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "USPS",
      trackingId: "US-716492-TX",
      status: "Delivered",
      timeline: [
        { status: "Processing", date: new Date("2026-06-22T09:30:00Z"), desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: new Date("2026-06-22T13:00:00Z"), desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: new Date("2026-06-22T21:40:00Z"), desc: "Processed through regional logistics center.", completed: true },
        { status: "Out for Delivery", date: new Date("2026-06-23T07:15:00Z"), desc: "Dispatched with local delivery runner.", completed: true },
        { status: "Delivered", date: new Date("2026-06-23T11:05:00Z"), desc: "Parcel delivered and signed for by client.", completed: true }
      ]
    }
  },
  {
    id: "1005",
    customerId: "c5",
    date: new Date("2026-06-23T07:10:00Z"),
    status: "Cancelled",
    paymentMethod: "Credit Card (Ending 8847)",
    paymentDetails: {
      verificationStatus: "Failed",
      verifiedAt: new Date("2026-06-23T07:15:00Z"),
      verifiedBy: "System"
    },
    shipping: 5.00,
    tax: 7.16,
    subtotal: 89.50,
    total: 101.66,
    items: [
      { productId: "p3", title: "Nomad Waterproof Trail Backpack", price: 89.50, quantity: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "Unassigned",
      trackingId: "N/A",
      status: "Processing",
      timeline: [
        { status: "Processing", date: new Date("2026-06-23T07:15:00Z"), desc: "Order cancelled by client before logistics shipment.", completed: false }
      ]
    }
  },
  {
    id: "1006",
    customerId: "c2",
    date: new Date("2026-06-23T12:05:00Z"),
    status: "Payment Verification Pending",
    paymentMethod: "UPI",
    paymentDetails: {
      utrNumber: "777788889999",
      verificationStatus: "Unverified"
    },
    shipping: 10.00,
    tax: 14.40,
    subtotal: 179.99,
    total: 204.39,
    items: [
      { productId: "p6", title: "Vitals Pro Smart Health Watch", price: 179.99, quantity: 1, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "DHL",
      trackingId: "DHL-1006-US",
      status: "Processing",
      timeline: [
        { status: "Processing", date: new Date("2026-06-23T12:15:00Z"), desc: "Order details verified & approved by merchant.", completed: true }
      ]
    }
  }
];

const MOCK_BANK_TRANSACTIONS = [
  { utrNumber: "123456789012", senderName: "Alice Smith", amount: 199.99 },
  { utrNumber: "987654321098", senderName: "Bob Johnson", amount: 149.00 },
  { utrNumber: "111122223333", senderName: "Charlie Davis", amount: 89.50 },
  { utrNumber: "444455556666", senderName: "Diana Prince", amount: 129.99 },
  { utrNumber: "777788889999", senderName: "Ethan Hunt", amount: 204.39 },
  { utrNumber: "121212121212", senderName: "Bruce Wayne", amount: 110.00 },
  { utrNumber: "343434343434", senderName: "Tony Stark", amount: 179.99 },
  { utrNumber: "999999999999", senderName: "Clark Kent", amount: 123.80 },
  { utrNumber: "555555555555", senderName: "Barry Allen", amount: 50.00 },
  { utrNumber: "888888888888", senderName: "Peter Parker", amount: 100.00 }
];

export async function seedDatabase() {
  try {
    // 1. Seed Admin dinesh/dinesh@2005
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "dinesh",
        password: "dinesh@2005",
        name: "Dinesh"
      });
      console.log('✓ Seeded Admin profile: dinesh / dinesh@2005');
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(MOCK_PRODUCTS);
      console.log(`✓ Seeded ${MOCK_PRODUCTS.length} products`);
    }

    // 3. Seed Customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      await Customer.insertMany(MOCK_CUSTOMERS);
      console.log(`✓ Seeded ${MOCK_CUSTOMERS.length} customers`);
    }

    // 4. Seed Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(MOCK_ORDERS);
      console.log(`✓ Seeded ${MOCK_ORDERS.length} orders`);
    }

    // 5. Seed Bank Ledger
    const bankCount = await BankTransaction.countDocuments();
    if (bankCount === 0) {
      await BankTransaction.insertMany(MOCK_BANK_TRANSACTIONS);
      console.log(`✓ Seeded ${MOCK_BANK_TRANSACTIONS.length} incoming bank transactions`);
    }
  } catch (error) {
    console.error('✗ Failed to seed database:', error);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.warn('\n⚠ MONGODB_URI is not set to an Atlas connection in backend/.env.');
    console.warn('⚠ Gracefully starting database in LOCAL JSON file fallback mode...');
    global.useJSONDb = true;
    await seedDatabase();
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB Atlas Cloud');
    await seedDatabase();
  } catch (err) {
    console.warn('\n✗ MongoDB Connection Error:', err.message);
    console.warn('⚠ Gracefully starting database in LOCAL JSON file fallback mode...');
    global.useJSONDb = true;
    await seedDatabase();
  }
}
