// server.js - Simple Backend untuk Dashboard Superuser
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Database PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sekolah_abu_bakar',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Test koneksi database
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.log('⚠️  Continuing without database connection...');
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Route untuk health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route untuk mendapatkan total guru aktif
app.get('/api/dashboard/guru-aktif', async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as total_guru_aktif 
      FROM guru 
      WHERE status = 'aktif'
    `;
    
    const result = await pool.query(query);
    const totalGuruAktif = parseInt(result.rows[0].total_guru_aktif);
    
    res.json({
      success: true,
      data: {
        total_guru_aktif: totalGuruAktif
      },
      message: 'Data berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching guru aktif:', error);
    
    // Return mock data if database error
    res.json({
      success: true,
      data: {
        total_guru_aktif: 25 // Mock data
      },
      message: 'Data berhasil diambil (mock data)',
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database connection issue'
    });
  }
});

// Route untuk mendapatkan statistik lengkap guru
app.get('/api/dashboard/statistik-guru', async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as jumlah
      FROM guru 
      GROUP BY status
      ORDER BY status
    `;
    
    const result = await pool.query(query);
    
    // Hitung total keseluruhan
    const totalSemua = result.rows.reduce((sum, row) => sum + parseInt(row.jumlah), 0);
    
    // Format data untuk response
    const statistik = result.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.jumlah);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        statistik_per_status: statistik,
        total_semua_guru: totalSemua,
        detail: result.rows
      },
      message: 'Statistik guru berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistik guru:', error);
    
    // Return mock data if database error
    res.json({
      success: true,
      data: {
        statistik_per_status: {
          aktif: 25,
          nonaktif: 5,
          cuti: 2
        },
        total_semua_guru: 32,
        detail: [
          { status: 'aktif', jumlah: 25 },
          { status: 'nonaktif', jumlah: 5 },
          { status: 'cuti', jumlah: 2 }
        ]
      },
      message: 'Statistik guru berhasil diambil (mock data)',
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database connection issue'
    });
  }
});

// Route untuk mendapatkan daftar guru aktif dengan detail
app.get('/api/dashboard/daftar-guru-aktif', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        id,
        nama,
        email,
        telepon,
        pendidikan_terakhir,
        jenis_kelamin,
        tanggal_dibuat,
        status
      FROM guru 
      WHERE status = 'aktif'
      ORDER BY nama ASC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM guru 
      WHERE status = 'aktif'
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);
    
    const totalData = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalData / limit);
    
    res.json({
      success: true,
      data: {
        guru: dataResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_data: totalData,
          per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        }
      },
      message: 'Daftar guru aktif berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching daftar guru aktif:', error);
    
    // Return mock data if database error
    const mockGuru = [
      {
        id: 1,
        nama: 'Ahmad Hidayat, S.Pd',
        email: 'ahmad.hidayat@sekolah.com',
        telepon: '081234567890',
        pendidikan_terakhir: 'S1 Pendidikan Matematika',
        jenis_kelamin: 'L',
        tanggal_dibuat: '2024-01-15T00:00:00.000Z',
        status: 'aktif'
      },
      {
        id: 2,
        nama: 'Siti Nurhaliza, S.Pd',
        email: 'siti.nurhaliza@sekolah.com',
        telepon: '081234567891',
        pendidikan_terakhir: 'S1 Pendidikan Bahasa Indonesia',
        jenis_kelamin: 'P',
        tanggal_dibuat: '2024-01-20T00:00:00.000Z',
        status: 'aktif'
      },
      {
        id: 3,
        nama: 'Budi Santoso, S.Pd',
        email: 'budi.santoso@sekolah.com',
        telepon: '081234567892',
        pendidikan_terakhir: 'S1 Pendidikan Fisika',
        jenis_kelamin: 'L',
        tanggal_dibuat: '2024-02-01T00:00:00.000Z',
        status: 'aktif'
      }
    ];
    
    res.json({
      success: true,
      data: {
        guru: mockGuru,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_data: mockGuru.length,
          per_page: 10,
          has_next: false,
          has_prev: false
        }
      },
      message: 'Daftar guru aktif berhasil diambil (mock data)',
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database connection issue'
    });
  }
});

// Route untuk mencari guru berdasarkan nama (bonus feature)
app.get('/api/dashboard/cari-guru', async (req, res) => {
  try {
    const { q: searchQuery, status = 'aktif' } = req.query;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query pencarian minimal 2 karakter'
      });
    }
    
    const query = `
      SELECT 
        id,
        nama,
        email,
        telepon,
        pendidikan_terakhir,
        jenis_kelamin,
        status
      FROM guru 
      WHERE (
        LOWER(nama) LIKE LOWER($1) 
        OR LOWER(email) LIKE LOWER($1)
      )
      AND status = $2
      ORDER BY nama ASC
      LIMIT 20
    `;
    
    const searchPattern = `%${searchQuery.trim()}%`;
    const result = await pool.query(query, [searchPattern, status]);
    
    res.json({
      success: true,
      data: {
        guru: result.rows,
        total_ditemukan: result.rows.length,
        query: searchQuery.trim()
      },
      message: `Ditemukan ${result.rows.length} guru`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching guru:', error);
    
    // Return mock search result
    res.json({
      success: true,
      data: {
        guru: [
          {
            id: 1,
            nama: 'Ahmad Hidayat, S.Pd',
            email: 'ahmad.hidayat@sekolah.com',
            telepon: '081234567890',
            pendidikan_terakhir: 'S1 Pendidikan Matematika',
            jenis_kelamin: 'L',
            status: 'aktif'
          }
        ],
        total_ditemukan: 1,
        query: req.query.q
      },
      message: 'Ditemukan 1 guru (mock data)',
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database connection issue'
    });
  }
});

// Route untuk mendapatkan statistik guru berdasarkan bulan
app.get('/api/dashboard/guru-per-bulan', async (req, res) => {
  try {
    const { tahun = new Date().getFullYear() } = req.query;
    
    const query = `
      SELECT 
        EXTRACT(MONTH FROM tanggal_dibuat) as bulan,
        COUNT(*) as jumlah_guru_baru
      FROM guru 
      WHERE EXTRACT(YEAR FROM tanggal_dibuat) = $1
        AND status = 'aktif'
      GROUP BY EXTRACT(MONTH FROM tanggal_dibuat)
      ORDER BY bulan
    `;
    
    const result = await pool.query(query, [tahun]);
    
    // Format data untuk chart (12 bulan)
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const dataBulan = Array.from({length: 12}, (_, i) => ({
      bulan: i + 1,
      nama_bulan: namaBulan[i],
      jumlah_guru_baru: 0
    }));
    
    // Isi data yang ada
    result.rows.forEach(row => {
      const bulanIndex = parseInt(row.bulan) - 1;
      dataBulan[bulanIndex].jumlah_guru_baru = parseInt(row.jumlah_guru_baru);
    });
    
    res.json({
      success: true,
      data: {
        tahun: parseInt(tahun),
        data_per_bulan: dataBulan
      },
      message: 'Data guru per bulan berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching guru per bulan:', error);
    
    // Return mock data
    const mockDataBulan = [
      { bulan: 1, nama_bulan: 'Januari', jumlah_guru_baru: 3 },
      { bulan: 2, nama_bulan: 'Februari', jumlah_guru_baru: 2 },
      { bulan: 3, nama_bulan: 'Maret', jumlah_guru_baru: 4 },
      { bulan: 4, nama_bulan: 'April', jumlah_guru_baru: 1 },
      { bulan: 5, nama_bulan: 'Mei', jumlah_guru_baru: 3 },
      { bulan: 6, nama_bulan: 'Juni', jumlah_guru_baru: 2 },
      { bulan: 7, nama_bulan: 'Juli', jumlah_guru_baru: 0 },
      { bulan: 8, nama_bulan: 'Agustus', jumlah_guru_baru: 0 },
      { bulan: 9, nama_bulan: 'September', jumlah_guru_baru: 0 },
      { bulan: 10, nama_bulan: 'Oktober', jumlah_guru_baru: 0 },
      { bulan: 11, nama_bulan: 'November', jumlah_guru_baru: 0 },
      { bulan: 12, nama_bulan: 'Desember', jumlah_guru_baru: 0 }
    ];
    
    res.json({
      success: true,
      data: {
        tahun: parseInt(req.query.tahun) || new Date().getFullYear(),
        data_per_bulan: mockDataBulan
      },
      message: 'Data guru per bulan berhasil diambil (mock data)',
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database connection issue'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    available_endpoints: [
      'GET /api/health',
      'GET /api/dashboard/guru-aktif',
      'GET /api/dashboard/statistik-guru',
      'GET /api/dashboard/daftar-guru-aktif',
      'GET /api/dashboard/guru-per-bulan',
      'GET /api/dashboard/cari-guru'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/guru-aktif`);
  console.log('📋 Available endpoints:');
  console.log('   GET /api/health');
  console.log('   GET /api/dashboard/guru-aktif');
  console.log('   GET /api/dashboard/statistik-guru');
  console.log('   GET /api/dashboard/daftar-guru-aktif');
  console.log('   GET /api/dashboard/guru-per-bulan');
  console.log('   GET /api/dashboard/cari-guru');
  console.log('');
  console.log('💡 Note: Backend akan menggunakan mock data jika database tidak terhubung');
});

module.exports = app;