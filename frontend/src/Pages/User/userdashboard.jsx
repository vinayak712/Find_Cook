import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../store/authStore";
import api from "../../api/axios";
import SidebarLayout from "../../components/SidebarLayout";
import CookCard from "../../components/cookcard";
import Loader from "../../components/loader";

const TABS = [
  { id: "cooks", label: "Find Cooks", icon: "restaurant" },
  { id: "bookings", label: "My Bookings", icon: "calendar_month" },
  { id: "overview", label: "Overview", icon: "grid_view" },
];

const statusConfig = {
  pending: { cls: "bg-yellow-100 text-yellow-800", label: "Pending" },
  accepted: { cls: "bg-emerald-100 text-emerald-800", label: "Accepted" },
  rejected: { cls: "bg-red-100 text-red-800", label: "Rejected" },
  completed: { cls: "bg-gray-100 text-gray-700", label: "Completed" },
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-4xl transition-all transform hover:scale-125 active:scale-110 ${star <= value ? "text-orange-400 drop-shadow-md" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("cooks");

  // Cooks tab state
  const [cooks, setCooks] = useState([]);
  const [cooksLoading, setCooksLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchCuisine, setSearchCuisine] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");

  // Bookings tab state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Overview stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  // Load cooks
  const fetchCooks = async (
    city = searchCity,
    cuisine = searchCuisine,
    maxPrice = searchMaxPrice,
  ) => {
    setCooksLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (cuisine) params.append("cuisine", cuisine);
      if (maxPrice) params.append("maxPrice", maxPrice);
      const url = params.toString()
        ? `/cook/search-cook?${params}`
        : "/cook/all-cook";
      const res = await api.get(url);
      setCooks(res.data);
    } catch {
      /* silent */
    } finally {
      setCooksLoading(false);
    }
  };

  // Load bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get("/bookings/user");
      const data = res.data;
      setBookings(data);
      setStats({
        total: data.length,
        pending: data.filter((b) => b.status === "pending").length,
        accepted: data.filter((b) => b.status === "accepted").length,
        completed: data.filter((b) => b.status === "completed").length,
      });
    } catch {
      /* silent */
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchCooks();
    fetchBookings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCooks();
  };

  const handleReset = () => {
    setSearchCity("");
    setSearchCuisine("");
    setSearchMaxPrice("");
    fetchCooks("", "", "");
  };

  const handleMarkCompleted = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: "completed" });
      fetchBookings();
    } catch {
      alert("Failed to mark as completed");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post(`/cook/${reviewModal.cookId}/review`, { rating, comment });
      setReviewModal(null);
      setRating(5);
      setComment("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full">
        {/* Top greeting bar */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 px-6 lg:px-8 py-3 flex items-center justify-between flex-shrink-0 backdrop-blur-sm">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-on-background">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-xs text-on-surface-variant">
              Discover talented chefs or manage your bookings
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {[
              {
                label: "Total",
                value: stats.total,
                color: "text-on-background",
                bg: "bg-gray-50",
              },
              {
                label: "Pending",
                value: stats.pending,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                label: "Active",
                value: stats.accepted,
                color: "text-primary",
                bg: "bg-primary/5",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-xl px-3 py-2 text-center min-w-[70px] border border-primary/10 shadow-sm hover:shadow-md transition-shadow`}
              >
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-gray-100 px-6 lg:px-8 flex-shrink-0 sticky top-0 z-10">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all relative group
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-background"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110"
                  style={
                    activeTab === tab.id
                      ? { fontVariationSettings: "'FILL' 1" }
                      : {}
                  }
                >
                  {tab.icon}
                </span>
                {tab.label}
                {tab.id === "bookings" && stats.pending > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {/* ── FIND COOKS TAB ── */}
          {activeTab === "cooks" && (
            <div className="px-6 lg:px-10 py-5">
              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 mb-6 bg-white p-4 rounded-2xl border border-outline-variant shadow-sm"
              >
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                    location_on
                  </span>
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                    restaurant_menu
                  </span>
                  <input
                    type="text"
                    placeholder="Cuisine"
                    value={searchCuisine}
                    onChange={(e) => setSearchCuisine(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all"
                  />
                </div>
                <div className="relative sm:w-40">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                    attach_money
                  </span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={searchMaxPrice}
                    onChange={(e) => setSearchMaxPrice(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1 justify-center whitespace-nowrap text-sm"
                >
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  <span className="hidden sm:inline">Search</span>
                </button>
                {(searchCity || searchCuisine || searchMaxPrice) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="border border-outline-variant text-on-surface-variant hover:bg-surface hover:border-primary px-3 py-2.5 rounded-lg text-xs transition-all font-medium"
                  >
                    Clear
                  </button>
                )}
              </form>

              {cooksLoading ? (
                <Loader />
              ) : cooks.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-surface to-white rounded-2xl border border-outline-variant shadow-sm">
                  <div className="text-5xl mb-2">👨‍🍳</div>
                  <h3 className="text-lg font-bold text-on-background mb-1">
                    No cooks available
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Try adjusting your filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="bg-primary hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-on-surface-variant mb-4 font-medium">
                    {cooks.length} cook{cooks.length !== 1 ? "s" : ""} available
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {cooks.map((cook) => (
                      <CookCard key={cook._id} cook={cook} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── MY BOOKINGS TAB ── */}
          {activeTab === "bookings" && (
            <div className="px-6 lg:px-10 py-5 max-w-4xl">
              <h2 className="font-bold text-lg text-on-background mb-4">
                My Bookings
              </h2>
              {bookingsLoading ? (
                <Loader />
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-surface to-white rounded-2xl border border-outline-variant shadow-sm">
                  <div className="text-5xl mb-2">📅</div>
                  <h3 className="text-lg font-bold text-on-background mb-1">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Go to <strong>Find Cooks</strong> to book a professional
                    chef.
                  </p>
                  <button
                    onClick={() => setActiveTab("cooks")}
                    className="bg-primary hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Find a Cook
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const cfg =
                      statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all hover:border-primary/20 p-4 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                              {booking.cook?.user?.name?.charAt(0) || "C"}
                            </div>
                            <div>
                              <p className="font-bold text-on-background text-sm">
                                {booking.cook?.user?.name || "Unknown Cook"}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {new Date(
                                  booking.bookingDate,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              {booking.message && (
                                <p className="text-xs text-on-surface-variant mt-1 italic bg-surface/50 rounded px-2 py-0.5">
                                  "{booking.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-primary">
                              ${booking.price || booking.cook?.pricePerDay}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                            {booking.status === "accepted" && (
                              <button
                                onClick={() => handleMarkCompleted(booking._id)}
                                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                              >
                                ✓ Done
                              </button>
                            )}
                            {booking.status === "completed" && (
                              <button
                                onClick={() =>
                                  setReviewModal({
                                    bookingId: booking._id,
                                    cookId: booking.cook?._id,
                                    cookName: booking.cook?.user?.name,
                                  })
                                }
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                              >
                                ★ Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="px-6 lg:px-10 py-5 max-w-3xl">
              <h2 className="font-bold text-lg text-on-background mb-4">
                Activity Overview
              </h2>

              {/* Big stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Total",
                    value: stats.total,
                    icon: "calendar_month",
                    color: "text-on-background",
                    bg: "bg-white border-outline-variant",
                  },
                  {
                    label: "Pending",
                    value: stats.pending,
                    icon: "pending_actions",
                    color: "text-orange-500",
                    bg: "bg-orange-50 border-orange-200",
                  },
                  {
                    label: "Accepted",
                    value: stats.accepted,
                    icon: "check_circle",
                    color: "text-primary",
                    bg: "bg-primary/5 border-primary/20",
                  },
                  {
                    label: "Completed",
                    value: stats.completed,
                    icon: "done_all",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50 border-emerald-200",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.bg} p-4 rounded-xl border shadow-sm hover:shadow-md transition-all group cursor-pointer`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`material-symbols-outlined text-lg ${s.color} group-hover:scale-110 transition-transform`}
                      >
                        {s.icon}
                      </span>
                      <div>
                        <p className={`text-2xl font-bold ${s.color}`}>
                          {s.value}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent bookings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-on-background">
                    Recent Bookings
                  </h3>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-primary text-xs font-semibold hover:underline transition-all"
                  >
                    View all →
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <div className="bg-gradient-to-br from-surface to-white rounded-xl border border-outline-variant p-6 text-center shadow-sm">
                    <p className="text-sm text-on-surface-variant">
                      No bookings yet.{" "}
                      <button
                        onClick={() => setActiveTab("cooks")}
                        className="text-primary font-semibold hover:underline"
                      >
                        Find a cook now
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {bookings.slice(0, 5).map((b, i) => {
                      const cfg =
                        statusConfig[b.status] || statusConfig.pending;
                      return (
                        <div
                          key={b._id}
                          className={`flex items-center justify-between px-4 py-3 ${i < Math.min(bookings.length, 5) - 1 ? "border-b border-outline-variant" : ""} hover:bg-surface/30 transition-colors group`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                              {b.cook?.user?.name?.charAt(0) || "C"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-on-background text-xs truncate">
                                {b.cook?.user?.name || "Cook"}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {new Date(b.bookingDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="font-bold text-primary text-xs">
                              ${b.price || b.cook?.pricePerDay}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("cooks")}
                  className="group bg-gradient-to-br from-primary to-emerald-700 hover:shadow-lg text-white p-4 rounded-xl flex items-center gap-3 transition-all shadow-md active:scale-95"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-lg">
                      search
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-bold text-sm leading-tight">
                      Find a Cook
                    </h3>
                    <p className="text-white/80 text-xs">
                      Browse available chefs.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="group bg-white hover:bg-surface border border-outline-variant hover:border-primary/30 p-4 rounded-xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">
                      calendar_month
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-bold text-on-background text-sm leading-tight">
                      My Bookings
                    </h3>
                    <p className="text-on-surface-variant text-xs">
                      Manage your requests.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-2xl text-orange-500">
                rate_review
              </span>
              <h2 className="text-lg font-bold text-on-background">
                Rate Your Experience
              </h2>
            </div>
            <p className="text-on-surface-variant text-sm mb-5">
              With{" "}
              <span className="font-bold text-primary">
                {reviewModal.cookName}
              </span>
            </p>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">
                  Your Rating
                </label>
                <div className="flex gap-1 justify-center">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">
                  Review (optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the food? Would you recommend?"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-xs transition-all bg-surface"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="flex-1 px-3 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface rounded-lg font-semibold transition-all text-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95"
                >
                  {reviewLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
