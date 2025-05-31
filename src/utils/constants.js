// src/utils/constants.js

export const APP_CONFIG = {
  name: 'Sistem Sekolah Pro',
  version: '1.0.0',
  description: 'Sistem Manajemen Sekolah untuk TK dan SD'
};

export const ROLES = {
  SUPERUSER: 'superuser',
  KEPALA_SEKOLAH: 'kepala_sekolah',
  GURU: 'guru',
  KARYAWAN: 'karyawan',
  SISWA: 'siswa'
};

export const ROLE_LABELS = {
  [ROLES.SUPERUSER]: 'Super Admin',
  [ROLES.KEPALA_SEKOLAH]: 'Kepala Sekolah',
  [ROLES.GURU]: 'Guru',
  [ROLES.KARYAWAN]: 'Karyawan',
  [ROLES.SISWA]: 'Siswa'
};

export const ROUTES = {
  LOGIN: '/login',
  SUPERUSER: '/superuser',
  KEPALA_SEKOLAH: '/kepala-sekolah',
  GURU: '/guru',
  KARYAWAN: '/karyawan',
  SISWA: '/siswa'
};

// Demo users for development/testing
export const DEMO_USERS = {
  'superuser@sekolah.com': {
    role: ROLES.SUPERUSER,
    name: 'Super Admin',
    password: 'admin123',
    email: 'superuser@sekolah.com'
  },
  'sari@sekolah.com': {
    role: ROLES.KEPALA_SEKOLAH,
    name: 'Dr. Sari Dewi',
    password: 'kepala123',
    email: 'sari@sekolah.com'
  },
  'ahmad@sekolah.com': {
    role: ROLES.GURU,
    name: 'Ahmad Rizki',
    password: 'guru123',
    email: 'ahmad@sekolah.com',
    subject: 'Matematika',
    class: '5A'
  },
  'maya@sekolah.com': {
    role: ROLES.KARYAWAN,
    name: 'Maya Sinta',
    password: 'karyawan123',
    email: 'maya@sekolah.com',
    department: 'Administrasi'
  },
  'budi@sekolah.com': {
    role: ROLES.SISWA,
    name: 'Budi Santoso',
    password: 'siswa123',
    email: 'budi@sekolah.com',
    class: '6A',
    studentId: 'SD001'
  }
};

export const SCHOOL_LEVELS = {
  TK: 'tk',
  SD: 'sd'
};

export const TK_CLASSES = {
  'Kelompok A': 'tk-a',
  'Kelompok B': 'tk-b'
};

export const SD_CLASSES = {
  'Kelas 1': 'sd-1',
  'Kelas 2': 'sd-2',
  'Kelas 3': 'sd-3',
  'Kelas 4': 'sd-4',
  'Kelas 5': 'sd-5',
  'Kelas 6': 'sd-6'
};

export const SUBJECTS = {
  // TK Subjects
  'Tema Pembelajaran': 'tema',
  'Motorik Halus': 'motorik-halus',
  'Motorik Kasar': 'motorik-kasar',
  'Kognitif': 'kognitif',
  'Bahasa': 'bahasa-tk',
  'Sosial Emosional': 'sosial-emosional',
  
  // SD Subjects
  'Matematika': 'matematika',
  'Bahasa Indonesia': 'bahasa-indonesia',
  'IPA': 'ipa',
  'IPS': 'ips',
  'PKn': 'pkn',
  'Pendidikan Agama': 'agama',
  'Seni Budaya': 'seni-budaya',
  'Pendidikan Jasmani': 'penjas',
  'Bahasa Inggris': 'bahasa-inggris',
  'Muatan Lokal': 'muatan-lokal'
};

export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

export const STATUS_LABELS = {
  [STATUS_TYPES.ACTIVE]: 'Aktif',
  [STATUS_TYPES.INACTIVE]: 'Tidak Aktif',
  [STATUS_TYPES.PENDING]: 'Menunggu',
  [STATUS_TYPES.SUSPENDED]: 'Ditangguhkan'
};

export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  UPDATE: 'update',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  APPROVE: 'approve',
  REJECT: 'reject',
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

// Sample data for development
export const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    user: 'Ahmad Rizki',
    role: ROLES.GURU,
    action: 'menginput nilai Matematika kelas 5A',
    timestamp: '5 menit lalu',
    type: ACTIVITY_TYPES.CREATE
  },
  {
    id: 2,
    user: 'Maya Sinta',
    role: ROLES.KARYAWAN,
    action: 'memproses pembayaran SPP Andi Pratama',
    timestamp: '15 menit lalu',
    type: ACTIVITY_TYPES.UPDATE
  },
  {
    id: 3,
    user: 'Dr. Sari Dewi',
    role: ROLES.KEPALA_SEKOLAH,
    action: 'menyetujui laporan keuangan bulan Mei',
    timestamp: '1 jam lalu',
    type: ACTIVITY_TYPES.APPROVE
  },
  {
    id: 4,
    user: 'Rina Wati',
    role: ROLES.GURU,
    action: 'mengupload materi pelajaran IPA kelas 4B',
    timestamp: '2 jam lalu',
    type: ACTIVITY_TYPES.UPLOAD
  },
  {
    id: 5,
    user: '15 siswa kelas 6A',
    role: ROLES.SISWA,
    action: 'mengerjakan latihan soal online',
    timestamp: '3 jam lalu',
    type: ACTIVITY_TYPES.CREATE
  },
  {
    id: 6,
    user: 'Dedi Kurnia',
    role: ROLES.KARYAWAN,
    action: 'menambahkan 20 siswa baru TK Kelompok A',
    timestamp: '4 jam lalu',
    type: ACTIVITY_TYPES.CREATE
  },
  {
    id: 7,
    user: 'Maya Sinta',
    role: ROLES.KARYAWAN,
    action: 'menonaktifkan akun siswa yang lulus',
    timestamp: '5 jam lalu',
    type: ACTIVITY_TYPES.DEACTIVATE
  },
  {
    id: 8,
    user: 'Super Admin',
    role: ROLES.SUPERUSER,
    action: 'mengaktifkan kembali akun guru yang cuti',
    timestamp: '6 jam lalu',
    type: ACTIVITY_TYPES.ACTIVATE
  }
];

export const SYSTEM_STATS = {
  totalUsers: 1247,
  activeUsers: 892,
  totalStudents: 856,
  totalTeachers: 45,
  totalStaff: 23,
  todayLogins: 324,
  pendingApprovals: 12
};