import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a product
router.post('/', async (req, res) => {
  const { title, category, price, comparePrice, stock, status, image, description } = req.body;
  try {
    const newId = 'p_' + Date.now();
    const product = await Product.create({
      id: newId,
      title,
      category,
      price,
      comparePrice,
      stock,
      status: status || 'Active',
      image,
      description
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { title, category, price, comparePrice, stock, status, image, description } = req.body;
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.title = title !== undefined ? title : product.title;
    product.category = category !== undefined ? category : product.category;
    product.price = price !== undefined ? price : product.price;
    product.comparePrice = comparePrice !== undefined ? comparePrice : product.comparePrice;
    product.stock = stock !== undefined ? stock : product.stock;
    product.status = status !== undefined ? status : product.status;
    product.image = image !== undefined ? image : product.image;
    product.description = description !== undefined ? description : product.description;
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
