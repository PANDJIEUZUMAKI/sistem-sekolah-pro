// utils/auth.js - Authentication utilities (UPDATED)

const TOKEN_KEY = process.env.REACT_APP_JWT_STORAGE_KEY || 'dashboard_token';
const USER_KEY = 'dashboard_user';

// Mock authentication for now - replace with real API calls later
export const login = async (email, password) => {
  try {
    // Mock authentication logic
    if (email === 'admin@sekolah.com' && password === 'Admin123') {
      const mockUser = {
        id: 1,
        name: 'Admin Utama',
        email: 'admin@sekolah.com',
        role: 'ADMIN_UTAMA',
        permissions: ['dashboard', 'user_management', 'system_settings']
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      return {
        success: true,
        user: mockUser,
        token: mockToken,
        message: 'Login berhasil'
      };
    } else {
      throw new Error('Email atau password salah');
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat login'
    };
  }
};

export const logout = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  
  return !!(token && user);
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && user.permissions && user.permissions.includes(permission);
};

export const isTokenExpired = () => {
  // TODO: Implement JWT token expiration check
  // For now, always return false (never expired)
  return false;
};

export const refreshToken = async () => {
  try {
    return getToken(); // Return current token for now
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Utility function to check if user needs to login
export const requireAuth = () => {
  if (!isAuthenticated() || isTokenExpired()) {
    logout();
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Utility function for API requests with auth
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// NEW: Function that was missing - determines dashboard route based on user role
export const getUserDashboardRoute = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return '/login';
  }
  
  // Route based on user role
  switch (user.role) {
    case 'ADMIN_UTAMA':
    case 'SUPERUSER':
      return '/dashboard/superuser';
    case 'GURU':
      return '/dashboard/guru';
    case 'KARYAWAN':
      return '/dashboard/karyawan';
    case 'MURID':
      return '/dashboard/murid';
    default:
      return '/dashboard';
  }
};

// NEW: Additional utility functions that might be needed
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const canAccessDashboard = (requiredRole = null) => {
  if (!isAuthenticated()) return false;
  
  if (!requiredRole) return true;
  
  const userRole = getUserRole();
  return userRole === requiredRole || userRole === 'ADMIN_UTAMA';
};