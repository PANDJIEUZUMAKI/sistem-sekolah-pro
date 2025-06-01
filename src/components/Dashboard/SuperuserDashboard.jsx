import React, { useState } from 'react';
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
  Database
} from 'lucide-react';
import { logout } from '../../utils/auth';

const SuperuserDashboard = ({ currentUser = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: 'Ahmad Rizki', email: 'ahmad.rizki@sekolah.com', role: 'GURU', status: 'Aktif', lastLogin: '2 jam lalu' },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@sekolah.com', role: 'GURU', status: 'Aktif', lastLogin: '1 hari lalu' },
    { id: 3, name: 'Budi Santoso', email: 'budi.santoso@sekolah.com', role: 'KARYAWAN', status: 'Aktif', lastLogin: '3 jam lalu' },
    { id: 4, name: 'Dewi Sartika', email: 'dewi.sartika@sekolah.com', role: 'GURU', status: 'Nonaktif', lastLogin: '1 minggu lalu' },
    { id: 5, name: 'Andi Wijaya', email: 'andi.wijaya@sekolah.com', role: 'ADMIN UTAMA', status: 'Aktif', lastLogin: 'Sekarang' },
  ]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleUserStatus = (userId) => {
    setMockUsers(prevUsers => 
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

  // Default user info jika currentUser undefined
  const userName = currentUser?.name || 'Admin Utama';
  const userEmail = currentUser?.email || 'admin@sekolah.com';

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ringkasan Sekolah Abu Bakar Ash Shiddiq</h2>
      </div>
      
      {/* HANYA 3 CARDS - STATUS SYSTEM DIHAPUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-600 mb-2">Total Guru</p>
              <p className="text-4xl font-bold text-gray-900">47</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-green-100 rounded-full mb-4">
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-600 mb-2">Total Murid</p>
              <p className="text-4xl font-bold text-gray-900">1,247</p>
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
              <p className="text-4xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>
      </div>

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
                  <span className="font-semibold">Muhammad Alfarizi</span> mendaftar sebagai murid baru TK B
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
    </div>
  );

  const renderUserManagement = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center mb-10">
        <div className="sm:flex-auto">
          <h2 className="text-4xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="mt-3 text-lg text-gray-700">
            Daftar semua pengguna yang terdaftar dalam sistem sekolah
          </p>
        </div>
        <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari pengguna..."
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

      {/* TABLE DENGAN CENTER ALIGNMENT */}
      <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
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
            {mockUsers.map((user) => (
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER LEBIH BESAR */}
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

      {/* NAVIGATION DIPERKECIL */}
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

      {/* Content */}
      <main>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
      </main>
    </div>
  );
};

export default SuperuserDashboard;