import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';

const STEPS = [
  { id: 1, label: 'Personal Details', icon: 'person' },
  { id: 2, label: 'Food Gallery', icon: 'image' },
  { id: 3, label: 'Culinary Expertise', icon: 'restaurant_menu' },
  { id: 4, label: 'Pricing & Service', icon: 'payments' },
  { id: 5, label: 'Review & Save', icon: 'check_circle' },
];

const CUISINE_SUGGESTIONS = [
  'Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese',
  'Mediterranean', 'Thai', 'French', 'Continental', 'South Indian',
  'Mughlai', 'American', 'Plant-Based', 'Vegan', 'Desserts',
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    cuisines: [],
    experience: '',
    city: '',
    state: '',
    country: 'India',
    pricePerDay: '',
    bio: '',
    availability: true,
    foodImages: [],
  });

  const [cuisineInput, setCuisineInput] = useState('');

  // Load existing profile
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cook/cook-profile/me');
        const p = res.data;
        setForm({
          cuisines: p.cuisines || [],
          experience: p.experience || '',
          city: p.location?.city || '',
          state: p.location?.state || '',
          country: p.location?.country || 'India',
          pricePerDay: p.pricePerDay || '',
          bio: p.bio || '',
          availability: p.availability !== undefined ? p.availability : true,
          foodImages: p.foodImages || [],
        });
      } catch {
        // No profile yet, start fresh
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addCuisine = (name) => {
    const trimmed = name.trim();
    if (trimmed && !form.cuisines.includes(trimmed)) {
      setForm(f => ({ ...f, cuisines: [...f.cuisines, trimmed] }));
    }
    setCuisineInput('');
  };

  const removeCuisine = (name) => {
    setForm(f => ({ ...f, cuisines: f.cuisines.filter(c => c !== name) }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target.result;
          try {
            // Upload to backend which sends to Cloudinary
            const res = await api.post('/cook/upload-food-image', {
              imageData: base64,
              caption: ''
            });
            
            // Add the returned URL to form
            setForm(f => ({
              ...f,
              foodImages: [...f.foodImages, { url: res.data.url, caption: '' }]
            }));
          } catch (err) {
            alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = async (index) => {
    const imageUrl = form.foodImages[index].url;
    try {
      // Notify backend to delete from Cloudinary
      await api.delete('/cook/remove-food-image', {
        data: { imageUrl }
      });
      
      // Remove from form
      setForm(f => ({
        ...f,
        foodImages: f.foodImages.filter((_, i) => i !== index)
      }));
    } catch (err) {
      alert('Failed to remove image: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateImageCaption = (index, caption) => {
    setForm(f => {
      const updated = [...f.foodImages];
      updated[index].caption = caption;
      return { ...f, foodImages: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/cook/cook-profile', {
        cuisines: form.cuisines,
        experience: Number(form.experience),
        location: { city: form.city, state: form.state, country: form.country },
        pricePerDay: Number(form.pricePerDay),
        bio: form.bio,
        availability: form.availability,
        foodImages: form.foodImages,
      });
      navigate('/cook/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return true;
    if (step === 2) return true; // Food gallery is optional
    if (step === 3) return form.cuisines.length > 0 && form.experience;
    if (step === 4) return form.city && form.pricePerDay;
    return true;
  };

  const benefits = [
    { icon: 'verified', color: 'text-emerald-500 bg-emerald-50', title: 'Verified Status', desc: 'Earn trust with a verified badge on your profile.' },
    { icon: 'calendar_month', color: 'text-blue-500 bg-blue-50', title: 'Flexible Booking', desc: 'Set your own schedule and manage availability.' },
    { icon: 'lock', color: 'text-primary bg-primary/10', title: 'Secure Payments', desc: 'Get paid securely within 48 hours of completion.' },
  ];

  return (
    <SidebarLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left sidebar steps */}
          <aside className="lg:w-64 bg-white border-r border-outline-variant p-6 flex-shrink-0">
            <div className="mb-6">
              <h2 className="font-bold text-on-background text-lg">Cook Profile Setup</h2>
              <p className="text-xs text-on-surface-variant mt-1">Complete these steps to start receiving bookings.</p>
            </div>

            <ol className="space-y-3">
              {STEPS.map((s) => {
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors
                      ${done ? 'bg-primary text-white' : active ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-surface text-on-surface-variant border-2 border-outline-variant'}`}
                    >
                      {done
                        ? <span className="material-symbols-outlined text-sm">check</span>
                        : s.id}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-primary' : done ? 'text-on-background' : 'text-on-surface-variant'}`}>
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Benefits */}
            <div className="mt-10 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-primary mb-3">Why complete your profile?</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">trending_up</span>
                  Profiles with bios get 3× more bookings
                </li>
                <li className="flex items-start gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">star</span>
                  Detailed profiles appear first in search
                </li>
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 lg:p-10 overflow-auto">
            {/* Step header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">
                <span className="material-symbols-outlined text-primary text-sm">{STEPS[step - 1].icon}</span>
                Step {step} of {STEPS.length}
              </div>
              <h1 className="text-2xl font-bold text-on-background">{STEPS[step - 1].label}</h1>
            </div>

            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="max-w-xl space-y-6">
                <div className="bg-gradient-to-r from-primary to-emerald-400 rounded-2xl p-6 text-white mb-6">
                  <h3 className="font-bold text-lg mb-1">Welcome, Chef! 👨‍🍳</h3>
                  <p className="text-white/80 text-sm">Let's craft your professional presence.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">Professional Bio</label>
                  <textarea
                    rows={5}
                    maxLength={500}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Share your culinary journey, philosophy, and what clients can expect when booking you..."
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none text-sm bg-white"
                  />
                  <p className="text-xs text-on-surface-variant text-right mt-1">{form.bio.length} / 500 characters</p>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-outline-variant">
                  <div>
                    <p className="font-bold text-sm text-on-background">Available for Hire</p>
                    <p className="text-xs text-on-surface-variant">Turn off to pause new bookings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, availability: !f.availability }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.availability ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.availability ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Food Gallery */}
            {step === 2 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-on-background mb-2">Showcase Your Dishes</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Upload photos of your signature dishes and creations. Great photos help customers understand your style!</p>
                </div>

                {/* Image upload area */}
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-3">Upload Food Photos</label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-primary text-4xl mb-2">image_search</span>
                      <p className="text-sm text-on-surface-variant font-bold">Click to upload or drag and drop</p>
                      <p className="text-xs text-on-surface-variant">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image gallery preview */}
                {form.foodImages.length > 0 && (
                  <div>
                    <h4 className="font-bold text-on-background mb-3 text-sm">Your Food Photos ({form.foodImages.length})</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {form.foodImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-outline-variant">
                            <img 
                              src={img.url} 
                              alt={`Food ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Add caption (optional)"
                            value={img.caption || ''}
                            onChange={(e) => updateImageCaption(idx, e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Culinary Expertise */}
            {step === 2 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-3">Cuisines You Specialize In</label>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                    {form.cuisines.map(c => (
                      <span key={c} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                        {c}
                        <button type="button" onClick={() => removeCuisine(c)} className="hover:text-red-500 ml-1 text-xs">✕</button>
                      </span>
                    ))}
                  </div>
                  {/* Quick select suggestions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CUISINE_SUGGESTIONS.filter(s => !form.cuisines.includes(s)).slice(0, 10).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addCuisine(s)}
                        className="px-3 py-1.5 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary rounded-full text-xs transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                  {/* Custom input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cuisineInput}
                      onChange={e => setCuisineInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCuisine(cuisineInput); } }}
                      placeholder="Type a cuisine and press Enter or Add"
                      className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => addCuisine(cuisineInput)}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Years of Experience</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">work</span>
                      <input
                        type="number"
                        min="0"
                        value={form.experience}
                        onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                        placeholder="e.g. 8"
                        className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Location (City, State)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">location_on</span>
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="e.g. Mumbai"
                        className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing & Service */}
            {step === 4 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">Daily Rate (₹ or $)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">$</span>
                    <input
                      type="number"
                      min="0"
                      value={form.pricePerDay}
                      onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))}
                      placeholder="450"
                      className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-lg font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">/ day</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Clients can propose a different price — you can accept or decline.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">State / Region</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                  />
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="text-center p-4 bg-white rounded-xl border border-outline-variant">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${b.color}`}>
                        <span className="material-symbols-outlined text-xl">{b.icon}</span>
                      </div>
                      <p className="font-bold text-xs text-on-background mb-1">{b.title}</p>
                      <p className="text-xs text-on-surface-variant">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Review & Save */}
            {step === 5 && (
              <div className="max-w-xl">
                <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 space-y-4 mb-6">
                  <h3 className="font-bold text-on-background mb-2">Profile Summary</h3>

                  <div className="flex items-center gap-2 py-3 border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">Cuisines</p>
                      <p className="font-bold text-sm text-on-background">{form.cuisines.join(', ') || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-3 border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary">work</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">Experience</p>
                      <p className="font-bold text-sm text-on-background">{form.experience ? `${form.experience} years` : 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-3 border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">Location</p>
                      <p className="font-bold text-sm text-on-background">
                        {[form.city, form.state, form.country].filter(Boolean).join(', ') || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-3 border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">Daily Rate</p>
                      <p className="font-bold text-sm text-primary">{form.pricePerDay ? `$${form.pricePerDay}` : 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">Availability</p>
                      <p className={`font-bold text-sm ${form.availability ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {form.availability ? 'Available for Hire' : 'Paused'}
                      </p>
                    </div>
                  </div>
                  {form.foodImages.length > 0 && (
                    <div className="py-3">
                      <p className="text-xs text-on-surface-variant mb-2">Food Photos ({form.foodImages.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {form.foodImages.map((img, idx) => (
                          <div key={idx} className="w-full h-20 rounded-lg overflow-hidden border border-outline-variant">
                            <img src={img.url} alt={`Food ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4">{error}</div>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-outline-variant max-w-xl">
              <button
                type="button"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Back
              </button>

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2 bg-primary hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Continue to Next Step
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 text-sm"
                >
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><span className="material-symbols-outlined text-xl">check_circle</span> Save Profile</>}
                </button>
              )}
            </div>
          </main>
        </div>
      )}
    </SidebarLayout>
  );
}
