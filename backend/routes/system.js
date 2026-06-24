import express from 'express';
import mongoose from 'mongoose';
import { seedDatabase } from '../config/db.js';

const router = express.Router();

// Reset database to initial mock seeds
router.post('/reset', async (req, res) => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('Database cleared for reset.');
    await seedDatabase();
    res.json({ success: true, message: 'Database reset to mock defaults successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database reset failed: ' + err.message });
  }
});

// Clear database completely (wipe everything)
router.post('/clear', async (req, res) => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    res.json({ success: true, message: 'All database collections wiped successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Wiping database failed: ' + err.message });
  }
});

export default router;
