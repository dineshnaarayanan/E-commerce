import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route Imports
import adminAuthRoutes from './routes/adminAuth.js';
import customerAuthRoutes from './routes/customerAuth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import systemRoutes from './routes/system.js';

// Load Environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Route Registration
app.use('/api/auth', adminAuthRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/system', systemRoutes);

// Simple Status Route
app.get('/status', (req, res) => {
  res.json({ status: 'online', database: 'mongodb_atlas' });
});

// Start DB & Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Freakes Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
});
