import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';

export default function CookProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/cook/cook-profile/me');
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError('no-profile');
        } else {
          setError('failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <SidebarLayout><Loader /></SidebarLayout>;

  if (error === 'no-profile') {
    return (
      <SidebarLayout>
        <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">person_add</span>
            </div>
            <h2 className="text-2xl font-bold text-on-background mb-3">Set Up Your Profile</h2>
            <p className="text-on-surface-variant mb-8">Create your cook profile so clients can find and book you.</p>
            <Link to="/cook/edit-profile" className="inline-block bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-sm">
              Create Profile Now
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error === 'failed') {
    return <SidebarLayout><div className="p-10 text-center text-error">Failed to load profile. Please refresh.</div></SidebarLayout>;
  }

  const avgRating = profile?.rating ? profile.rating.toFixed(1) : null;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-background">My Profile</h1>
            <p className="text-on-surface-variant mt-1">This is how clients see your profile.</p>
          </div>
          <Link
            to="/cook/edit-profile"
            className="flex items-center gap-2 bg-white border border-outline-variant text-on-surface hover:bg-surface px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Profile
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary to-emerald-400 relative">
            <div className="absolute -bottom-8 left-8">
              <div className="w-24 h-24 rounded-3xl bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-4xl shadow-inner overflow-hidden border border-primary/30">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.user?.name?.charAt(0)?.toUpperCase() || 'C'
                )}
              </div>
            </div>
          </div>

          <div className="pt-12 px-8 pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-on-background flex items-center gap-2">
                  {profile.user?.name}
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${profile.availability ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.availability ? '● Available' : '○ Unavailable'}
                  </span>
                </h2>
                <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {profile.location?.city}{profile.location?.state ? `, ${profile.location.state}` : ''}
                </p>
              </div>
              {avgRating && (
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                  <span className="text-orange-400 text-xl">★</span>
                  <div>
                    <p className="font-bold text-on-background">{avgRating}</p>
                    <p className="text-xs text-on-surface-variant">{profile.reviews?.length || 0} reviews</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-surface rounded-xl p-4 border border-outline-variant">
                <p className="text-xs text-on-surface-variant mb-1">Experience</p>
                <p className="font-bold text-on-background">{profile.experience} Years</p>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-outline-variant">
                <p className="text-xs text-on-surface-variant mb-1">Daily Rate</p>
                <p className="font-bold text-primary text-lg">₹{profile.pricePerDay}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-outline-variant">
                <p className="text-xs text-on-surface-variant mb-1">Specialties</p>
                <p className="font-bold text-on-background">{profile.cuisines?.length || 0} cuisines</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-2">About Me</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed bg-surface p-4 rounded-xl border border-outline-variant">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Cuisines */}
            <div>
              <h3 className="font-bold text-sm text-on-surface-variant uppercase mb-3">Cuisines You Specialize In</h3>
              <div className="flex flex-wrap gap-2">
                {profile.cuisines?.map((c, i) => (
                  <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-8">
          <h3 className="font-bold text-on-background mb-5 flex items-center gap-2">
            <span className="text-orange-400">★</span>
            Client Reviews
            <span className="text-xs text-on-surface-variant font-normal">({profile.reviews?.length || 0})</span>
          </h3>

          {!profile.reviews || profile.reviews.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <p className="text-3xl mb-3">💬</p>
              <p>No reviews yet. Complete some bookings to get your first review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((rev, i) => (
                <div key={i} className="p-4 bg-surface rounded-xl border border-outline-variant">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm text-on-background">Anonymous User</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-sm ${s <= rev.rating ? 'text-orange-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-sm text-on-surface-variant italic">"{rev.comment}"</p>}
                  <p className="text-xs text-on-surface-variant mt-2">{new Date(rev.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
