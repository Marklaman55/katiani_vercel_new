import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Star, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { cn, formatKenyanNumber } from '../lib/utils';

const SuccessPage = () => {
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    const last = localStorage.getItem('lastBooking');
    if (last) setBooking(JSON.parse(last));
  }, []);

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Katiani-Styles-Booking-${booking._id?.slice(-6)}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success("QR Code downloaded!");
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating");
    try {
      await apiRequest('/api/reviews', { 
        method: 'POST',
        body: JSON.stringify({ bookingId: booking._id, rating, comment })
      });
      toast.success("Thank you for your review!");
      setReviewed(true);
    } catch (err) {
      toast.error("Failed to save review");
    }
  };

  if (!booking) return <div className="pt-32 text-center">No booking found.</div>;

  const isPending = booking.paymentType === 'deposit' && booking.status === 'pending';

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            {isPending ? "Booking Initiated!" : "Booking Confirmed!"}
          </h1>
          <p className="text-gray-600 mb-8">
            {isPending 
              ? "Your booking is pending deposit payment confirmation. Please complete the M-Pesa prompt on your phone." 
              : "We've sent a confirmation to your phone."
            }
          </p>
          
          <div className="bg-white/50 p-6 rounded-3xl border border-white/50 mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service:</span>
              <span className="font-bold text-gray-900">{booking.service}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone:</span>
              <span className="font-bold text-gray-900">{formatKenyanNumber(booking.phone)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-bold text-gray-900">{booking.date} at {booking.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={cn(
                "font-bold px-2 py-0.5 rounded-full text-xs uppercase",
                booking.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              )}>
                {booking.status}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div ref={qrRef} className="bg-white p-6 rounded-2xl border border-brand-pink-dark inline-block shadow-sm">
              <QRCodeSVG value={JSON.stringify({ id: booking._id, name: booking.name })} size={150} />
              <p className="text-xs text-gray-500 mt-4 font-mono">ID: {booking._id?.slice(-8) || 'N/A'}</p>
            </div>

            <div>
              <button 
                onClick={downloadQR}
                className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-accent-dark font-bold text-sm bg-white px-4 py-2 rounded-full border border-brand-pink-dark shadow-sm transition-all"
              >
                <Download size={16} /> Download Ticket
              </button>
            </div>
          </div>
        </motion.div>

        {!reviewed && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-10"
          >
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Leave a Review</h2>
            <form onSubmit={handleReview} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      "transition-all",
                      rating >= star ? "text-brand-gold scale-110" : "text-gray-300"
                    )}
                  >
                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea 
                className="input-field min-h-[100px]" 
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button className="w-full btn-primary">Submit Review</button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
