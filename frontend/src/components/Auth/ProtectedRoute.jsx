// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserData();

  // Check if user is logged in
  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or their proper dashboard
    const roleRoutes = {
      'superuser': '/superuser',
      'kepala_sekolah': '/kepala-sekolah',
      'guru': '/guru',
      'karyawan': '/karyawan',
      'siswa': '/siswa'
    };
    
    const userDashboard = roleRoutes[user.role] || '/login';
    return <Navigate to={userDashboard} replace />;
  }

  // User is authenticated and has proper role
  return children;
};

export default ProtectedRoute;