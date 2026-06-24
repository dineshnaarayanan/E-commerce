import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      res.json({ success: true, admin: { username: admin.username, name: admin.name } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Profile
router.get('/profile', async (req, res) => {
  try {
    const admin = await Admin.findOne(); // Grab the primary admin
    if (admin) {
      res.json({ username: admin.username, name: admin.name });
    } else {
      res.status(404).json({ message: 'Admin profile not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  const { username, displayName, password } = req.body;
  try {
    const admin = await Admin.findOne();
    if (admin) {
      admin.username = username || admin.username;
      admin.name = displayName || admin.name;
      if (password) {
        admin.password = password;
      }
      await admin.save();
      res.json({ success: true, admin: { username: admin.username, name: admin.name } });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
