import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import CookCard from '../../components/cookcard';
import Loader from '../../components/loader';

export default function SearchCook() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ city: '', cuisine: '', maxPrice: '' });

  const fetchCooks = async (activeFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilters.city) params.append('city', activeFilters.city);
      if (activeFilters.cuisine) params.append('cuisine', activeFilters.cuisine);
      if (activeFilters.maxPrice) params.append('maxPrice', activeFilters.maxPrice);

      const url = params.toString()
        ? `/cook/search-cook?${params.toString()}`
        : '/cook/all-cook';

      const res = await api.get(url);
      setCooks(res.data);
    } catch (err) {
      setError('Failed to fetch cooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCooks(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCooks(filters);
  };

  const handleReset = () => {
    const empty = { city: '', cuisine: '', maxPrice: '' };
    setFilters(empty);
    fetchCooks(empty);
  };

  return (
    <SidebarLayout>
      {/* Hero search bar */}
      <div className="bg-white border-b border-outline-variant px-6 lg:px-10 py-8">
        <h1 className="text-2xl font-bold text-on-background mb-5">Find Your Perfect Cook</h1>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">location_on</span>
            <input
              type="text"
              placeholder="City (e.g., Mumbai)"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-surface"
            />
          </div>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">restaurant_menu</span>
            <input
              type="text"
              placeholder="Cuisine (e.g., Italian)"
              value={filters.cuisine}
              onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-surface"
            />
          </div>
          <div className="relative sm:w-44">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">currency_rupee</span>
            <input
              type="number"
              placeholder="Max Price/Day"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-surface"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-emerald-700 text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">search</span>
            Search
          </button>
          {(filters.city || filters.cuisine || filters.maxPrice) && (
            <button
              type="button"
              onClick={handleReset}
              className="border border-outline-variant text-on-surface-variant hover:bg-surface px-4 py-3 rounded-xl text-sm transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="px-6 lg:px-10 py-8">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
        ) : cooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
            <div className="text-5xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-bold text-on-background mb-2">No cooks found</h3>
            <p className="text-on-surface-variant">Try adjusting your filters or clear them to see all available cooks.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-5">{cooks.length} cook{cooks.length !== 1 ? 's' : ''} available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cooks.map(cook => (
                <CookCard key={cook._id} cook={cook} />
              ))}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
