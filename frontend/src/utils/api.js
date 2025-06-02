// src/utils/api.js - API Service untuk Dashboard Superuser

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic fetch wrapper with error handling
  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use default error message
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle different types of errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.fetchWithErrorHandling('/health');
  }

  // Dashboard endpoints
  async getTotalGuruAktif() {
    return this.fetchWithErrorHandling('/dashboard/guru-aktif');
  }

  async getStatistikGuru() {
    return this.fetchWithErrorHandling('/dashboard/statistik-guru');
  }

  async getDaftarGuruAktif(page = 1, limit = 10) {
    return this.fetchWithErrorHandling(`/dashboard/daftar-guru-aktif?page=${page}&limit=${limit}`);
  }

  async getGuruPerBulan(tahun = new Date().getFullYear()) {
    return this.fetchWithErrorHandling(`/dashboard/guru-per-bulan?tahun=${tahun}`);
  }

  async cariGuru(query, status = 'aktif') {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithErrorHandling(`/dashboard/cari-guru?q=${encodedQuery}&status=${status}`);
  }

  // Future endpoints for other entities (implement when backend is ready)
  async getTotalMurid() {
    // Placeholder for future implementation
    return {
      success: true,
      data: { total_murid: 1247 },
      message: 'Mock data'
    };
  }

  async getTotalKaryawan() {
    // Placeholder for future implementation
    return {
      success: true,
      data: { total_karyawan: 23 },
      message: 'Mock data'
    };
  }

  // User management endpoints (for future implementation)
  async createUser(userData) {
    return this.fetchWithErrorHandling('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.fetchWithErrorHandling(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.fetchWithErrorHandling(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateUserStatus(userId, status) {
    return this.fetchWithErrorHandling(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Utility methods
  async testConnection() {
    try {
      const response = await this.healthCheck();
      return {
        connected: true,
        message: response.message || 'Connected successfully',
        data: response
      };
    } catch (error) {
      return {
        connected: false,
        message: error.message,
        error: error
      };
    }
  }

  // Batch operations (for performance optimization)
  async getBatchDashboardData() {
    try {
      const [totalGuru, statistikGuru, guruList] = await Promise.all([
        this.getTotalGuruAktif(),
        this.getStatistikGuru(),
        this.getDaftarGuruAktif(1, 5) // Get first 5 for preview
      ]);

      return {
        success: true,
        data: {
          totalGuru,
          statistikGuru,
          guruList
        }
      };
    } catch (error) {
      throw new Error(`Gagal memuat data dashboard: ${error.message}`);
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const {
  healthCheck,
  getTotalGuruAktif,
  getStatistikGuru,
  getDaftarGuruAktif,
  getGuruPerBulan,
  cariGuru,
  getTotalMurid,
  getTotalKaryawan,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  testConnection,
  getBatchDashboardData
} = apiService;

// Export default
export default apiService;