import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/navbar';
import Loader from '../../components/loader';

export default function CookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cook, setCook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');

  useEffect(() => {
    const fetchCook = async () => {
      try {
        const res = await api.get('/cook/all-cook');
        const foundCook = res.data.find(c => c._id === id);
        if (foundCook) {
          setCook(foundCook);
          setProposedPrice(foundCook.pricePerDay);
        } else {
          setError('Cook not found');
        }
      } catch (err) {
        setError('Failed to load cook details');
      } finally {
        setLoading(false);
      }
    };
    fetchCook();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) return;
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        cookId: id,
        bookingDate,
        message,
        proposedPrice: Number(proposedPrice),
      });
      navigate('/my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="h-screen bg-background"><Navbar /><Loader /></div>;
  if (error) return <div className="h-screen bg-background"><Navbar /><div className="text-center mt-20 text-error">{error}</div></div>;
  if (!cook) return null;

  const isNegotiated = Number(proposedPrice) !== cook.pricePerDay;

  return (
    <div className="min-h-screen bg-[#f4f6f5] pb-12 font-body-md text-on-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col md:flex-row">

          {/* Left: Profile Details */}
          <div className="md:w-2/3 p-8 border-r border-outline-variant">
            {/* Top hero */}
            <div className="h-28 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 mb-8 relative">
              <div className="absolute -bottom-6 left-6 w-14 h-14 rounded-xl bg-white border-4 border-white shadow flex items-center justify-center text-primary font-bold text-2xl">
                {cook.user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            </div>
            <div className="mt-10 mb-6">
              <h1 className="text-2xl font-bold text-on-background">{cook.user?.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {cook.location?.city}{cook.location?.state ? `, ${cook.location.state}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-orange-400">★</span>
                  {cook.rating ? cook.rating.toFixed(1) : 'New'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">work</span>
                  {cook.experience} yrs experience
                </span>
              </div>
            </div>

            {/* Bio */}
            {cook.bio && (
              <div className="mb-6">
                <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-2">About</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed bg-surface p-4 rounded-xl border border-outline-variant">
                  {cook.bio}
                </p>
              </div>
            )}

            {/* Food Gallery */}
            {cook.foodImages && cook.foodImages.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3">Food Gallery</h3>
                <div className="grid grid-cols-3 gap-3">
                  {cook.foodImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer h-32">
                      <img 
                        src={img.url} 
                        alt={img.caption || `Dish ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {img.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <p className="text-white text-xs p-2 font-medium">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisines */}
            <div>
              <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {cook.cuisines?.map((cuisine, i) => (
                  <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {cook.reviews && cook.reviews.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3">Reviews ({cook.reviews.length})</h3>
                <div className="space-y-3">
                  {cook.reviews.slice(0, 3).map((rev, i) => (
                    <div key={i} className="p-3 bg-surface rounded-xl border border-outline-variant">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= rev.rating ? 'text-orange-400' : 'text-gray-300'}`}>★</span>)}
                      </div>
                      {rev.comment && <p className="text-xs text-on-surface-variant italic">"{rev.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Form */}
          <div className="md:w-1/3 bg-surface p-8">
            <h3 className="font-bold text-lg text-on-background mb-6">Book this Cook</h3>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Select Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-sm"
                />
              </div>

              {/* Bargaining price field */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">
                  Propose Your Price (per day)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full pl-7 pr-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-sm"
                  />
                </div>
                {isNegotiated && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Cook's listed rate is ${cook.pricePerDay}/day. Chef will review your offer.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase">Message (Optional)</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dietary needs, occasion, preferences..."
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white resize-none text-sm"
                />
              </div>

              {/* Summary */}
              <div className="bg-white p-4 rounded-xl border border-outline-variant">
                <div className="flex justify-between text-sm text-on-surface-variant mb-2">
                  <span>Listed Rate</span>
                  <span className={isNegotiated ? 'line-through' : ''}>${cook.pricePerDay}/day</span>
                </div>
                {isNegotiated && (
                  <div className="flex justify-between text-sm font-bold text-orange-500 mb-2">
                    <span>Your Offer</span>
                    <span>${proposedPrice}/day</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-on-background border-t border-outline-variant pt-2 mt-2">
                  <span>Total Proposed</span>
                  <span>${proposedPrice || cook.pricePerDay}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center shadow-sm"
              >
                {bookingLoading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Send Booking Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
