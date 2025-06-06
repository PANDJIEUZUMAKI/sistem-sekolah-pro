import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  BarChart3,
  UserCheck,
  Monitor,
  UserPlus,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  UserX,
  Settings,
  Database,
  AlertCircle,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { logout } from '../../utils/auth';
import { apiService } from '../../utils/api';

const SuperuserDashboard = ({ currentUser = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for API data - GURU
  const [dashboardData, setDashboardData] = useState({
    totalGuruAktif: 0,
    statistikGuru: {},
    totalSemua: 0
  });

  // State for API data - MURID 
  const [muridData, setMuridData] = useState({
    totalMuridAktif: 0,
    statistikMurid: {},
    totalSemuaMurid: 0,
    statistikPerKelas: {},
    statistikPerJenisKelamin: {}
  });
  
  const [guruList, setGuruList] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_data: 0,
    per_page: 10
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('connected');
  const [searchQuery, setSearchQuery] = useState('');

  // Karyawan data - akan diambil dari database nanti
  const [karyawanData, setKaryawanData] = useState({
    totalKaryawan: 23
  });

  // Utility function untuk format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Data tidak tersedia';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu lalu`;
    return `${Math.ceil(diffDays / 30)} bulan lalu`;
  }, []);

  // Check database status
  const checkDatabaseStatus = useCallback(async () => {
    try {
      const response = await apiService.checkHealth();
      if (response.success && response.database_status === 'connected') {
        setDatabaseStatus('connected');
        return true;
      } else {
        setDatabaseStatus('disconnected');
        setError('Database tidak terhubung. Periksa konfigurasi database Anda.');
        return false;
      }
    } catch (err) {
      setDatabaseStatus('disconnected');
      setError('Tidak dapat terhubung ke server atau database.');
      return false;
    }
  }, []);

  // Load guru list
  const loadGuruList = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await apiService.getDaftarGuruAktif(page, limit);
      
      if (response.success) {
        const transformedGuru = response.data.guru.map(guru => ({
          id: guru.id,
          name: guru.nama,
          email: guru.email,
          role: 'GURU',
          status: guru.status === 'aktif' ? 'Aktif' : 'Nonaktif',
          lastLogin: formatDate(guru.tanggal_dibuat),
          phone: guru.telepon,
          education: guru.pendidikan_terakhir,
          gender: guru.jenis_kelamin
        }));
        
        setGuruList(transformedGuru);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Gagal memuat data guru');
      }
    } catch (err) {
      console.error('Error loading guru list:', err);
      setError(`Gagal memuat daftar guru: ${err.message}`);
    }
  }, [formatDate]);

  // Load murid data langsung dari database
  const loadMuridData = useCallback(async () => {
    try {
      const [totalMuridResponse, statistikMuridResponse] = await Promise.all([
        apiService.getTotalMuridAktif(),
        apiService.getStatistikMurid()
      ]);

      if (totalMuridResponse.success && statistikMuridResponse.success) {
        setMuridData({
          totalMuridAktif: totalMuridResponse.data.total_murid_aktif,
          statistikMurid: statistikMuridResponse.data.statistik_per_status || {},
          totalSemuaMurid: statistikMuridResponse.data.total_semua_murid || 0,
          statistikPerKelas: statistikMuridResponse.data.statistik_per_kelas || {},
          statistikPerJenisKelamin: statistikMuridResponse.data.statistik_per_jenis_kelamin || {}
        });
        
        console.log('✅ Data murid berhasil dimuat dari database');
      } else {
        throw new Error('Gagal memuat data murid: ' + (totalMuridResponse.message || statistikMuridResponse.message));
      }
    } catch (err) {
      console.error('Error loading murid data:', err);
      setError(`Gagal memuat data murid: ${err.message}`);
      setMuridData({
        totalMuridAktif: 0,
        statistikMurid: {},
        totalSemuaMurid: 0,
        statistikPerKelas: {},
        statistikPerJenisKelamin: {}
      });
    }
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      const dbConnected = await checkDatabaseStatus();
      if (!dbConnected) {
        return;
      }

      const [totalGuruResponse, statistikGuruResponse] = await Promise.all([
        apiService.getTotalGuruAktif(),
        apiService.getStatistikGuru()
      ]);

      if (totalGuruResponse.success && statistikGuruResponse.success) {
        setDashboardData({
          totalGuruAktif: totalGuruResponse.data.total_guru_aktif,
          statistikGuru: statistikGuruResponse.data.statistik_per_status,
          totalSemua: statistikGuruResponse.data.total_semua_guru
        });
      } else {
        throw new Error('Gagal memuat data guru: ' + (totalGuruResponse.message || statistikGuruResponse.message));
      }

      await loadMuridData();

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [checkDatabaseStatus, loadMuridData]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadGuruList();
  }, [loadDashboardData, loadGuruList]);

  // Search guru function
  const searchGuru = async (query) => {
    if (query.length < 2) {
      loadGuruList();
      return;
    }

    try {
      const response = await apiService.cariGuru(query);
      
      if (response.success) {
        const transformedGuru = response.data.guru.map(guru => ({
          id: guru.id,
          name: guru.nama,
          email: guru.email,
          role: 'GURU',
          status: guru.status === 'aktif' ? 'Aktif' : 'Nonaktif',
          lastLogin: 'Data tidak tersedia',
          phone: guru.telepon,
          education: guru.pendidikan_terakhir,
          gender: guru.jenis_kelamin
        }));
        
        setGuruList(transformedGuru);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_data: transformedGuru.length,
          per_page: transformedGuru.length
        });
      } else {
        throw new Error(response.message || 'Gagal mencari guru');
      }
    } catch (err) {
      console.error('Error searching guru:', err);
      setError(`Gagal mencari guru: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData();
    loadGuruList();
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const timeoutId = setTimeout(() => {
      searchGuru(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage) => {
    loadGuruList(newPage, pagination.per_page);
  };

  const toggleUserStatus = async (userId) => {
    setGuruList(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : user
      )
    );
  };

  const tabs = [
    { id: 'overview', name: 'Ringkasan', icon: BarChart3 },
    { id: 'users', name: 'Manajemen Pengguna', icon: Users },
  ];

  const userName = currentUser?.name || 'Admin Utama';

  // Database Status Component
  const DatabaseStatusBanner = () => {
    if (databaseStatus === 'connected') return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">
            Database tidak terhubung - Tidak dapat memuat data
          </span>
          <button
            onClick={handleRefresh}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Coba Koneksi Ulang
          </button>
        </div>
      </div>
    );
  };

  // Error Component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
        <div className="flex-1">
          <span className="text-red-800 font-medium">Error:</span>
          <span className="text-red-700 ml-2">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-100 transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
      <span className="text-gray-600">Memuat data dari database...</span>
    </div>
  );

  // No Data Component
  const NoDataMessage = ({ message }) => (
    <div className="text-center py-12">
      <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Sekolah Abu Bakar Ash Shiddiq</h2>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      <DatabaseStatusBanner />
      
      {error && <ErrorMessage message={error} onRetry={handleRefresh} />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-blue-100 rounded-full mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">Total Guru Aktif</p>
                  <p className="text-4xl font-bold text-gray-900">{dashboardData.totalGuruAktif}</p>
                  {dashboardData.totalSemua > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      dari {dashboardData.totalSemua} total guru
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-green-100 rounded-full mb-4">
                  <UserCheck className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">Total Murid Aktif</p>
                  <p className="text-4xl font-bold text-gray-900">{muridData.totalMuridAktif}</p>
                  {muridData.totalSemuaMurid > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      dari {muridData.totalSemuaMurid} total murid
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-purple-100 rounded-full mb-4">
                  <Monitor className="h-12 w-12 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">Total Karyawan</p>
                  <p className="text-4xl font-bold text-gray-900">{karyawanData.totalKaryawan}</p>
                  <p className="text-sm text-gray-500 mt-1">Staff & Admin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Guru Section */}
          {Object.keys(dashboardData.statistikGuru).length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Data Guru</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(dashboardData.statistikGuru).map(([status, jumlah]) => (
                  <div key={status} className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg font-semibold text-blue-600 capitalize">{status}</p>
                    <p className="text-3xl font-bold text-blue-900">{jumlah}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Murid Section */}
          {(Object.keys(muridData.statistikMurid).length > 0 || Object.keys(muridData.statistikPerKelas).length > 0) && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Data Murid</h3>
              
              {/* Statistik per Status */}
              {Object.keys(muridData.statistikMurid).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Statistik per Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(muridData.statistikMurid).map(([status, jumlah]) => (
                      <div key={status} className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-lg font-semibold text-green-600">{status}</p>
                        <p className="text-3xl font-bold text-green-900">{jumlah}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistik per Kelas */}
              {Object.keys(muridData.statistikPerKelas).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Statistik per Kelas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(muridData.statistikPerKelas).map(([kelas, jumlah]) => (
                      <div key={kelas} className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-600">{kelas}</p>
                        <p className="text-2xl font-bold text-yellow-900">{jumlah}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistik per Jenis Kelamin */}
              {Object.keys(muridData.statistikPerJenisKelamin).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Statistik per Jenis Kelamin</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(muridData.statistikPerJenisKelamin).map(([jenisKelamin, jumlah]) => (
                      <div key={jenisKelamin} className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-lg font-semibold text-purple-600">{jenisKelamin}</p>
                        <p className="text-3xl font-bold text-purple-900">{jumlah}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900">Aktivitas Terkini - TK & SD Abu Bakar Ash Shiddiq</h3>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-100 rounded-full">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-gray-900">
                      <span className="font-semibold">Ustadzah Fatimah Az-Zahra</span> terdaftar sebagai guru kelas 1 SD baru
                    </p>
                    <p className="text-sm text-gray-500 mt-1">2 jam yang lalu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-gray-900">
                      <span className="font-semibold">Ahmad Faizi Rahman</span> mendaftar sebagai murid baru TK A
                    </p>
                    <p className="text-sm text-gray-500 mt-1">3 jam yang lalu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-gray-900">
                      Jadwal kegiatan semester genap telah diperbarui oleh <span className="font-semibold">Kepala Sekolah</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">4 jam yang lalu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Database className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-gray-900">
                      Backup data harian berhasil disimpan - Data nilai dan absensi aman
                    </p>
                    <p className="text-sm text-gray-500 mt-1">6 jam yang lalu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-100 rounded-full">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-gray-900">
                      <span className="font-semibold">Pak Umar bin Khattab</span> mengupload materi Iqro untuk kelas 3 SD
                    </p>
                    <p className="text-sm text-gray-500 mt-1">8 jam yang lalu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center mb-10">
        <div className="sm:flex-auto">
          <h2 className="text-4xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="mt-3 text-lg text-gray-700">
            Daftar semua guru yang terdaftar dalam sistem sekolah ({pagination.total_data} total)
          </p>
        </div>
        <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari guru..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
              />
            </div>
            <button className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-md hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center justify-center rounded-xl border border-transparent bg-red-800 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-red-900 transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Tambah Pengguna
            </button>
          </div>
        </div>
      </div>

      <DatabaseStatusBanner />

      {error && <ErrorMessage message={error} onRetry={() => loadGuruList()} />}

      <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : guruList.length === 0 ? (
          <NoDataMessage message="Tidak ada data guru yang tersedia." />
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Peran
                  </th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Terakhir Login
                  </th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guruList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="h-14 w-14 flex-shrink-0">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                            <span className="text-lg font-bold text-red-800">
                              {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'UN'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-center">
                          <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.education && (
                            <div className="text-xs text-gray-400">{user.education}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-center">
                      <span className="inline-flex px-4 py-2 text-base font-semibold bg-red-100 text-red-800 rounded-full">{user.role}</span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-center">
                      <span className={`inline-flex px-4 py-2 text-base font-semibold rounded-full ${
                        user.status === 'Aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-center text-lg text-gray-900 font-medium">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-3">
                        <button 
                          className="p-3 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-xl transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="h-6 w-6" />
                        </button>
                        <button 
                          className="p-3 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-xl transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit className="h-6 w-6" />
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-3 rounded-xl transition-colors ${
                            user.status === 'Aktif' 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={user.status === 'Aktif' ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                        >
                          {user.status === 'Aktif' ? <UserX className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.total_pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {((pagination.current_page - 1) * pagination.per_page) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total_data)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total_data}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current_page
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.total_pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-red-800 via-red-850 to-red-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-4xl font-bold text-white">Sistem Sekolah Pro</h1>
                <p className="text-lg text-red-100 mt-2">Dashboard Admin Utama</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-6">
                <div className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">
                    {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'AU'}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-white">{userName}</p>
                  <p className="text-sm text-red-100">Admin Utama</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-6 py-3 text-red-100 hover:text-white hover:bg-red-700 rounded-xl transition-colors text-lg font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-2xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-6 py-6 text-base font-semibold transition-all duration-200 border-b-4 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <Icon className="h-6 w-6 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
      </main>
    </div>
  );
};

export default SuperuserDashboard;