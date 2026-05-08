import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";

export default function Navbar({ transparent = false }) {
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();

  const headerClass = transparent 
    ? "absolute top-0 w-full z-50 bg-transparent font-['Plus_Jakarta_SANS'] antialiased"
    : "sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 font-['Plus_Jakarta_SANS'] antialiased";

  const textColor = transparent ? "text-white" : "text-on-background";
  const textMuted = transparent ? "text-white/80 hover:text-white" : "text-on-surface-variant hover:text-primary";
  const btnClass = transparent
    ? "hidden sm:block text-white/90 font-medium px-4 py-2 hover:text-white transition-all active:scale-95"
    : "hidden sm:block text-on-surface-variant font-medium px-4 py-2 hover:text-primary transition-all active:scale-95";

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
        <div className="flex items-center gap-8">
          <Link to="/" className={`text-2xl font-bold tracking-tight ${textColor}`}>
            ChefConnect
          </Link>
          
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className={`${textColor} font-semibold border-b-2 border-orange-500 pb-1 hover:text-orange-400 transition-colors duration-200`}>Home</Link>
            {user?.role === 'user' && (
              <>
                <Link to="/search" className={`${textMuted} font-medium transition-colors duration-200`}>Find Cooks</Link>
                <Link to="/my-bookings" className={`${textMuted} font-medium transition-colors duration-200`}>My Bookings</Link>
              </>
            )}
            {user?.role === 'cook' && (
              <>
                <Link to="/cook/dashboard" className={`${textMuted} font-medium transition-colors duration-200`}>Dashboard</Link>
                <Link to="/cook/bookings" className={`${textMuted} font-medium transition-colors duration-200`}>Requests</Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'user' && (
            <div className={`hidden lg:flex items-center ${transparent ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-200'} backdrop-blur-sm px-4 py-2 rounded-full border`}>
              <span className={`material-symbols-outlined mr-2 ${transparent ? 'text-white/70' : 'text-gray-500'}`} data-icon="search">search</span>
              <input 
                className={`bg-transparent border-none focus:ring-0 text-sm w-48 ${transparent ? 'text-white placeholder-white/70' : 'text-gray-900 placeholder-gray-500'}`} 
                placeholder="Cuisine or Chef name..." 
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/search?q=' + e.target.value);
                  }
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className={`hidden sm:inline-block text-sm font-medium ${textColor}`}>Hi, {user.name}</span>
                <span className={`material-symbols-outlined cursor-pointer p-1 transition-colors ${transparent ? 'text-white hover:text-orange-400' : 'text-gray-600 hover:text-primary'}`} data-icon="notifications">notifications</span>
                <button 
                  onClick={logout}
                  className={btnClass}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className={btnClass}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}