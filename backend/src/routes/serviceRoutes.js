import express from 'express';
import { Service, Category } from '../models.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('category');
    res.json(services);
  } catch (err) {
    console.error("Fetch services error:", err.message);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get all categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

export default router;
