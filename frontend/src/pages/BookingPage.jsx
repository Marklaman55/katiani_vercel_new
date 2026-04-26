import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { User as UserIcon, Phone, Mail, ChevronRight, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { TIME_SLOTS } from '../constants';
import { cn, formatKenyanNumber } from '../lib/utils';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialService = queryParams.get('service') || '';

  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: initialService,
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '',
    paymentType: 'cash'
  });

  const [availability, setAvailability] = useState({
    count: 0,
    bookedSlots: [],
    isFull: false
  });

  const [loading, setLoading] = useState(false);
  const servicesFetchedRef = useRef(false);

  useEffect(() => {
    if (servicesFetchedRef.current) return;
    servicesFetchedRef.current = true;

    const fetchServices = async () => {
      try {
        const data = await apiRequest('/api/services');
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch services:", err.message);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.date) {
      checkAvailability(formData.date);
    }
  }, [formData.date]);

  const checkAvailability = async (date) => {
    try {
      const data = await apiRequest(`/api/bookings/availability?date=${date}`);
      setAvailability(data || { count: 0, bookedSlots: [], isFull: false });
    } catch (err) {
      toast.error("Failed to check availability");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.time) return toast.error("Please select a time slot");
    
    if (formData.phone.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    const formattedPhone = formatKenyanNumber(formData.phone);
    if (formattedPhone.length !== 12) {
      toast.error("Invalid phone number format. Please use 07XXXXXXXX or 2547XXXXXXXX.");
      return;
    }
    
    setLoading(true);
    try {
      const booking = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...formData, phone: formattedPhone })
      });

      if (formData.paymentType === 'deposit') {
        const service = services.find(s => s._id === formData.serviceId);
        const depositAmount = service ? Math.round(service.price * 0.5) : 1000;
        
        const stkRes = await apiRequest('/api/payments/stkpush', { 
          method: 'POST',
          body: JSON.stringify({
            phone: formattedPhone, 
            amount: depositAmount,
            bookingId: booking._id 
          })
        });
        
        if (stkRes.ResponseCode === '0') {
          toast.success("STK Push triggered! Please check your phone.");
          navigate(`/payment-status?checkoutID=${stkRes.CheckoutRequestID}`);
        } else {
          toast.error("Failed to trigger M-Pesa payment. Please try again.");
        }
      } else {
        toast.success("Booking successful!");
        localStorage.setItem('lastBooking', JSON.stringify(booking));
        navigate('/success');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Book Your Session</h1>
            <p className="text-gray-600">Secure your spot for a luxury lash experience.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <UserIcon size={16} /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  className="input-field" 
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                <input 
                  required
                  type="tel" 
                  className="input-field" 
                  placeholder="07XXXXXXXX or 254XXXXXXXXX"
                  value={formData.phone}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 12) setFormData({...formData, phone: val});
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Email (Optional)
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ChevronRight size={16} /> Service Type
                </label>
                <select 
                  required
                  className="input-field"
                  value={formData.serviceId}
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} - KES {s.price}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Calendar size={16} /> Select Date
                </label>
                <input 
                  required
                  type="date" 
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  className="input-field"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Clock size={16} /> Available Slots
                  </label>
                  <div className="text-xs font-medium text-gray-500">
                    {availability.count}/20 slots filled
                  </div>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      availability.count >= 18 ? "bg-red-500" : 
                      availability.count >= 10 ? "bg-brand-accent" : 
                      "bg-green-500"
                    )}
                    style={{ width: `${(availability.count / 20) * 100}%` }}
                  />
                </div>

                {availability.isFull ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold">
                    Day Fully Booked (20/20)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map(slot => {
                      const isBooked = availability.bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormData({...formData, time: slot})}
                          className={cn(
                            "py-3 rounded-xl text-sm font-medium transition-all border",
                            isBooked ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" :
                            formData.time === slot ? "bg-brand-accent text-white border-brand-accent shadow-md" :
                            "bg-white text-gray-700 border-brand-pink-dark hover:border-brand-accent"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700">Payment Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentType: 'deposit'})}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all relative",
                    formData.paymentType === 'deposit' ? "border-brand-accent bg-brand-pink/50 ring-2 ring-brand-accent" : "border-brand-pink-dark bg-white"
                  )}
                >
                  <div className="font-bold text-gray-900">Pay Deposit</div>
                  <div className="text-xs text-gray-600 mt-1">Priority booking via M-Pesa STK Push.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentType: 'cash'})}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all",
                    formData.paymentType === 'cash' ? "border-brand-accent bg-brand-pink/50 ring-2 ring-brand-accent" : "border-brand-pink-dark bg-white"
                  )}
                >
                  <div className="font-bold text-gray-900">Pay Cash at Studio</div>
                  <div className="text-xs text-gray-600 mt-1">Pending status. Subject to availability.</div>
                </button>
              </div>
            </div>

            <button 
              disabled={loading || availability.isFull}
              className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
