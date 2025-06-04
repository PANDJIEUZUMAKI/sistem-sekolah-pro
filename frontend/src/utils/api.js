// src/utils/api.js - API Service untuk Dashboard Superuser (Updated)

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

  // Alias untuk kompatibilitas dengan dashboard yang sudah ada
  async checkHealth() {
    return this.healthCheck();
  }

  // ================================
  // GURU ENDPOINTS
  // ================================
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

  // ================================
  // MURID ENDPOINTS (NEW - sesuai server.js)
  // ================================
  async getTotalMuridAktif() {
    return this.fetchWithErrorHandling('/dashboard/murid-aktif');
  }

  async getStatistikMurid() {
    return this.fetchWithErrorHandling('/dashboard/statistik-murid');
  }

  async getDaftarMuridAktif(page = 1, limit = 10, kelas = '') {
    let url = `/dashboard/daftar-murid-aktif?page=${page}&limit=${limit}`;
    if (kelas) {
      url += `&kelas=${encodeURIComponent(kelas)}`;
    }
    return this.fetchWithErrorHandling(url);
  }

  async getMuridPerTahun() {
    return this.fetchWithErrorHandling('/dashboard/murid-per-tahun');
  }

  async getMuridPerStatus(status = 'Aktif', page = 1, limit = 10) {
    return this.fetchWithErrorHandling(`/dashboard/murid-per-status?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`);
  }

  async cariMurid(query, status = 'Aktif') {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithErrorHandling(`/dashboard/cari-murid?q=${encodedQuery}&status=${encodeURIComponent(status)}`);
  }

  async getDetailMurid(nis) {
    return this.fetchWithErrorHandling(`/dashboard/detail-murid/${encodeURIComponent(nis)}`);
  }

  // ================================
  // UTILITY ENDPOINTS
  // ================================
  async getRingkasan() {
    return this.fetchWithErrorHandling('/dashboard/ringkasan');
  }

  // Legacy method untuk backward compatibility
  async getTotalMurid() {
    try {
      const response = await this.getTotalMuridAktif();
      return {
        success: response.success,
        data: { total_murid: response.data?.total_murid_aktif || 0 },
        message: response.message || 'Data murid berhasil diambil'
      };
    } catch (error) {
      // Fallback ke mock data jika API belum siap
      return {
        success: true,
        data: { total_murid: 1247 },
        message: 'Mock data - API murid belum tersedia'
      };
    }
  }

  async getTotalKaryawan() {
    // Placeholder for future implementation
    return {
      success: true,
      data: { total_karyawan: 23 },
      message: 'Mock data - API karyawan belum tersedia'
    };
  }

  // ================================
  // USER MANAGEMENT ENDPOINTS (for future implementation)
  // ================================
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

  // ================================
  // UTILITY METHODS
  // ================================
  async testConnection() {
    try {
      const response = await this.healthCheck();
      return {
        connected: true,
        message: response.message || 'Connected successfully',
        database_status: response.database_status || 'unknown',
        data: response
      };
    } catch (error) {
      return {
        connected: false,
        message: error.message,
        database_status: 'disconnected',
        error: error
      };
    }
  }

  // ================================
  // BATCH OPERATIONS (untuk optimasi performance)
  // ================================
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

  // Batch data lengkap untuk dashboard utama
  async getBatchDashboardDataLengkap() {
    try {
      const results = await Promise.allSettled([
        this.getTotalGuruAktif(),
        this.getStatistikGuru(),
        this.getTotalMuridAktif(),
        this.getStatistikMurid(),
        this.healthCheck()
      ]);

      // Extract data from settled promises
      const [
        totalGuruResult,
        statistikGuruResult,
        totalMuridResult,
        statistikMuridResult,
        healthResult
      ] = results;

      return {
        success: true,
        data: {
          guru: {
            total: totalGuruResult.status === 'fulfilled' ? totalGuruResult.value : null,
            statistik: statistikGuruResult.status === 'fulfilled' ? statistikGuruResult.value : null
          },
          murid: {
            total: totalMuridResult.status === 'fulfilled' ? totalMuridResult.value : null,
            statistik: statistikMuridResult.status === 'fulfilled' ? statistikMuridResult.value : null
          },
          health: healthResult.status === 'fulfilled' ? healthResult.value : null
        },
        errors: results
          .filter(result => result.status === 'rejected')
          .map(result => result.reason?.message)
      };
    } catch (error) {
      throw new Error(`Gagal memuat data dashboard lengkap: ${error.message}`);
    }
  }

  // Helper method untuk development/debugging
  async getAvailableEndpoints() {
    try {
      // Try to hit a non-existent endpoint to get the 404 response with available endpoints
      await this.fetchWithErrorHandling('/non-existent-endpoint');
    } catch (error) {
      // This should return the 404 response with available endpoints list
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience (UPDATED)
export const {
  healthCheck,
  checkHealth,
  getTotalGuruAktif,
  getStatistikGuru,
  getDaftarGuruAktif,
  getGuruPerBulan,
  cariGuru,
  getTotalMuridAktif,    // NEW
  getStatistikMurid,     // NEW
  getDaftarMuridAktif,   // NEW
  getMuridPerTahun,      // NEW
  getMuridPerStatus,     // NEW
  cariMurid,             // NEW
  getDetailMurid,        // NEW
  getRingkasan,          // NEW
  getTotalMurid,         // Legacy
  getTotalKaryawan,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  testConnection,
  getBatchDashboardData,
  getBatchDashboardDataLengkap  // NEW
} = apiService;

// Export default
export default apiService;