import React, { useState, useEffect, useRef } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { apiRequest } from '../../services/api';
import { cn } from '../../lib/utils';

const ReviewManagement = ({ confirmAction }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/admin/reviews');
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteReview = (id) => {
    confirmAction(
      'Delete Review',
      'Are you sure you want to delete this review?',
      async () => {
        try {
          await apiRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' });
          toast.success("Review deleted");
          fetchReviews();
        } catch (err) {
          toast.error("Failed to delete review");
          throw err;
        }
      }
    );
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-accent" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => deleteReview(review._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                review.status === 'approved' ? "bg-green-100 text-green-600" : 
                review.status === 'rejected' ? "bg-red-100 text-red-600" : 
                "bg-yellow-100 text-yellow-600"
              )}>
                {review.status}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                />
              ))}
            </div>

            <p className="text-gray-700 italic mb-6 text-sm">"{review.comment}"</p>
            
            <div className="flex gap-2 mb-6">
              {review.status !== 'approved' && (
                <button 
                  onClick={() => updateStatus(review._id, 'approved')}
                  className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle size={14} /> Approve
                </button>
              )}
              {review.status !== 'rejected' && (
                <button 
                  onClick={() => updateStatus(review._id, 'rejected')}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-1"
                >
                  <XCircle size={14} /> Reject
                </button>
              )}
            </div>

            <div className="flex justify-between items-end text-xs text-gray-400 border-t border-gray-50 pt-4">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-700">{review.bookingId?.name || 'Anonymous'}</span>
                <span className="truncate max-w-[120px]">{review.bookingId?.service || 'Lash Service'}</span>
              </div>
              <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No reviews found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
