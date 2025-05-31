// src/utils/auth.js

// Get current user data
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get user's dashboard route based on role
export const getUserDashboardRoute = (role) => {
  const routes = {
    'superuser': '/superuser',
    'kepala_sekolah': '/kepala-sekolah',
    'guru': '/guru',
    'karyawan': '/karyawan',
    'siswa': '/siswa'
  };
  return routes[role] || '/login';
};

// Role permissions matrix
export const PERMISSIONS = {
  superuser: {
    canManageUsers: true,
    canActivateDeactivateUsers: true,
    canManageSystem: true,
    canViewAllData: true,
    canManageSchools: true,
    canViewReports: true
  },
  kepala_sekolah: {
    canManageUsers: false,
    canActivateDeactivateUsers: false,
    canManageSystem: false,
    canViewAllData: true,
    canManageSchools: false,
    canViewReports: true,
    canApproveTransactions: true,
    canViewFinancialReports: true,
    canDeactivateStudents: true
  },
  guru: {
    canManageUsers: false,
    canActivateDeactivateUsers: false,
    canManageSystem: false,
    canViewAllData: false,
    canManageSchools: false,
    canViewReports: false,
    canManageGrades: true,
    canManageAttendance: true,
    canUploadMaterials: true,
    canViewStudentProfiles: true
  },
  karyawan: {
    canManageUsers: false,
    canActivateDeactivateUsers: false,
    canManageSystem: false,
    canViewAllData: false,
    canManageSchools: false,
    canViewReports: false,
    canProcessPayments: true,
    canManageStudentData: true,
    canManageInventory: true,
    canDeactivateStudents: true
  },
  siswa: {
    canManageUsers: false,
    canActivateDeactivateUsers: false,
    canManageSystem: false,
    canViewAllData: false,
    canManageSchools: false,
    canViewReports: false,
    canViewGrades: true,
    canViewSchedule: true,
    canSubmitAssignments: true,
    canUpdateProfile: true
  }
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userPermissions = PERMISSIONS[user.role];
  return userPermissions && userPermissions[permission] === true;
};

// Get user display name
export const getUserDisplayName = () => {
  const user = getCurrentUser();
  return user ? user.name : 'Guest';
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'superuser': 'Super Admin',
    'kepala_sekolah': 'Kepala Sekolah',
    'guru': 'Guru',
    'karyawan': 'Karyawan',
    'siswa': 'Siswa'
  };
  return roleNames[role] || role;
};