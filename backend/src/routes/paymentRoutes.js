import express from 'express';
import { MpesaTransaction, Booking } from '../models.js';
import { initiateStkPush } from '../services/mpesaService.js';
import { sendWhatsAppMessage } from '../services/whatsappCloudService.js';

const router = express.Router();

// M-Pesa STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, bookingId } = req.body;
    
    if (!phone || !amount || !bookingId) {
      return res.status(400).json({ message: "Phone, amount, and bookingId are required" });
    }

    console.log(`📡 Initiating real STK Push for ${phone}, amount ${amount}`);
    
    const stkResponse = await initiateStkPush(phone, amount, bookingId);
    
    if (stkResponse.ResponseCode === '0') {
      const transaction = new MpesaTransaction({
        CheckoutRequestID: stkResponse.CheckoutRequestID,
        MerchantRequestID: stkResponse.MerchantRequestID,
        BookingId: bookingId,
        Status: 'pending',
        Amount: amount,
        PhoneNumber: phone
      });
      await transaction.save();

      res.json({ 
        success: true,
        ResponseCode: '0',
        ResponseDescription: stkResponse.ResponseDescription,
        CustomerMessage: stkResponse.CustomerMessage,
        CheckoutRequestID: stkResponse.CheckoutRequestID 
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: stkResponse.ResponseDescription || "Failed to initiate STK push" 
      });
    }
  } catch (err) {
    console.error("STK Push Route Error:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || "Error initiating STK push" 
    });
  }
});

// M-Pesa Callback
router.post('/callback', async (req, res) => {
  try {
    console.log("📡 M-Pesa Callback received at:", new Date().toISOString());
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
      console.log(`🔍 Processing Callback for CheckoutID: ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID });
      if (transaction) {
        transaction.ResultCode = ResultCode;
        transaction.ResultDesc = ResultDesc;

        if (ResultCode === 0) {
          transaction.Status = 'success';
          let amount, receipt, phone;

          if (CallbackMetadata && CallbackMetadata.Item) {
            amount = CallbackMetadata.Item.find(i => i.Name === 'Amount')?.Value;
            receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
            phone = CallbackMetadata.Item.find(i => i.Name === 'PhoneNumber')?.Value;
            
            transaction.Amount = amount || transaction.Amount;
            transaction.MpesaReceiptNumber = receipt;
            transaction.PhoneNumber = phone || transaction.PhoneNumber;
          }

          if (transaction.BookingId) {
            const booking = await Booking.findById(transaction.BookingId);
            if (booking) {
              booking.status = 'confirmed';
              booking.paymentStatus = 'paid';
              await booking.save();
              console.log(`✅ Booking ${booking._id} confirmed and paid. receipt: ${receipt}`);

              // Send WhatsApp notification to user
              const userMsg = `Hello ${booking.name}, your payment of KES ${amount} for your lash session on ${booking.date} at ${booking.time} has been confirmed. Receipt: ${receipt}. See you then!`;
              try {
                // Ensure phone is formatted for WhatsApp if needed, but sendWhatsAppMessage handles it if it's already 254...
                await sendWhatsAppMessage(booking.phone, userMsg);
              } catch (waErr) {
                console.error("❌ Failed to send confirmation WhatsApp to user:", waErr.message);
              }
            } else {
              console.warn(`⚠️ Booking ${transaction.BookingId} not found for transaction ${CheckoutRequestID}`);
            }
          }
        } else {
          transaction.Status = 'failed';
          console.warn(`❌ Transaction ${CheckoutRequestID} failed with code ${ResultCode}: ${ResultDesc}`);
          
          if (transaction.BookingId) {
             const booking = await Booking.findById(transaction.BookingId);
             if (booking) {
               booking.paymentStatus = 'failed';
               await booking.save();
             }
          }
        }
        await transaction.save();
      } else {
        console.warn(`❓ Unknown CheckoutRequestID: ${CheckoutRequestID}`);
      }
    } else {
      console.warn("⚠️ Callback received without expected Body.stkCallback structure");
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("💥 M-Pesa Callback Error:", err.message);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
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
