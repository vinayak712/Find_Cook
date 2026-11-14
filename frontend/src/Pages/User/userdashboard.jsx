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
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="flex flex-col h-full bg-[#f9fafb]">
        {/* Modern Header Banner */}
        <div className="px-6 lg:px-8 pt-6 pb-2 flex-shrink-0">
          <div className="bg-gradient-to-r from-emerald-600 via-primary to-teal-500 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Ambient Background Glows */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md">
                Client Hub
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold mt-3 tracking-tight">
                Welcome back, {user?.name ? user.name.split(" ")[0] : "Guest"}! 👋
              </h1>
              <p className="text-white/80 text-xs lg:text-sm mt-1 max-w-md font-medium">
                Discover exceptional chefs near you or manage your culinary reservations in one place.
              </p>
            </div>

            {/* Quick Stats Grid in Banner */}
            <div className="relative z-10 flex gap-3">
              {[
                {
                  label: "Total Bookings",
                  value: stats.total,
                  icon: "calendar_month",
                  bg: "bg-white/15 hover:bg-white/20",
                },
                {
                  label: "Pending Approvals",
                  value: stats.pending,
                  icon: "pending_actions",
                  bg: "bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/20",
                },
                {
                  label: "Active Bookings",
                  value: stats.accepted,
                  icon: "task_alt",
                  bg: "bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/20",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} rounded-2xl px-4 py-3 text-center min-w-[95px] backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-white/90">
                    <span className="material-symbols-outlined text-sm font-bold">{s.icon}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wider mt-0.5">
                    {s.label.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="px-6 lg:px-8 py-3 flex-shrink-0">
          <div className="bg-gray-100 p-1 rounded-2xl flex max-w-md border border-gray-200/50 shadow-inner">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 relative
                  ${
                    activeTab === tab.id
                      ? "bg-white text-primary shadow-md"
                      : "text-on-surface-variant hover:text-on-background"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
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
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white animate-pulse">
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
            <div className="px-6 lg:px-8 py-4 animate-fade-in">
              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-3xl border border-outline-variant shadow-sm"
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
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all focus:bg-white"
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
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all focus:bg-white"
                  />
                </div>
                <div className="relative sm:w-40">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                    currency_rupee
                  </span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={searchMaxPrice}
                    onChange={(e) => setSearchMaxPrice(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-surface transition-all focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-102 active:scale-98 flex items-center gap-1 justify-center whitespace-nowrap text-sm"
                >
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  <span>Search</span>
                </button>
                {(searchCity || searchCuisine || searchMaxPrice) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="border border-outline-variant text-on-surface-variant hover:bg-surface hover:border-primary px-4 py-2.5 rounded-xl text-xs transition-all font-bold"
                  >
                    Clear
                  </button>
                )}
              </form>

              {cooksLoading ? (
                <Loader />
              ) : cooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-outline-variant shadow-sm">
                  <div className="text-5xl mb-3">👨‍🍳</div>
                  <h3 className="text-lg font-bold text-on-background mb-1">
                    No cooks available
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-5">
                    Try adjusting your filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="bg-primary hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-on-surface-variant mb-4 font-bold tracking-wide uppercase">
                    {cooks.length} cook{cooks.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
            <div className="px-6 lg:px-8 py-4 max-w-4xl animate-fade-in">
              <h2 className="font-bold text-lg text-on-background mb-4">
                My Bookings
              </h2>
              {bookingsLoading ? (
                <Loader />
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-outline-variant shadow-sm">
                  <div className="text-5xl mb-3">📅</div>
                  <h3 className="text-lg font-bold text-on-background mb-1">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-5">
                    Go to <strong>Find Cooks</strong> to book a professional chef.
                  </p>
                  <button
                    onClick={() => setActiveTab("cooks")}
                    className="bg-primary hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Find a Cook
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const cfg =
                      statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all hover:border-primary/20 p-5 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                              {booking.cook?.user?.name?.charAt(0) || "C"}
                            </div>
                            <div>
                              <p className="font-bold text-on-background text-sm">
                                {booking.cook?.user?.name || "Unknown Cook"}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {new Date(
                                  booking.bookingDate,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              {booking.message && (
                                <p className="text-xs text-on-surface-variant mt-2 italic bg-surface p-2 rounded-lg border border-outline-variant leading-relaxed">
                                  "{booking.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="font-extrabold text-base text-primary mr-1">
                              ₹{booking.price || booking.cook?.pricePerDay}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                            {booking.status === "accepted" && (
                              <button
                                onClick={() => handleMarkCompleted(booking._id)}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <span>✓ Done</span>
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
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <span>★ Review</span>
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
            <div className="px-6 lg:px-8 py-4 max-w-7xl mx-auto animate-fade-in space-y-8">
              {/* Activity Overview Header */}
              <div>
                <h2 className="font-bold text-lg text-on-background">
                  Activity Overview
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Real-time update on your current bookings status.</p>
              </div>

              {/* Redesigned Premium Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Orders",
                    value: stats.total,
                    icon: "calendar_month",
                    color: "text-slate-700",
                    accent: "border-l-4 border-l-slate-500",
                    bg: "bg-white",
                  },
                  {
                    label: "Pending Cook",
                    value: stats.pending,
                    icon: "pending_actions",
                    color: "text-amber-600",
                    accent: "border-l-4 border-l-amber-500",
                    bg: "bg-amber-50/20",
                  },
                  {
                    label: "Active Bookings",
                    value: stats.accepted,
                    icon: "check_circle",
                    color: "text-emerald-600",
                    accent: "border-l-4 border-l-emerald-500",
                    bg: "bg-emerald-50/10",
                  },
                  {
                    label: "Completed",
                    value: stats.completed,
                    icon: "done_all",
                    color: "text-primary",
                    accent: "border-l-4 border-l-primary",
                    bg: "bg-green-50/10",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.bg} ${s.accent} p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-3xl font-black ${s.color}`}>
                          {s.value}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-wider">
                          {s.label}
                        </p>
                      </div>
                      <span
                        className={`material-symbols-outlined text-xl ${s.color} bg-white p-2 rounded-xl border border-outline-variant shadow-inner group-hover:scale-110 transition-transform`}
                      >
                        {s.icon}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Three Column Layout for Bookings & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings List & Featured Cooks (Takes 2 Cols) */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Recent Bookings Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-on-background">
                        Recent Bookings
                      </h3>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="text-primary text-xs font-bold hover:underline transition-all flex items-center gap-0.5"
                      >
                        <span>View all</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-outline-variant p-8 text-center shadow-sm">
                        <p className="text-sm text-on-surface-variant">
                          No bookings yet.{" "}
                          <button
                            onClick={() => setActiveTab("cooks")}
                            className="text-primary font-bold hover:underline"
                          >
                            Find a cook now
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {bookings.slice(0, 3).map((b, i) => {
                          const cfg =
                            statusConfig[b.status] || statusConfig.pending;
                          return (
                            <div
                              key={b._id}
                              className={`flex items-center justify-between px-5 py-4 ${i < Math.min(bookings.length, 3) - 1 ? "border-b border-outline-variant" : ""} hover:bg-surface/30 transition-colors group`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                  {b.cook?.user?.name?.charAt(0) || "C"}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-on-background text-sm truncate">
                                    {b.cook?.user?.name || "Cook"}
                                  </p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">
                                    {new Date(b.bookingDate).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric", year: "numeric" },
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                <span className="font-extrabold text-primary text-sm">
                                  ${b.price || b.cook?.pricePerDay}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${cfg.cls}`}
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

                  {/* Featured Cooks Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-on-background">
                        Featured Cooks Near You
                      </h3>
                      <button
                        onClick={() => setActiveTab("cooks")}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Explore all chefs</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>

                    {cooksLoading ? (
                      <Loader />
                    ) : cooks.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-outline-variant p-8 text-center text-sm text-on-surface-variant">
                        No chefs available at the moment.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cooks.slice(0, 2).map((cook) => (
                          <CookCard key={cook._id} cook={cook} />
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Quick Actions & Spotlight (Takes 1 Col) */}
                <div className="space-y-8">
                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-on-background">
                      Quick Actions
                    </h3>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setActiveTab("cooks")}
                        className="group bg-gradient-to-br from-primary to-emerald-700 hover:shadow-lg text-white p-5 rounded-2xl flex items-center gap-4 transition-all shadow-md active:scale-95"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                          <span className="material-symbols-outlined text-white text-lg">
                            search
                          </span>
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="font-bold text-sm leading-tight">
                            Find a Cook
                          </h3>
                          <p className="text-white/80 text-[10px] mt-0.5 font-medium">
                            Browse available chefs
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="group bg-white hover:bg-surface border border-outline-variant hover:border-primary/30 p-5 rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-lg animate-pulse">
                            calendar_month
                          </span>
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="font-bold text-on-background text-sm leading-tight">
                            My Bookings
                          </h3>
                          <p className="text-on-surface-variant text-[10px] mt-0.5 font-medium">
                            Manage your requests
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Premium Spotlight Card */}
                  <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                    <div className="absolute left-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />
                    
                    <span className="bg-emerald-500/25 text-emerald-300 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Gourmet Spotlight
                    </span>
                    <h4 className="text-base font-extrabold mt-4 leading-snug">
                      Elevate Your Dining Experience
                    </h4>
                    <p className="text-white/70 text-[11px] mt-2 leading-relaxed font-medium">
                      Planning a special occasion, hosting a dinner party, or just looking to enjoy healthy premium meals? Book a dedicated culinary expert to cook fresh in your home kitchen.
                    </p>
                    
                    <button
                      onClick={() => setActiveTab("cooks")}
                      className="mt-5 w-full bg-white hover:bg-emerald-50 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span>Find Your Personal Chef</span>
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                  </div>

                  {/* Trending Cuisines Card */}
                  <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm space-y-4">
                    <h4 className="font-bold text-xs text-on-background uppercase tracking-wider">
                      Trending Cuisines
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Italian', icon: '🍕' },
                        { name: 'Japanese', icon: '🍣' },
                        { name: 'Indian', icon: '🍛' },
                        { name: 'Mexican', icon: '🌮' },
                        { name: 'French', icon: '🥐' },
                        { name: 'Thai', icon: '🍜' }
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSearchCuisine(c.name);
                            setActiveTab("cooks");
                            fetchCooks("", c.name, "");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f9fafb] hover:bg-primary/10 border border-outline-variant hover:border-primary/30 rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary transition-all duration-200"
                        >
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
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
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-xs transition-all bg-surface focus:bg-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="flex-1 px-3 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface rounded-xl font-bold transition-all text-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95"
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
