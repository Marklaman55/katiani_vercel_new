import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Booking, Service, Category, Review, SystemConfig } from '../models.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'katiani-styles-secret-key';

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Using username as requested in frontend
  try {
    // We'll search by email or username, assuming email is used as username for now
    const user = await User.findOne({ email: username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- PROTECTED ROUTES ---
router.use(authMiddleware);

// Stats
router.get('/stats', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const clients = await Booking.distinct('phone');
    const totalRevenue = 0; // Logic for revenue calculation could be added here
    
    res.json({
      totalBookings,
      totalRevenue,
      pendingBookings,
      activeClients: clients.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.patch('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// Clients
router.get('/clients', async (req, res) => {
  try {
    // Aggregate bookings by phone to get client list
    const clients = await Booking.aggregate([
      {
        $group: {
          _id: "$phone",
          name: { $first: "$name" },
          email: { $first: "$email" },
          bookingCount: { $sum: 1 },
          lastBookingDate: { $max: "$createdAt" },
          updatedAt: { $max: "$updatedAt" }
        }
      },
      {
        $project: {
          _id: 1,
          phone: "$_id",
          name: 1,
          email: 1,
          bookingCount: 1,
          lastBookingDate: 1,
          updatedAt: 1
        }
      }
    ]);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

router.delete('/clients/:phone', async (req, res) => {
  try {
    await Booking.deleteMany({ phone: req.params.phone });
    res.json({ message: 'Client and their history deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting client' });
  }
});

// Services
router.post('/services', upload.array('images'), async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    const images = (req.files || []).map(file => file.path);

    const service = new Service({
      name,
      description,
      price: Number(price),
      duration,
      category: category || null,
      images
    });

    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error creating service' });
  }
});

router.patch('/services/:id', upload.array('images'), async (req, res) => {
  try {
    const { name, description, price, duration, category, existingImages } = req.body;
    const newImages = (req.files || []).map(file => file.path);
    const parsedExisting = JSON.parse(existingImages || '[]');
    
    const updateData = {
      name,
      description,
      price: Number(price),
      duration,
      category: category || null,
      images: [...parsedExisting, ...newImages]
    };

    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error updating service' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service' });
  }
});

// Categories
router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    // Check if services are using this category
    const count = await Service.countDocuments({ category: req.params.id });
    if (count > 0) return res.status(400).json({ message: 'Cannot delete category with assigned services' });
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().populate('bookingId').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.patch('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// WhatsApp Status
router.get('/whatsapp-status', async (req, res) => {
  // Mock status for now
  res.json({ status: 'online' });
});

// Config
router.get('/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
    }
    
    const safeConfig = {
      ...config.toObject(),
      whatsappToken: decrypt(config.whatsappToken),
      mongoURI: decrypt(config.mongoURI),
      mpesaConsumerKey: decrypt(config.mpesaConsumerKey),
      mpesaConsumerSecret: decrypt(config.mpesaConsumerSecret),
      mpesaPasskey: decrypt(config.mpesaPasskey),
      cloudinaryApiKey: decrypt(config.cloudinaryApiKey),
      cloudinaryApiSecret: decrypt(config.cloudinaryApiSecret)
    };
    
    res.json(safeConfig);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching config' });
  }
});

router.post('/config', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      whatsappToken: encrypt(req.body.whatsappToken),
      mongoURI: encrypt(req.body.mongoURI),
      mpesaConsumerKey: encrypt(req.body.mpesaConsumerKey),
      mpesaConsumerSecret: encrypt(req.body.mpesaConsumerSecret),
      mpesaPasskey: encrypt(req.body.mpesaPasskey),
      cloudinaryApiKey: encrypt(req.body.cloudinaryApiKey),
      cloudinaryApiSecret: encrypt(req.body.cloudinaryApiSecret),
      updatedAt: new Date()
    };

    let config = await SystemConfig.findOne();
    if (config) {
      config = await SystemConfig.findByIdAndUpdate(config._id, updateData, { new: true });
    } else {
      config = new SystemConfig(updateData);
      await config.save();
    }
    res.json({ message: 'Config saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving config' });
  }
});

export default router;
