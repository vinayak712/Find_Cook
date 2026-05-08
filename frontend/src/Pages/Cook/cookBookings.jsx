import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';

export default function CookBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/cook');
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load your booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status');
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
          <h1 className="text-2xl font-bold text-on-background">Booking Requests</h1>
          <p className="text-on-surface-variant mt-1">Accept or decline client booking requests.</p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-on-background mb-2">No requests yet</h3>
            <p className="text-on-surface-variant">Make sure your profile is complete and your availability is on.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {bookings.map((booking) => {
              const cfg = statusConfig[booking.status] || statusConfig.pending;
              return (
                <div key={booking._id} className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                        {booking.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{booking.user?.name || 'Customer'}</p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-surface rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Message</p>
                    <p className="text-sm text-on-background italic">
                      {booking.message ? `"${booking.message}"` : 'No message provided.'}
                    </p>
                  </div>

                  {/* Proposed price & actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-on-surface-variant">Proposed Price</p>
                      <p className="text-xl font-bold text-primary">${booking.price || 'N/A'}</p>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'accepted')}
                          className="px-4 py-2 bg-primary hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                    {booking.status === 'accepted' && (
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Awaiting completion by client
                      </p>
                    )}
                    {booking.status === 'completed' && (
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">done_all</span>
                        Service completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
