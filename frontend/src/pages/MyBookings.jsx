import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { cn, formatKenyanNumber } from '../lib/utils';

const MyBookings = () => {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (phone.length !== 9) {
      toast.error("Please enter exactly 9 digits for your phone number");
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest(`/api/bookings/my?phone=254${phone}`);
      setBookings(data || []);
      setHasSearched(true);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Enter your phone number to view your appointment history.</p>
        </div>

        <div className="glass-card p-6 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow flex items-center gap-0 border border-brand-pink-dark rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
              <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                +254
              </span>
              <input 
                required
                type="tel" 
                className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium" 
                placeholder="712 345 678"
                value={phone}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.startsWith('0')) val = val.slice(1);
                  if (val.startsWith('254')) val = val.slice(3);
                  if (val.length <= 9) setPhone(val);
                }}
              />
            </div>
            <button 
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 px-8"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Search
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <motion.div 
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-brand-pink-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{booking.service}</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    booking.paymentStatus === 'paid' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                  )}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</div>
                  <div className="flex items-center gap-1"><Clock size={14} /> {booking.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.status === 'confirmed' ? (
                  <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl">
                    <CheckCircle size={20} /> Confirmed
                  </div>
                ) : booking.status === 'cancelled' ? (
                  <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl">
                    <XCircle size={20} /> Cancelled
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 font-bold bg-yellow-50 px-4 py-2 rounded-xl">
                    <Clock size={20} /> Pending
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {hasSearched && bookings.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">No bookings found for this number.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
