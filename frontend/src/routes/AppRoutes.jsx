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
import CookDashboard from '../Pages/Cook/cookDashboard';
import CookProfile from '../Pages/Cook/cookProfile';
import EditProfile from '../Pages/Cook/Editprofile';
import CookBookings from '../Pages/Cook/cookBookings';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  // Redirect logged-in users from public-only pages
  const publicRedirect = user
    ? <Navigate to={user.role === 'cook' ? '/cook/dashboard' : '/dashboard'} replace />
    : null;

  return (
    <Routes>
      <Route path="/" element={publicRedirect || <Home />} />
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
    </Routes>
  );
}
