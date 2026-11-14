import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import CookCard from '../../components/cookcard';
import Loader from '../../components/loader';

export default function SearchCook() {
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search mode state: standard vs AI Matchmaker
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState([]); // Array of { cook, matchScore, aiExplanation }

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

  useEffect(() => {
    fetchCooks();
    
    // Check if there was an AI menu cuisine suggestion pre-filled
    const urlParams = new URLSearchParams(window.location.search);
    const cuisineQ = urlParams.get('q');
    if (cuisineQ) {
      setFilters(prev => ({ ...prev, cuisine: cuisineQ }));
      fetchCooks({ city: '', cuisine: cuisineQ, maxPrice: '' });
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setAiMode(false); // Disable AI matches when triggering standard search
    fetchCooks(filters);
  };

  const handleReset = () => {
    const empty = { city: '', cuisine: '', maxPrice: '' };
    setFilters(empty);
    fetchCooks(empty);
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/match-cooks', { foodWant: aiPrompt });
      setAiMatches(res.data);
    } catch (err) {
      setError('AI Matchmaking failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SidebarLayout>
      
      {/* Tab Select Header */}
      <div className="bg-white border-b border-outline-variant px-6 lg:px-10 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-on-background">Explore Professional Chefs</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Hire vetted home chefs to design menus, cook, and clean in your kitchen.
            </p>
          </div>
          
          {/* Mode Switcher Buttons */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto border border-gray-200">
            <button
              onClick={() => { setAiMode(false); setError(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                !aiMode 
                  ? 'bg-white text-on-background shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Standard Search
            </button>
            <button
              onClick={() => { setAiMode(true); setError(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                aiMode 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span>
              AI Matchmaker
            </button>
          </div>
        </div>

        {/* Dynamic Panels depending on selected mode */}
        {!aiMode ? (
          /* Standard search bar */
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pb-6 animate-fade-in">
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
              className="bg-primary hover:bg-emerald-700 text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Search
            </button>
            {(filters.city || filters.cuisine || filters.maxPrice) && (
              <button
                type="button"
                onClick={handleReset}
                className="border border-outline-variant text-on-surface-variant hover:bg-surface px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        ) : (
          /* AI Matchmaker Panel */
          <form onSubmit={handleAISearch} className="space-y-4 pb-6 animate-fade-in max-w-4xl">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-4 text-primary text-xl">auto_awesome</span>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your perfect culinary experience... (e.g. 'I want a high-protein dinner party for 4 people, my guests love Japanese seafood, and we have a strict budget of $120. We prefer an experienced chef who lives nearby.')"
                rows="3"
                className="w-full pl-12 pr-4 pt-3.5 pb-3.5 rounded-2xl border border-primary/20 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-xs bg-emerald-50/10 placeholder-on-surface-variant/40 resize-none font-medium leading-relaxed"
                required
              />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-primary hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm animate-spin" style={aiLoading ? {} : { display: 'none' }}>sync</span>
              <span className="material-symbols-outlined text-sm" style={aiLoading ? { display: 'none' } : {}}>auto_awesome</span>
              Find My Perfect Chef
            </button>
          </form>
        )}
      </div>

      {/* Results Section */}
      <div className="px-6 lg:px-10 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6">{error}</div>
        )}

        {/* AI Mode Results */}
        {aiMode ? (
          aiLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-outline-variant shadow-sm space-y-4">
              <Loader />
              <p className="text-xs text-primary font-bold animate-pulse">Gemini AI is analyzing chef specialities and matching your craving...</p>
            </div>
          ) : aiMatches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-outline-variant max-w-2xl mx-auto p-8 space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-background">Describe Your Needs Above</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Type in natural language what kind of meal, cuisine, diet, or occasion you have, and our AI assistant will recommend the perfect chefs!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                  Gemini Smart Matches
                </span>
                <span className="text-xs text-on-surface-variant font-medium">Recommended based on your descriptions</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                {aiMatches.map((item) => (
                  <div key={item.cook._id} className="relative bg-white rounded-3xl border border-outline-variant p-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                    <div>
                      {/* Dynamic Match Score Badge */}
                      <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 font-extrabold text-[9px] px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm z-10">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span>{item.matchScore}% Match</span>
                      </div>
                      
                      {/* Nested Chef Card */}
                      <CookCard cook={item.cook} />
                      
                      {/* AI Match explanation banner */}
                      <div className="mt-4 p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">
                          <span className="material-symbols-outlined text-[11px]">auto_awesome</span>
                          <span>Chef Match Reason</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                          {item.aiExplanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Standard Mode Results */
          loading ? (
            <Loader />
          ) : cooks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-on-background mb-2">No cooks found</h3>
              <p className="text-on-surface-variant">Try adjusting your filters or clear them to see all available cooks.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant mb-5 font-bold">{cooks.length} chef{cooks.length !== 1 ? 's' : ''} available nearby</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl">
                {cooks.map(cook => (
                  <CookCard key={cook._id} cook={cook} />
                ))}
              </div>
            </>
          )
        )}
      </div>

    </SidebarLayout>
  );
}
