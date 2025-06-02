// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SuperuserDashboard from './components/Dashboard/SuperuserDashboard';

import { isAuthenticated, getCurrentUser, getUserDashboardRoute } from './utils/auth';
import './App.css';

// Temporary placeholder components for other roles
const PlaceholderDashboard = ({ role }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Dashboard {role.charAt(0).toUpperCase() + role.slice(1)}
      </h1>
      <p className="text-gray-600">Dashboard ini sedang dalam pengembangan</p>
      <button 
        onClick={() => {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  </div>
);

// Root redirect component
const RootRedirect = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const dashboardRoute = getUserDashboardRoute(user.role);
  return <Navigate to={dashboardRoute} replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Login route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? 
              <Navigate to={getUserDashboardRoute(getCurrentUser().role)} replace /> : 
              <Login />
            } 
          />
          
          {/* Protected routes for each role */}
          <Route 
            path="/superuser" 
            element={
              <ProtectedRoute allowedRoles={['superuser']}>
                <SuperuserDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/kepala-sekolah" 
            element={
              <ProtectedRoute allowedRoles={['kepala_sekolah']}>
                <PlaceholderDashboard role="kepala sekolah" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/guru" 
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <PlaceholderDashboard role="guru" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/karyawan" 
            element={
              <ProtectedRoute allowedRoles={['karyawan']}>
                <PlaceholderDashboard role="karyawan" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/siswa" 
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <PlaceholderDashboard role="siswa" />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to appropriate dashboard or login */}
          <Route 
            path="*" 
            element={<RootRedirect />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;