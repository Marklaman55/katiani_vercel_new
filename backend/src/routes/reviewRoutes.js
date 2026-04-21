import express from 'express';
import { Review } from '../models.js';

const router = express.Router();

// Get approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).populate('bookingId').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Create review
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error saving review' });
  }
});

export default router;
