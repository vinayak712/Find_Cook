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
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [aiCraving, setAiCraving] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('activeAICraving');
    if (saved) {
      setAiCraving(JSON.parse(saved));
    }
  }, []);

  const handleApplyAICraving = () => {
    if (!aiCraving) return;
    const formattedMessage = `AI Chef Matchmaker Request:
- What I want to eat: ${aiCraving.foodWant}
- Cuisine Style: ${aiCraving.cuisine}
- Scheduled Time: ${aiCraving.whenWant}
- Additional Details: ${aiCraving.additionalRequirements || 'None'}`;
    setMessage(formattedMessage);
  };

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await api.get('/cook/favorites');
        const isFav = res.data.some(c => c._id === id);
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Failed to check favorites:", err);
      }
    };
    if (cook) {
      checkFavorite();
    }
  }, [id, cook]);

  const handleToggleFavorite = async () => {
    try {
      await api.post(`/cook/favorites/${id}`);
      setIsFavorite(prev => !prev);
    } catch (err) {
      alert('Failed to update favorite status.');
    }
  };

  useEffect(() => {
    const fetchCook = async () => {
      try {
        const res = await api.get(`/cook/${id}`);
        setCook(res.data);
        setProposedPrice(res.data.pricePerDay);
      } catch (err) {
        console.error("Error loading cook details:", err);
        setError(err.response?.data?.message || 'Failed to load cook details');
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
              <div className="absolute -bottom-6 left-6 w-14 h-14 rounded-xl bg-white border-4 border-white shadow flex items-center justify-center text-primary font-bold text-2xl overflow-hidden">
                {cook.profileImage ? (
                  <img src={cook.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  cook.user?.name?.charAt(0)?.toUpperCase() || 'C'
                )}
              </div>
            </div>
            <div className="mt-10 mb-6 flex justify-between items-center">
              <div>
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

              {/* Heart Favorite Button */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full border transition-all duration-200 flex items-center justify-center shadow-sm active:scale-95 ${isFavorite
                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600'
                    : 'bg-white text-gray-400 border-outline-variant hover:text-red-500 hover:bg-slate-50'
                  }`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <span className="material-symbols-outlined text-2xl animate-fade-in" style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  favorite
                </span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-background'}`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Overview
              </button>
              {cook.foodImages && cook.foodImages.length > 0 && (
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-background'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">image</span>
                  Food Gallery ({cook.foodImages.length})
                </button>
              )}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Bio */}
                {cook.bio && (
                  <div>
                    <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3 tracking-wider">About Chef</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm">
                      {cook.bio}
                    </p>
                  </div>
                )}

                {/* Cuisines */}
                <div>
                  <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3 tracking-wider">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {cook.cuisines?.map((cuisine, i) => (
                      <span key={i} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                {cook.reviews && cook.reviews.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3 tracking-wider">Client Reviews ({cook.reviews.length})</h3>
                    <div className="space-y-3">
                      {cook.reviews.slice(0, 3).map((rev, i) => (
                        <div key={i} className="p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-[16px] ${s <= rev.rating ? 'text-orange-400' : 'text-gray-300'}`}>★</span>)}
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant">— {rev.user?.name || 'Anonymous client'}</span>
                          </div>
                          {rev.comment && <p className="text-sm text-on-surface-variant italic">"{rev.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cook.foodImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl transition-all cursor-pointer aspect-square">
                      <img
                        src={img.url}
                        alt={img.caption || `Dish ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="material-symbols-outlined text-white mb-1">restaurant</span>
                        <p className="text-white text-sm font-medium">{img.caption || 'Signature Dish'}</p>
                      </div>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
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
                    Cook's listed rate is ₹{cook.pricePerDay}/day. Chef will review your offer.
                  </p>
                )}
              </div>

              {aiCraving && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active AI Match Found</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    You matched this chef for your craving: <strong className="text-on-background italic">"{aiCraving.foodWant}"</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleApplyAICraving}
                    className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[10px] transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">bookmark_added</span>
                    Attach AI Cravings Details
                  </button>
                </div>
              )}

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
                  <span className={isNegotiated ? 'line-through' : ''}>₹{cook.pricePerDay}/day</span>
                </div>
                {isNegotiated && (
                  <div className="flex justify-between text-sm font-bold text-orange-500 mb-2">
                    <span>Your Offer</span>
                    <span>₹{proposedPrice}/day</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-on-background border-t border-outline-variant pt-2 mt-2">
                  <span>Total Proposed</span>
                  <span>₹{proposedPrice || cook.pricePerDay}</span>
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
