import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';

export default function CookReviews() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/cook/cook-profile/me');
        setReviews(res.data.reviews || []);
        setRating(res.data.rating || 0);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Calculate rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(rev => {
    const r = Math.round(rev.rating);
    if (ratingBreakdown[r] !== undefined) {
      ratingBreakdown[r]++;
    }
  });

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-background">Client Reviews</h1>
          <p className="text-on-surface-variant mt-1">See what your clients are saying about your cooking and services.</p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews Summary Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Average Rating</h3>
                <div className="text-5xl font-extrabold text-on-background mb-3">{rating ? rating.toFixed(1) : '0.0'}</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={`text-2xl ${star <= Math.round(rating) ? 'text-orange-400' : 'text-gray-200'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant font-medium">Based on {totalReviews} reviews</p>
              </div>

              {/* Progress Bars */}
              <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Rating Distribution</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingBreakdown[stars];
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-3 text-xs font-bold text-on-surface-variant">{stars}</span>
                        <span className="text-xs text-orange-400">★</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-6 text-xs text-right text-on-surface-variant font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-on-background">Latest Feedback</h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-on-background mb-2">No reviews yet</h3>
                  <p className="text-on-surface-variant text-sm">When clients complete a booking, their reviews will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <p className="font-bold text-on-background text-sm">
                            {rev.user?.name || 'Anonymous Client'}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-0.5 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`text-xs ${star <= rev.rating ? 'text-orange-400' : 'text-gray-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {rev.comment ? (
                        <p className="text-on-surface-variant text-sm italic bg-surface/50 p-4 rounded-xl border border-dashed border-outline-variant leading-relaxed">
                          "{rev.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">No comment provided</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
