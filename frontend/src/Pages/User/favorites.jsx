import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';
import api from '../../api/axios';
import CookCard from '../../components/cookcard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/cook/favorites');
      setFavorites(res.data);
    } catch (err) {
      setError('Failed to fetch favorite chefs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (cookId) => {
    try {
      await api.post(`/cook/favorites/${cookId}`);
      // Optimistically remove from state
      setFavorites(prev => prev.filter(c => c._id !== cookId));
    } catch (err) {
      alert('Failed to remove from favorites.');
    }
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-[#f9fafb] p-6 lg:p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-8">
          <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20">
            Saved Specialists
          </span>
          <h1 className="text-2xl font-black text-on-background mt-3">My Favorite Chefs</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Keep track of the chefs you love and plan to hire for your culinary experiences.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center text-error py-12">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant p-12 text-center max-w-lg mx-auto shadow-sm mt-12 space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-background">No Favorite Chefs Yet</h3>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                Explore our curated marketplace of world-class home chefs and heart the ones you enjoyed or wish to hire!
              </p>
            </div>
            <Link
              to="/search"
              className="inline-block bg-primary hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm active:scale-95"
            >
              Explore Talented Chefs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {favorites.map((cook) => (
              <div key={cook._id} className="relative group">
                <CookCard cook={cook} />
                
                {/* Float Heart Unfavorite Button */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(cook._id)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-2.5 rounded-full shadow-md z-10 transition-all hover:scale-110 active:scale-95 flex items-center justify-center border border-gray-100"
                  title="Remove from Favorites"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
