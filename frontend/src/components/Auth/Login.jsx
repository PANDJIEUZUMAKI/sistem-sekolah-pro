// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Eye, EyeOff, User, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Demo users untuk testing
  const demoUsers = {
    'superuser@sekolah.com': { role: 'superuser', name: 'Super Admin', password: 'admin123' },
    'sari@sekolah.com': { role: 'kepala_sekolah', name: 'Dr. Sari Dewi', password: 'kepala123' },
    'ahmad@sekolah.com': { role: 'guru', name: 'Ahmad Rizki', password: 'guru123' },
    'maya@sekolah.com': { role: 'karyawan', name: 'Maya Sinta', password: 'karyawan123' },
    'budi@sekolah.com': { role: 'siswa', name: 'Budi Santoso', password: 'siswa123' }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { email, password } = formData;
      const user = demoUsers[email];

      if (!user || user.password !== password) {
        setError('Email atau password salah');
        setLoading(false);
        return;
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify({
        email: email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
      }));

      // Role-based navigation
      const roleRoutes = {
        'superuser': '/superuser',
        'kepala_sekolah': '/kepala-sekolah',
        'guru': '/guru',
        'karyawan': '/karyawan',
        'siswa': '/siswa'
      };

      const targetRoute = roleRoutes[user.role] || '/login';
      
      // Success message
      console.log(`Login berhasil sebagai ${user.role}: ${user.name}`);
      
      // Navigate to appropriate dashboard
      navigate(targetRoute, { replace: true });

    } catch (error) {
      setError('Terjadi kesalahan saat login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (role) => {
    const demoUser = Object.entries(demoUsers).find(([_, user]) => user.role === role);
    if (demoUser) {
      setFormData({
        email: demoUser[0],
        password: demoUser[1].password
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center">
              <School className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Sekolah Pro</h1>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-800 hover:bg-red-900 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              } text-white`}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Akun:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoUser('superuser')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Superuser
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('kepala_sekolah')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Kepala Sekolah
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('guru')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Guru
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('karyawan')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Karyawan
              </button>
            </div>
            <button
              type="button"
              onClick={() => fillDemoUser('siswa')}
              className="w-full mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs"
            >
              Siswa
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2025 Sistem Sekolah Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;