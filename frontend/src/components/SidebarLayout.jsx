import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

const userNav = [
  { to: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { to: '/my-bookings', icon: 'calendar_month', label: 'My Bookings' },
  { to: '/search', icon: 'search', label: 'Find a Cook' },
];

const cookNav = [
  { to: '/cook/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { to: '/cook/bookings', icon: 'calendar_month', label: 'Bookings' },
  { to: '/cook/profile', icon: 'person', label: 'My Profile' },
  { to: '/cook/edit-profile', icon: 'edit', label: 'Edit Profile' },
];

export default function SidebarLayout({ children }) {
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'cook' ? cookNav : userNav;
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const Sidebar = () => (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          <span className="text-lg font-bold text-on-background tracking-tight">FindCOOK</span>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-on-background truncate">{user?.name}</p>
            <p className="text-xs text-primary/80 font-medium">
              {user?.role === 'cook' ? 'Professional Chef' : 'Home Enthusiast'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 py-2">Menu</p>
        {navItems.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-gray-50 hover:text-on-background'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? 'text-white' : ''}`}
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 space-y-1">
        {user?.role === 'cook' && (
          <Link
            to="/cook/edit-profile"
            className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold py-2.5 rounded-xl text-sm transition-all mb-2 border border-primary/20"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
            Available for Hire
          </Link>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-red-50 hover:text-red-500 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6f8] font-body-md text-on-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed top-0 left-0 z-50 lg:hidden">
          <Sidebar />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-50 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            </div>
            <span className="font-bold text-on-background">FindCOOK</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
