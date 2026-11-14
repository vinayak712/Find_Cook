import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../store/authStore";
import api from "../../api/axios";
import SidebarLayout from "../../components/SidebarLayout";

function StatCard({
  label,
  value,
  color = "text-on-background",
  icon,
  loading,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
          {label}
        </div>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        )}
      </div>
    </div>
  );
}

const COOK_TABS = [
  { id: "overview", label: "Overview", icon: "grid_view" },
  { id: "earnings", label: "Earnings", icon: "payments" },
  { id: "bookings", label: "Bookings", icon: "calendar_month" },
];

export default function CookDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    earnings: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/bookings/cook");
        const bookings = res.data;

        let totalEarnings = 0;
        bookings
          .filter((b) => b.status === "completed")
          .forEach((b) => {
            totalEarnings += b.price || 0;
          });

        setStats({
          total: bookings.length,
          pending: bookings.filter((b) => b.status === "pending").length,
          earnings: totalEarnings,
        });
        setAllBookings(bookings);
        setRecentBookings(bookings.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-700",
  };

  // Calculate earnings by status
  const earningsByStatus = {
    completed: allBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0),
    accepted: allBookings
      .filter((b) => b.status === "accepted")
      .reduce((sum, b) => sum + (b.price || 0), 0),
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-primary via-emerald-600 to-primary rounded-2xl px-6 lg:px-8 py-5 text-white shadow-lg relative overflow-hidden flex-shrink-0 mb-5 mx-6 lg:mx-8">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
          <div className="relative z-10">
            <p className="text-white/90 text-xs font-medium mb-1 uppercase tracking-wide">
              Welcome back
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold mb-3">
              Chef {user?.name ? user.name.split(" ")[0] : "Guest"} 👨‍🍳
            </h1>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("bookings")}
                className="bg-white text-primary font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                View Requests
              </button>
              <Link
                to="/cook/edit-profile"
                className="bg-white/25 hover:bg-white/35 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-white border-b border-gray-100 px-6 lg:px-8 flex-shrink-0 sticky top-0 z-10">
          <div className="flex gap-0">
            {COOK_TABS.map((tab) => (
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
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6 lg:p-8">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-blue-600 text-xl">
                        calendar_month
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                    Total Requests
                  </p>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-blue-700">
                      {stats.total}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-orange-600 text-xl">
                        pending_actions
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
                    Pending
                  </p>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.pending}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-emerald-600 text-xl">
                        payments
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
                    Earnings
                  </p>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-emerald-600">
                      ₹{stats.earnings}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:shadow-lg text-white p-5 rounded-2xl flex items-center gap-4 transition-all shadow-md active:scale-95"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">
                      notifications_active
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-base leading-tight">
                      Manage Requests
                    </p>
                    <p className="text-xs text-white/80">
                      Accept or decline bookings
                    </p>
                  </div>
                </button>
                <Link
                  to="/cook/profile"
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-lg text-white p-5 rounded-2xl flex items-center gap-4 transition-all shadow-md active:scale-95"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">
                      person
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-base leading-tight">
                      View Profile
                    </p>
                    <p className="text-xs text-white/80">
                      See your public page
                    </p>
                  </div>
                </Link>
                <Link
                  to="/cook/edit-profile"
                  className="group bg-gradient-to-br from-primary to-emerald-600 hover:shadow-lg text-white p-5 rounded-2xl flex items-center gap-4 transition-all shadow-md active:scale-95"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">
                      edit
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-base leading-tight">
                      Edit Profile
                    </p>
                    <p className="text-xs text-white/80">Update info & rates</p>
                  </div>
                </Link>
              </div>

              {/* Recent bookings */}
              {recentBookings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-lg text-on-background">
                        Recent Requests
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Latest bookings from customers
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-primary text-xs font-bold hover:underline transition-all"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {recentBookings.map((b, i) => (
                      <div
                        key={b._id}
                        className={`flex items-center justify-between px-5 py-4 ${i < recentBookings.length - 1 ? "border-b border-outline-variant" : ""} hover:bg-surface/50 transition-colors group`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            {b.user?.name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-on-background text-sm">
                              {b.user?.name}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {new Date(b.bookingDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">
                              ₹{b.price}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${statusColors[b.status]}`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h2 className="font-bold text-2xl text-on-background mb-1">
                  Earnings Overview
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Track your completed and pending earnings
                </p>
              </div>

              {/* Earnings summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-green-600 text-xl">
                        trending_up
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
                    Total Earnings
                  </p>
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    ₹{stats.earnings}
                  </p>
                  <p className="text-xs text-green-600/80 font-medium">
                    {allBookings.filter((b) => b.status === "completed").length}{" "}
                    completed bookings
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-amber-600 text-xl">
                        schedule
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
                    Pending Earnings
                  </p>
                  <p className="text-3xl font-bold text-amber-600 mb-2">
                    ₹{earningsByStatus.accepted}
                  </p>
                  <p className="text-xs text-amber-600/80 font-medium">
                    {allBookings.filter((b) => b.status === "accepted").length}{" "}
                    accepted bookings
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-purple-600 text-xl">
                        assessment
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
                    Avg per Booking
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mb-2">
                    ₹
                    {allBookings.filter((b) => b.status === "completed")
                      .length > 0
                      ? Math.round(
                          stats.earnings /
                            allBookings.filter((b) => b.status === "completed")
                              .length,
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-purple-600/80 font-medium">
                    Based on completed
                  </p>
                </div>
              </div>

              {/* All earnings list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-on-background">
                      Earnings History
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Completed and pending bookings
                    </p>
                  </div>
                </div>
                {allBookings.filter(
                  (b) => b.status === "completed" || b.status === "accepted",
                ).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-outline-variant p-8 text-center shadow-sm">
                    <span className="material-symbols-outlined text-gray-300 text-4xl block mb-3">
                      receipt_long
                    </span>
                    <p className="text-on-surface-variant text-sm">
                      No completed or pending earnings yet
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {allBookings
                      .filter(
                        (b) =>
                          b.status === "completed" || b.status === "accepted",
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.bookingDate) - new Date(a.bookingDate),
                      )
                      .map((b, i, arr) => (
                        <div
                          key={b._id}
                          className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-outline-variant" : ""} hover:bg-surface/50 transition-colors group`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                              {b.user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-on-background text-sm">
                                {b.user?.name}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {new Date(b.bookingDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">
                                ₹{b.price}
                              </p>
                              {b.message && (
                                <p className="text-xs text-on-surface-variant max-w-[100px] truncate">
                                  {b.message}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${statusColors[b.status]}`}
                            >
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h2 className="font-bold text-2xl text-on-background mb-1">
                  All Bookings
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Manage and track all your customer bookings
                </p>
              </div>
              {allBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-outline-variant p-8 text-center shadow-sm">
                  <span className="material-symbols-outlined text-gray-300 text-4xl block mb-3">
                    calendar_today
                  </span>
                  <p className="text-on-surface-variant text-sm">
                    No bookings yet
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {allBookings.map((b, i) => (
                    <div
                      key={b._id}
                      className={`flex items-center justify-between px-5 py-4 ${i < allBookings.length - 1 ? "border-b border-outline-variant" : ""} hover:bg-surface/50 transition-colors group`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                          {b.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-on-background text-sm">
                            {b.user?.name}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {new Date(b.bookingDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            ₹{b.price}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${statusColors[b.status]}`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
