import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../store/authStore';

// Pages
import Home from '../Pages/Home';
import Login from '../Pages/auth/login';
import Signup from '../Pages/auth/signup';
import SearchCook from '../Pages/User/Searchcook';
import CookDetails from '../Pages/User/cookdetails';
import UserDashboard from '../Pages/User/userdashboard';
import MyBookings from '../Pages/User/Mybookings';
import Favorites from '../Pages/User/favorites';
import Notifications from '../Pages/User/notifications';
import AIMenu from '../Pages/User/aimenu';
import CookDashboard from '../Pages/Cook/cookDashboard';
import CookProfile from '../Pages/Cook/cookProfile';
import EditProfile from '../Pages/Cook/Editprofile';
import CookBookings from '../Pages/Cook/cookBookings';
import FoodGallery from '../Pages/Cook/foodGallery';
import CookReviews from '../Pages/Cook/cookReviews';

// 404 Page
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6f8] text-center px-4">
    <span className="material-symbols-outlined text-6xl text-primary mb-4">sentiment_dissatisfied</span>
    <h1 className="text-4xl font-bold text-on-background mb-2">404</h1>
    <p className="text-on-surface-variant mb-6 text-sm">Oops! This page doesn't exist.</p>
    <a href="/home" className="bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-emerald-700 transition-colors">
      Go Home
    </a>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strictly normalize roles to only 'cook' or 'user' to prevent loops
  let userRole = user.role?.toLowerCase() === 'cook' ? 'cook' : 'user';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If they still don't match, send them to their valid home
    const target = userRole === 'cook' ? '/cook/dashboard' : '/dashboard';
    
    // Prevent navigating to the exact same path to avoid loops
    if (window.location.pathname === target) {
      return <div>Unauthorized Access</div>;
    }
    
    return <Navigate to={target} replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  // Strictly normalize
  const role = user?.role?.toLowerCase() === 'cook' ? 'cook' : 'user';
  
  // Redirect logged-in users from public-only pages
  const publicRedirect = user
    ? <Navigate to={role === 'cook' ? '/cook/dashboard' : '/dashboard'} replace />
    : null;

  return (
    <Routes>
      <Route path="/" element={
        user 
          ? <Navigate to={role === 'cook' ? '/cook/dashboard' : '/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={publicRedirect || <Login />} />
      <Route path="/signup" element={publicRedirect || <Signup />} />

      {/* User Routes */}
      <Route path="/search" element={
        <ProtectedRoute allowedRoles={['user']}>
          <SearchCook />
        </ProtectedRoute>
      } />
      <Route path="/cook/:id" element={
        <ProtectedRoute allowedRoles={['user']}>
          <CookDetails />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/my-bookings" element={
        <ProtectedRoute allowedRoles={['user']}>
          <MyBookings />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Favorites />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute allowedRoles={['user', 'cook']}>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/ai-menu" element={
        <ProtectedRoute allowedRoles={['user']}>
          <AIMenu />
        </ProtectedRoute>
      } />

      {/* Cook Routes */}
      <Route path="/cook/dashboard" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <CookDashboard />
        </ProtectedRoute>
      } />
      <Route path="/cook/profile" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <CookProfile />
        </ProtectedRoute>
      } />
      <Route path="/cook/edit-profile" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <EditProfile />
        </ProtectedRoute>
      } />
      <Route path="/cook/bookings" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <CookBookings />
        </ProtectedRoute>
      } />
      <Route path="/cook/food-gallery" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <FoodGallery />
        </ProtectedRoute>
      } />
      <Route path="/cook/reviews" element={
        <ProtectedRoute allowedRoles={['cook']}>
          <CookReviews />
        </ProtectedRoute>
      } />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
