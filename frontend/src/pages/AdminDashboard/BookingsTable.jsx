import React, { useState } from 'react';
import { Filter, Download, Trash2, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { cn, formatKenyanNumber } from '../../lib/utils';

const BookingsTable = ({ bookings, fetchBookings, confirmAction }) => {
  const [filter, setFilter] = useState('all');

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteBooking = async (id) => {
    confirmAction(
      'Delete Booking',
      'Are you sure you want to delete this booking record?',
      async () => {
        try {
          await api.delete(`/api/admin/bookings/${id}`);
          toast.success("Booking deleted");
          fetchBookings();
        } catch (err) {
          toast.error("Failed to delete booking");
          throw err;
        }
      }
    );
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Payment'];
    const rows = filteredBookings.map(b => [
      b.name,
      `254${b.phone}`,
      b.service,
      b.date,
      b.time,
      b.status,
      b.paymentStatus
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-600"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={exportCSV}
            className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-pink rounded-xl transition-all"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-8 py-4">Client</th>
              <th className="px-8 py-4">Service</th>
              <th className="px-8 py-4">Schedule</th>
              <th className="px-8 py-4">Payment</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent font-bold">
                      {booking.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{booking.name}</div>
                      <div className="text-xs text-gray-500">+254 {formatKenyanNumber(booking.phone)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium text-gray-700">{booking.service}</div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium text-gray-900">{booking.date}</div>
                  <div className="text-xs text-gray-500">{booking.time}</div>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    booking.paymentStatus === 'paid' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                  )}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-bold",
                    booking.status === 'confirmed' ? "text-green-600" : 
                    booking.status === 'cancelled' ? "text-red-600" : "text-yellow-600"
                  )}>
                    {booking.status === 'confirmed' ? <CheckCircle size={14} /> : 
                     booking.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(booking._id, 'confirmed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Confirm"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateStatus(booking._id, 'cancelled')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Cancel"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteBooking(booking._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">No bookings found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsTable;
