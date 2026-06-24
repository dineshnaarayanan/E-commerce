import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all customers (Admin view)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
