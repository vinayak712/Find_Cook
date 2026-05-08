import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl transition-transform hover:scale-110 ${star <= value ? 'text-orange-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, cookId, cookName }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/user');
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleMarkCompleted = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'completed' });
      await fetchBookings();
    } catch (err) {
      alert('Failed to mark as completed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setReviewLoading(true);
    try {
      await api.post(`/cook/${reviewModal.cookId}/review`, { rating, comment });
      setReviewModal(null);
      setRating(5);
      setComment('');
      alert('Review submitted! Thank you.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const statusConfig = {
    accepted: { cls: 'bg-emerald-100 text-emerald-800', label: 'Accepted' },
    rejected: { cls: 'bg-red-100 text-red-800', label: 'Rejected' },
    completed: { cls: 'bg-gray-100 text-gray-700', label: 'Completed' },
    pending: { cls: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  };

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-background">My Bookings</h1>
          <p className="text-on-surface-variant mt-1">Track all your chef booking requests.</p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-on-background mb-2">No bookings yet</h3>
            <p className="text-on-surface-variant mb-6">Start by finding a professional cook near you.</p>
            <Link to="/search" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
              Find a Cook
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cfg = statusConfig[booking.status] || statusConfig.pending;
              return (
                <div key={booking._id} className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Cook info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {booking.cook?.user?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{booking.cook?.user?.name || 'Unknown Cook'}</p>
                        <p className="text-sm text-on-surface-variant">
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {booking.message && (
                          <p className="text-sm text-on-surface-variant mt-1 italic">"{booking.message}"</p>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">Proposed Price</p>
                        <p className="font-bold text-primary text-lg">${booking.price || booking.cook?.pricePerDay}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      {/* Action buttons */}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handleMarkCompleted(booking._id)}
                          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setReviewModal({ bookingId: booking._id, cookId: booking.cook?._id, cookName: booking.cook?.user?.name })}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <span className="text-base">★</span> Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-on-background mb-1">Rate Your Experience</h2>
            <p className="text-on-surface-variant mb-6">With <span className="font-bold text-primary">{reviewModal.cookName}</span></p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Your Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Review (optional)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="How was the food? Would you recommend this chef?"
                  className="w-full px-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="flex-1 px-4 py-3 border border-outline-variant text-on-surface-variant hover:bg-surface rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading || !rating}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
