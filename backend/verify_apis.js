import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Schema imports
import Admin from './models/Admin.js';
import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import BankTransaction from './models/BankTransaction.js';

// Resolve directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('\n✗ API Verification Failed: MONGODB_URI is not set in backend/.env!');
  console.log('Please copy backend/.env.example to backend/.env and populate it with a valid MongoDB Atlas connection string.\n');
  process.exit(1);
}

async function runVerification() {
  console.log('Starting MongoDB Atlas connection verification...');
  try {
    await mongoose.connect(uri);
    console.log('✓ Successfully connected to MongoDB Atlas Cloud Database.');

    // 1. Verify Admin Seed
    const admin = await Admin.findOne({ username: 'dinesh' });
    if (admin) {
      console.log(`✓ Admin Verification: Found default admin "${admin.name}" (${admin.username}).`);
    } else {
      console.warn('⚠ Admin Verification: Default admin "dinesh" not found. Need seeding.');
    }

    // 2. Verify Product Inventory
    const prodCount = await Product.countDocuments();
    console.log(`✓ Product Inventory: Found ${prodCount} products in database.`);

    // 3. Verify Customer Records
    const custCount = await Customer.countDocuments();
    console.log(`✓ Customer Registry: Found ${custCount} customers in database.`);

    // 4. Verify Order Ledger
    const ordCount = await Order.countDocuments();
    console.log(`✓ Invoice Orders: Found ${ordCount} total orders in database.`);

    // 5. Verify Bank Statement Ledger
    const btCount = await BankTransaction.countDocuments();
    console.log(`✓ Bank Transactions Ledger: Found ${btCount} pre-seeded transactions.`);

    console.log('\n======================================');
    console.log('✓ ECOSYSTEM DATABASE VERIFICATION SUCCESSFUL!');
    console.log('======================================\n');
  } catch (err) {
    console.error('\n✗ Database Connection Verification Failed:', err.message);
    console.log('Check your MONGODB_URI or firewall access permissions on MongoDB Atlas.');
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
