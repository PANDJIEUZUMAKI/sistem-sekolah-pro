// src/components/Dashboard/SuperuserDashboard.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Database, 
  School, 
  Shield, 
  BarChart3,
  HardDrive,
  UserCheck,
  Monitor,
  Bell,
  Eye,
  Plus,
  Edit,
  UserX,
  UserPlus,
  Search,
  Filter
} from 'lucide-react';

const SuperuserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Sari Dewi', role: 'Kepala Sekolah', email: 'sari@sekolah.com', status: 'Aktif', lastLogin: '2025-05-31 08:30' },
    { id: 2, name: 'Ahmad Rizki', role: 'Guru', email: 'ahmad@sekolah.com', status: 'Aktif', lastLogin: '2025-05-31 07:45' },
    { id: 3, name: 'Maya Sinta', role: 'Karyawan', email: 'maya@sekolah.com', status: 'Aktif', lastLogin: '2025-05-30 16:20' },
    { id: 4, name: 'Budi Santoso', role: 'Siswa', email: 'budi@sekolah.com', status: 'Tidak Aktif', lastLogin: '2025-05-29 14:15' },
    { id: 5, name: 'Rina Wati', role: 'Guru', email: 'rina@sekolah.com', status: 'Aktif', lastLogin: '2025-05-31 09:15' },
    { id: 6, name: 'Dedi Kurnia', role: 'Karyawan', email: 'dedi@sekolah.com', status: 'Tidak Aktif', lastLogin: '2025-05-30 15:30' }
  ]);

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
        console.log(`${newStatus === 'Aktif' ? 'Mengaktifkan' : 'Menonaktifkan'} user: ${user.name}`);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <School className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Sistem Sekolah Pro</h1>
                <p className="text-sm text-red-100">Super Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-red-100 hover:text-white cursor-pointer" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'SA'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{currentUser.name || 'Super Admin'}</p>
                  <p className="text-xs text-red-100">Superuser</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'system', label: 'System Settings', icon: Settings },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'security', label: 'Security', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">System Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-gray-900">1,247</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserCheck className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                          <dd className="text-lg font-medium text-gray-900">892</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Monitor className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Today's Logins</dt>
                          <dd className="text-lg font-medium text-gray-900">324</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <HardDrive className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                          <dd className="text-lg font-medium text-green-600">Excellent</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Ahmad Rizki menginput nilai Matematika kelas 5A</p>
                        <p className="text-xs text-gray-600">5 menit lalu</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">GURU</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Maya Sinta memproses pembayaran SPP Andi Pratama</p>
                        <p className="text-xs text-gray-600">15 menit lalu</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">KARYAWAN</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Dr. Sari Dewi menyetujui laporan keuangan bulan Mei</p>
                        <p className="text-xs text-gray-600">1 jam lalu</p>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">KEPALA SEKOLAH</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Rina Wati mengupload materi pelajaran IPA kelas 4B</p>
                        <p className="text-xs text-gray-600">2 jam lalu</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">GURU</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">15 siswa kelas 6A mengerjakan latihan soal online</p>
                        <p className="text-xs text-gray-600">3 jam lalu</p>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">SISWA</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Maya Sinta menonaktifkan akun siswa yang lulus</p>
                        <p className="text-xs text-gray-600">4 jam lalu</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">KARYAWAN</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Super Admin mengaktifkan kembali akun guru yang cuti</p>
                        <p className="text-xs text-gray-600">5 jam lalu</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">SUPERUSER</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                  <p className="mt-1 text-sm text-gray-700">Kelola semua pengguna sistem</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-900">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>

              {/* Users Table */}
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Aktif' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastLogin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-red-600 hover:text-red-900"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Pengguna"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => toggleUserStatus(user.id)}
                              className={`${
                                user.status === 'Aktif' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={user.status === 'Aktif' ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                            >
                              {user.status === 'Aktif' ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs content placeholders */}
          {activeTab === 'system' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
              <p className="text-gray-600">System configuration panel coming soon...</p>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Database Management</h2>
              <p className="text-gray-600">Database administration tools coming soon...</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Center</h2>
              <p className="text-gray-600">Security monitoring and configuration coming soon...</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SuperuserDashboard;