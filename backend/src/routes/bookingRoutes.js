import express from 'express';
import { Booking, Service } from '../models.js';
import { sendWhatsAppMessage } from '../services/whatsappCloudService.js';
import moment from 'moment';

const router = express.Router();

// Get availability for a date
router.get('/availability', async (req, res) => {
  const { date } = req.query;
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // Find all bookings for this date that are NOT cancelled
    // EXCEPT pending deposit bookings that have timed out
    const bookings = await Booking.find({ 
      date, 
      $or: [
        { status: 'confirmed' },
        { status: 'completed' },
        { status: 'pending', paymentType: 'cash' },
        { 
          status: 'pending', 
          paymentType: 'deposit',
          createdAt: { $gte: fifteenMinutesAgo } 
        }
      ]
    });

    const bookedSlots = bookings.map(b => b.time);
    res.json({
      count: bookings.length,
      bookedSlots,
      isFull: bookings.length >= 20
    });
  } catch (err) {
    res.status(500).json({ message: 'Error checking availability' });
  }
});

// Get my bookings
router.get('/my', async (req, res) => {
  const { phone } = req.query;
  try {
    const bookings = await Booking.find({ phone }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your bookings' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  console.log("Incoming booking:", req.body);
  try {
    const { name, phone, email, serviceId, date, time, paymentType } = req.body;
    
    const service = await Service.findById(serviceId);
    if (!service) {
      console.warn("Service not found:", serviceId);
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if slot is already taken
    const existing = await Booking.findOne({ date, time, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const booking = new Booking({
      name,
      phone,
      email,
      service: service.name,
      date,
      time,
      paymentType,
      status: paymentType === 'cash' ? 'confirmed' : 'pending'
    });

    await booking.save();
    console.log("Booking saved:", booking._id);

    // Send WhatsApp notification (Non-blocking)
    const msg = `New Booking: ${name} for ${service.name} on ${date} at ${time}`;
    try {
      await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP || '', msg);
    } catch (err) {
      console.error("WhatsApp failed:", err.message);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

export default router;
