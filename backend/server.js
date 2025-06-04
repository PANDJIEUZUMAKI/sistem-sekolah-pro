// server.js - Backend untuk Dashboard Superuser - Database Only (Updated for Correct Enum)
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
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Test koneksi database saat startup
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('⚠️  Please check your database configuration in .env file');
    console.error('⚠️  Make sure PostgreSQL is running and database exists');
    return false;
  }
};

// Route untuk health check dengan database status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    res.json({
      success: true,
      message: 'Server is running',
      database_status: 'connected',
      database_time: result.rows[0].current_time,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server is running but database connection failed',
      database_status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// GURU ENDPOINTS (tidak berubah)
// ================================

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
      message: 'Data guru aktif berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching guru aktif:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guru aktif',
      error: error.message,
      timestamp: new Date().toISOString()
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
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik guru',
      error: error.message,
      timestamp: new Date().toISOString()
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
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar guru aktif',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mencari guru berdasarkan nama
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
    res.status(500).json({
      success: false,
      message: 'Gagal mencari guru',
      error: error.message,
      timestamp: new Date().toISOString()
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
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guru per bulan',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// MURID ENDPOINTS (Updated untuk enum yang benar)
// ================================

// Route untuk mendapatkan total murid aktif
app.get('/api/dashboard/murid-aktif', async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as total_murid_aktif 
      FROM murid 
      WHERE status = 'Aktif'
    `;
    
    const result = await pool.query(query);
    const totalMuridAktif = parseInt(result.rows[0].total_murid_aktif);
    
    res.json({
      success: true,
      data: {
        total_murid_aktif: totalMuridAktif
      },
      message: 'Data murid aktif berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching murid aktif:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data murid aktif. Pastikan tabel murid sudah ada dan terisi.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mendapatkan statistik lengkap murid
app.get('/api/dashboard/statistik-murid', async (req, res) => {
  try {
    const queries = await Promise.all([
      // Total semua murid
      pool.query('SELECT COUNT(*) as total_semua FROM murid'),
      
      // Statistik per status
      pool.query(`
        SELECT 
          status,
          COUNT(*) as jumlah
        FROM murid 
        GROUP BY status
        ORDER BY status
      `),
      
      // Statistik per kelas (hanya murid aktif)
      pool.query(`
        SELECT 
          kelas,
          COUNT(*) as jumlah
        FROM murid 
        WHERE status = 'Aktif'
        GROUP BY kelas
        ORDER BY kelas
      `),
      
      // Statistik per jenis kelamin (hanya murid aktif)
      pool.query(`
        SELECT 
          jenis_kelamin,
          COUNT(*) as jumlah
        FROM murid 
        WHERE status = 'Aktif'
        GROUP BY jenis_kelamin
      `)
    ]);

    const totalSemua = parseInt(queries[0].rows[0].total_semua);
    
    // Format statistik per status
    const statistikPerStatus = {};
    queries[1].rows.forEach(row => {
      statistikPerStatus[row.status] = parseInt(row.jumlah);
    });
    
    // Format statistik per kelas
    const statistikPerKelas = {};
    queries[2].rows.forEach(row => {
      statistikPerKelas[row.kelas] = parseInt(row.jumlah);
    });
    
    // Format statistik per jenis kelamin
    const statistikPerJenisKelamin = {};
    queries[3].rows.forEach(row => {
      statistikPerJenisKelamin[row.jenis_kelamin] = parseInt(row.jumlah);
    });

    res.json({
      success: true,
      data: {
        total_semua_murid: totalSemua,
        statistik_per_status: statistikPerStatus,
        statistik_per_kelas: statistikPerKelas,
        statistik_per_jenis_kelamin: statistikPerJenisKelamin
      },
      message: 'Statistik murid berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistik murid:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik murid. Pastikan tabel murid sudah ada dan terisi.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mendapatkan daftar murid aktif dengan detail
app.get('/api/dashboard/daftar-murid-aktif', async (req, res) => {
  try {
    const { page = 1, limit = 10, kelas = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE status = 'Aktif'";
    let queryParams = [limit, offset];
    let countParams = [];
    
    if (kelas) {
      whereClause += " AND kelas = $3";
      queryParams.push(kelas);
      countParams = [kelas];
    }
    
    const query = `
      SELECT 
        nis,
        nama,
        kelas,
        jenis_kelamin,
        tanggal_lahir,
        tempat_lahir,
        alamat,
        nama_orang_tua,
        pekerjaan_orang_tua,
        nomor_telepon,
        email,
        status,
        tahun_masuk,
        dibuat_pada
      FROM murid 
      ${whereClause}
      ORDER BY nama ASC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM murid 
      ${whereClause.replace('$3', '$1')}
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);
    
    const totalData = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalData / limit);
    
    res.json({
      success: true,
      data: {
        murid: dataResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_data: totalData,
          per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        },
        filter: {
          kelas: kelas || 'semua'
        }
      },
      message: 'Daftar murid aktif berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching daftar murid aktif:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar murid aktif',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mencari murid berdasarkan nama atau NIS
app.get('/api/dashboard/cari-murid', async (req, res) => {
  try {
    const { q: searchQuery, status = 'Aktif' } = req.query;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query pencarian minimal 2 karakter'
      });
    }
    
    const query = `
      SELECT 
        nis,
        nama,
        kelas,
        jenis_kelamin,
        tanggal_lahir,
        nama_orang_tua,
        nomor_telepon,
        email,
        status
      FROM murid 
      WHERE (
        LOWER(nama) LIKE LOWER($1) 
        OR LOWER(nis) LIKE LOWER($1)
        OR LOWER(nama_orang_tua) LIKE LOWER($1)
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
        murid: result.rows,
        total_ditemukan: result.rows.length,
        query: searchQuery.trim()
      },
      message: `Ditemukan ${result.rows.length} murid`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching murid:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mencari murid',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mendapatkan detail murid berdasarkan NIS
app.get('/api/dashboard/detail-murid/:nis', async (req, res) => {
  try {
    const { nis } = req.params;
    
    const query = `
      SELECT 
        nis,
        nama,
        kelas,
        jenis_kelamin,
        tanggal_lahir,
        tempat_lahir,
        alamat,
        nama_orang_tua,
        pekerjaan_orang_tua,
        nomor_telepon,
        email,
        agama,
        status,
        tahun_masuk,
        dibuat_pada,
        diperbarui_pada
      FROM murid 
      WHERE nis = $1
    `;
    
    const result = await pool.query(query, [nis]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Murid tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: {
        murid: result.rows[0]
      },
      message: 'Detail murid berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching detail murid:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail murid',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route untuk mendapatkan statistik murid per tahun masuk
app.get('/api/dashboard/murid-per-tahun', async (req, res) => {
  try {
    const query = `
      SELECT 
        tahun_masuk,
        COUNT(*) as jumlah_murid,
        COUNT(CASE WHEN status = 'Aktif' THEN 1 END) as murid_aktif,
        COUNT(CASE WHEN status = 'Alumni' THEN 1 END) as murid_alumni,
        COUNT(CASE WHEN status = 'Pindah' THEN 1 END) as murid_pindah,
        COUNT(CASE WHEN status = 'Tidak Aktif' THEN 1 END) as murid_tidak_aktif,
        COUNT(CASE WHEN status = 'Drop Out' THEN 1 END) as murid_drop_out,
        COUNT(CASE WHEN jenis_kelamin = 'Laki-laki' THEN 1 END) as laki_laki,
        COUNT(CASE WHEN jenis_kelamin = 'Perempuan' THEN 1 END) as perempuan
      FROM murid 
      GROUP BY tahun_masuk
      ORDER BY tahun_masuk DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: {
        statistik_per_tahun: result.rows
      },
      message: 'Statistik murid per tahun berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching murid per tahun:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik murid per tahun',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// NEW: Route untuk mendapatkan daftar murid berdasarkan status
app.get('/api/dashboard/murid-per-status', async (req, res) => {
  try {
    const { status = 'Aktif', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        nis,
        nama,
        kelas,
        jenis_kelamin,
        tanggal_lahir,
        nama_orang_tua,
        nomor_telepon,
        status,
        tahun_masuk
      FROM murid 
      WHERE status = $1
      ORDER BY nama ASC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM murid 
      WHERE status = $1
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [status, limit, offset]),
      pool.query(countQuery, [status])
    ]);
    
    const totalData = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalData / limit);
    
    res.json({
      success: true,
      data: {
        murid: dataResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_data: totalData,
          per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        },
        filter: {
          status: status
        }
      },
      message: `Daftar murid dengan status ${status} berhasil diambil`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching murid per status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar murid per status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// UTILITY ENDPOINTS
// ================================

// Route untuk mendapatkan ringkasan lengkap (dashboard overview)
app.get('/api/dashboard/ringkasan', async (req, res) => {
  try {
    const [guruResult, muridResult] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_guru,
          COUNT(CASE WHEN status = 'aktif' THEN 1 END) as guru_aktif,
          COUNT(CASE WHEN status = 'nonaktif' THEN 1 END) as guru_nonaktif
        FROM guru
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_murid,
          COUNT(CASE WHEN status = 'Aktif' THEN 1 END) as murid_aktif,
          COUNT(CASE WHEN status = 'Alumni' THEN 1 END) as murid_alumni,
          COUNT(CASE WHEN status = 'Pindah' THEN 1 END) as murid_pindah,
          COUNT(CASE WHEN status = 'Tidak Aktif' THEN 1 END) as murid_tidak_aktif,
          COUNT(CASE WHEN status = 'Drop Out' THEN 1 END) as murid_drop_out
        FROM murid
      `)
    ]);

    const guruData = guruResult.rows[0];
    const muridData = muridResult.rows[0];

    res.json({
      success: true,
      data: {
        guru: {
          total: parseInt(guruData.total_guru),
          aktif: parseInt(guruData.guru_aktif),
          nonaktif: parseInt(guruData.guru_nonaktif)
        },
        murid: {
          total: parseInt(muridData.total_murid),
          aktif: parseInt(muridData.murid_aktif),
          alumni: parseInt(muridData.murid_alumni),
          pindah: parseInt(muridData.murid_pindah),
          tidak_aktif: parseInt(muridData.murid_tidak_aktif),
          drop_out: parseInt(muridData.murid_drop_out)
        }
      },
      message: 'Ringkasan dashboard berhasil diambil',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard ringkasan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan dashboard',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
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
      
      // Guru endpoints
      'GET /api/dashboard/guru-aktif',
      'GET /api/dashboard/statistik-guru',
      'GET /api/dashboard/daftar-guru-aktif',
      'GET /api/dashboard/guru-per-bulan',
      'GET /api/dashboard/cari-guru',
      
      // Murid endpoints (updated)
      'GET /api/dashboard/murid-aktif',
      'GET /api/dashboard/statistik-murid',
      'GET /api/dashboard/daftar-murid-aktif',
      'GET /api/dashboard/murid-per-tahun',
      'GET /api/dashboard/murid-per-status',
      'GET /api/dashboard/cari-murid',
      'GET /api/dashboard/detail-murid/:nis',
      
      // Utility endpoints
      'GET /api/dashboard/ringkasan'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server dengan database check
const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('   GET /api/health');
    console.log('');
    console.log('   === GURU ENDPOINTS ===');
    console.log('   GET /api/dashboard/guru-aktif');
    console.log('   GET /api/dashboard/statistik-guru');
    console.log('   GET /api/dashboard/daftar-guru-aktif');
    console.log('   GET /api/dashboard/guru-per-bulan');
    console.log('   GET /api/dashboard/cari-guru');
    console.log('');
    console.log('   === MURID ENDPOINTS (UPDATED) ===');
    console.log('   GET /api/dashboard/murid-aktif');
    console.log('   GET /api/dashboard/statistik-murid');
    console.log('   GET /api/dashboard/daftar-murid-aktif');
    console.log('   GET /api/dashboard/murid-per-tahun');
    console.log('   GET /api/dashboard/murid-per-status');
    console.log('   GET /api/dashboard/cari-murid');
    console.log('   GET /api/dashboard/detail-murid/:nis');
    console.log('');
    console.log('   === UTILITY ENDPOINTS ===');
    console.log('   GET /api/dashboard/ringkasan');
    console.log('');
    
    if (dbConnected) {
      console.log('✅ Server ready to serve database data');
      console.log('📊 Murid Status Enum: Aktif, Alumni, Pindah, Tidak Aktif, Drop Out');
      console.log('👥 Jenis Kelamin Enum: Laki-laki, Perempuan');
    } else {
      console.log('❌ Server started but database is not connected');
      console.log('⚠️  All API calls will return database connection errors');
      console.log('⚠️  Please check your .env configuration and restart the server');
    }
  });
};

startServer();

module.exports = app;