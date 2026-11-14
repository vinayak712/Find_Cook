import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import api from '../../api/axios';

export default function AIMenu() {
  const [foodWant, setFoodWant] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [whenWant, setWhenWant] = useState('Dinner (7 PM - 10 PM)');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [matches, setMatches] = useState(null);
  
  const navigate = useNavigate();

  const loadingMessages = [
    'Initiating culinary matchmaker...',
    'Analyzing food cravings & specifications...',
    'Scanning available chefs in your area...',
    'Cross-referencing overall ratings & reviews...',
    'Plating your top matching chefs...'
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingMessage(loadingMessages[0]);
      let index = 1;
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[index % loadingMessages.length]);
        index++;
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!foodWant) return;
    setLoading(true);
    setMatches(null);
    try {
      const res = await api.post('/ai/match-cooks', {
        foodWant,
        cuisine,
        whenWant: `${bookingDate} at ${whenWant}`,
        additionalRequirements
      });
      setMatches(res.data);
    } catch (err) {
      alert('AI Matchmaker failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookChef = (cookId) => {
    // Save AI craving state so it can auto-populate the chef's booking details!
    localStorage.setItem('activeAICraving', JSON.stringify({
      foodWant,
      cuisine,
      whenWant: `${bookingDate} at ${whenWant}`,
      additionalRequirements
    }));
    navigate(`/cook/${cookId}`);
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-[#f9fafb] p-6 lg:p-8 overflow-y-auto font-['Plus_Jakarta_Sans']">
        
        {/* Header */}
        <div className="mb-8">
          <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5 w-fit">
            <span className="material-symbols-outlined text-[12px] animate-pulse">auto_awesome</span>
            AI Chef Assistant
          </span>
          <h1 className="text-2xl font-black text-on-background mt-3">Smart AI Chef Matchmaker</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Tell the AI what food you want today and your schedule, and our Gemini engine will suggest the perfect chefs based on ratings, specialities, and client reviews!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start max-w-7xl">
          
          {/* Left Requirement Panel */}
          <div className="xl:col-span-5 bg-white rounded-3xl border border-outline-variant p-6 shadow-sm space-y-6">
            <h2 className="text-md font-extrabold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">restaurant</span>
              What are you craving today?
            </h2>
            
            <form onSubmit={handleMatch} className="space-y-5">
              
              {/* Food Requirement Area */}
              <div>
                <label className="block text-xs font-bold text-on-background mb-2">
                  What food do you want to eat?
                </label>
                <textarea
                  value={foodWant}
                  onChange={(e) => setFoodWant(e.target.value)}
                  placeholder="e.g. I want to have a creamy garlic chicken pasta, mild spice, with some hot garlic bread..."
                  rows="3"
                  className="w-full text-xs bg-slate-50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder-on-surface-variant/50 transition-all resize-none font-medium leading-relaxed"
                  required
                />
              </div>

              {/* Cuisine/Style Input */}
              <div>
                <label className="block text-xs font-bold text-on-background mb-2">Cuisine Type / Category</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                >
                  <option value="Italian">Italian Cuisine</option>
                  <option value="Indian">Indian Cuisine</option>
                  <option value="Mexican">Mexican Cuisine</option>
                  <option value="French">French Fine Dining</option>
                  <option value="Japanese">Japanese / Asian</option>
                  <option value="General Fine Dining">Other / General Gourmet</option>
                </select>
              </div>

              {/* When Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-background mb-2">Select Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-xs bg-slate-50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-background mb-2">Desired Slot</label>
                  <select
                    value={whenWant}
                    onChange={(e) => setWhenWant(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                  >
                    <option value="Breakfast (8 AM - 11 AM)">Breakfast (8 AM - 11 AM)</option>
                    <option value="Lunch (12 PM - 3 PM)">Lunch (12 PM - 3 PM)</option>
                    <option value="High Tea (4 PM - 6 PM)">High Tea (4 PM - 6 PM)</option>
                    <option value="Dinner (7 PM - 10 PM)">Dinner (7 PM - 10 PM)</option>
                  </select>
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-xs font-bold text-on-background mb-2">
                  Special Notes / Other Requirements (Optional)
                </label>
                <textarea
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="e.g. Low sodium, gluten-free, ingredients already purchased..."
                  rows="2"
                  className="w-full text-xs bg-slate-50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder-on-surface-variant/50 transition-all resize-none font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Find matching cooks
              </button>
            </form>
          </div>

          {/* Right Chef Recommendations Panel */}
          <div className="xl:col-span-7">
            {loading ? (
              <div className="bg-white rounded-3xl border border-outline-variant p-12 text-center shadow-sm flex flex-col items-center justify-center h-[500px]">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6" />
                <p className="text-xs text-[#047857] font-extrabold animate-pulse">{loadingMessage}</p>
              </div>
            ) : matches ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    Matched Cooks Suggested
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">Ranked by score and client reviews</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((item) => (
                    <div key={item.cook._id} className="relative bg-white rounded-3xl border border-outline-variant p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                      
                      {/* Match Score */}
                      <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 font-extrabold text-[9px] px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span>{item.matchScore}% Match</span>
                      </div>

                      {/* Cook Header details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 overflow-hidden">
                            {item.cook.profileImage ? (
                              <img src={item.cook.profileImage} alt={item.cook.user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-2xl font-light">person</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-on-background group-hover:text-primary transition-colors">{item.cook.user?.name}</h3>
                            <p className="text-[10px] text-on-surface-variant font-medium">{item.cook.location?.city}, {item.cook.location?.state}</p>
                          </div>
                        </div>

                        {/* Badges info */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold bg-slate-50 text-on-surface-variant border border-gray-150 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-orange-400">star</span>
                            {item.cook.rating?.toFixed(1) || '5.0'} ({item.cook.reviews?.length || 0} reviews)
                          </span>
                          <span className="text-[10px] font-bold bg-slate-50 text-on-surface-variant border border-gray-150 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-primary">currency_rupee</span>
                            {item.cook.pricePerDay}/day
                          </span>
                          <span className="text-[10px] font-bold bg-slate-50 text-on-surface-variant border border-gray-150 px-2 py-0.5 rounded-lg">
                            {item.cook.experience} yrs exp
                          </span>
                        </div>

                        {/* AI Match Reason Banner */}
                        <div className="p-3.5 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl space-y-1">
                          <div className="flex items-center gap-1 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[11px]">auto_awesome</span>
                            <span>AI Match Explanation</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                            {item.aiExplanation}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => handleBookChef(item.cook._id)}
                        className="w-full mt-5 bg-primary hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
                      >
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        Book This Chef Instantly
                      </button>

                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-outline-variant p-12 text-center flex flex-col items-center justify-center h-[400px] shadow-sm">
                <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                  <span className="material-symbols-outlined text-2xl animate-pulse">auto_awesome</span>
                </div>
                <h3 className="font-bold text-sm text-on-background">Consult AI Chef Matchmaker</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mt-1.5 leading-relaxed">
                  Enter your custom food preference, cuisine style, and scheduled time in the panel on the left, then trigger matching to search for available chefs!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
