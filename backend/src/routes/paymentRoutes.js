import express from 'express';
import { MpesaTransaction, Booking } from '../models.js';
import axios from 'axios';

const router = express.Router();

// M-Pesa STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, bookingId } = req.body;
    console.log(`Initiating STK Push for ${phone}, amount ${amount}`);
    
    // In a real implementation, you'd call Safaricom API here
    // For now, we simulate a pending transaction
    const transaction = new MpesaTransaction({
      CheckoutRequestID: "ws_CO_" + Date.now(),
      BookingId: bookingId,
      Status: 'pending'
    });
    await transaction.save();

    // Mocking Safaricom response
    res.json({ 
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing',
      CheckoutRequestID: transaction.CheckoutRequestID 
    });
  } catch (err) {
    res.status(500).json({ message: "Error initiating STK push" });
  }
});

// M-Pesa Callback
router.post('/callback', async (req, res) => {
  try {
    console.log("M-Pesa Callback received:", JSON.stringify(req.body));
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID });
      if (transaction) {
        transaction.ResultCode = ResultCode;
        transaction.ResultDesc = ResultDesc;

        if (ResultCode === 0) {
          transaction.Status = 'success';
          if (CallbackMetadata && CallbackMetadata.Item) {
            const amount = CallbackMetadata.Item.find(i => i.Name === 'Amount')?.Value;
            const receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
            const phone = CallbackMetadata.Item.find(i => i.Name === 'PhoneNumber')?.Value;
            
            transaction.Amount = amount;
            transaction.MpesaReceiptNumber = receipt;
            transaction.PhoneNumber = phone;
          }

          if (transaction.BookingId) {
            await Booking.findByIdAndUpdate(transaction.BookingId, { status: 'confirmed', paymentStatus: 'paid' });
            console.log("Booking confirmed via M-Pesa:", transaction.BookingId);
          }
        } else {
          transaction.Status = 'failed';
        }
        await transaction.save();
      }
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa Callback Error:", err.message);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

// Status Check
router.get('/status/:checkoutID', async (req, res) => {
  try {
    const transaction = await MpesaTransaction.findOne({ CheckoutRequestID: req.params.checkoutID }).populate('BookingId');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    
    res.json({
      status: transaction.Status === 'success' ? 'completed' : transaction.Status === 'failed' ? 'failed' : 'pending',
      booking: transaction.BookingId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error checking status' });
  }
});

export default router;
