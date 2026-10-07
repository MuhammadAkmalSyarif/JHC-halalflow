require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');

const { db, getSupabase, getConnectionString } = require('./db-supabase.cjs');

async function initCompanyProgress(database, companyId) {
  const STAGES = [
    { stage: 1, name: 'Registrasi Perusahaan' },
    { stage: 2, name: 'Dokumen Legal' },
    { stage: 3, name: 'Matrix Bahan Halal' },
    { stage: 4, name: 'Upload Produk & BOM' },
    { stage: 5, name: 'Proses Produksi Halal' },
    { stage: 6, name: 'Upload Evidence' },
    { stage: 7, name: 'Pengajuan BPJPH' },
  ];
  for (const s of STAGES) {
    try {
      await database.query(
        "INSERT INTO certification_progress (company_id, stage, stage_name, status) VALUES ($1, $2, $3, 'Belum Dimulai') ON CONFLICT (company_id, stage) DO NOTHING",
        [companyId, s.stage, s.name]
      );
    } catch(e) {}
  }
}

async function logActivity(database, companyId, userId, activityType, description) {
  try {
    await database.query(
      "INSERT INTO activities (company_id, user_id, activity_type, description) VALUES ($1, $2, $3, $4)",
      [companyId, userId, activityType, description]
    );
  } catch(e) {}
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'jhc_halalflow_jwt_secret_2026';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jhc_admin_jwt_secret_2026';

app.use(cors({
  origin: true, // izinkan semua origin (aman karena auth pakai JWT)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Uploads directory
const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch(e) {}
app.use('/uploads', express.static(uploadsDir));

// Multer config
// Multer config: gunakan memory storage agar kompatibel dengan Vercel Serverless & Supabase Storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB // 20MB

// =============================================
// MIDDLEWARE: Auth
// =============================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token tidak ada' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, company_id, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Token tidak valid atau kadaluarsa' });
  }
}

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token admin tidak ada' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded; // { id, email, name }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Token admin tidak valid' });
  }
}

// =============================================
// API: STATUS CHECK
// =============================================

app.get('/api/debug-env', async (req, res) => {
  try {
    const raw = process.env.DATABASE_URL || '';
    const converted = getConnectionString ? getConnectionString() : null;
    const maskedRaw = raw ? raw.replace(/:([^:@]+)@/, ':****@') : 'NOT_SET';
    const maskedConverted = converted ? converted.replace(/:([^:@]+)@/, ':****@') : 'NOT_SET';

    let passInfo = { length: 0, hasBrackets: false, isPlaceholder: false, sample: '' };
    try {
      const u = new URL(raw.startsWith('postgres://') ? raw.replace('postgres://', 'postgresql://') : raw);
      const decoded = decodeURIComponent(u.password || '');
      passInfo = {
        length: decoded.length,
        hasBrackets: decoded.startsWith('[') && decoded.endsWith(']'),
        isPlaceholder: decoded.toUpperCase().includes('YOUR-PASSWORD'),
        sample: decoded.length > 2 ? (decoded[0] + '...' + decoded[decoded.length - 1]) : ''
      };
    } catch(e) {}

    let dbStatus = 'untested';
    let dbError = null;
    try {
      const testResult = await db.get('SELECT 1 as connected');
      dbStatus = testResult && testResult.connected === 1 ? 'connected' : 'unexpected';
    } catch (err) {
      dbStatus = 'failed';
      dbError = err.message;
    }

    res.json({
      DATABASE_URL_RAW: maskedRaw,
      DATABASE_URL_CONVERTED: maskedConverted,
      passInfo,
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_KEY: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
      has_SMTP_USER: !!process.env.SMTP_USER,
      smtp_user_val: process.env.SMTP_USER || null,
      has_SMTP_PASS: !!(process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_PASS || process.env.APP_PASSWORD),
      smtp_pass_key_found: process.env.SMTP_PASS ? 'SMTP_PASS' : (process.env.SMTP_PASSWORD ? 'SMTP_PASSWORD' : (process.env.APP_PASSWORD ? 'APP_PASSWORD' : 'NONE')),
      smtp_pass_len: process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().length : 0,
      dbStatus,
      dbError,
      timestamp: new Date()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/status', async (req, res) => {
  res.json({
    status: 'ok',
    time: new Date(),
    version: '2.0-sqlite',
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// Temporary admin reset endpoint - force updates admin password
app.get('/api/admin-setup-reset', async (req, res) => {
  try {
    const email = 'jhc.halalflow@gmail.com';
    const password = 'JHC_Admin123';
    const name = 'JHC Administrator';
    const hash = bcrypt.hashSync(password, 12);

    const existing = await db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
    if (existing) {
      await db.prepare(`UPDATE admin_users SET password_hash = ?, name = ?, updated_at = datetime('now') WHERE email = ?`).run(hash, name, email);
    } else {
      await db.prepare(`INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)`).run(name, email, hash);
    }

    const verify = await db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
    const valid = bcrypt.compareSync(password, verify.password_hash);
    res.json({ success: true, email, passwordValid: valid, message: 'Admin credentials updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/test-email', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test SMTP Config - JHC HalalFlow',
      text: 'If you see this, your SMTP configuration is correct!'
    });
    res.json({ success: true, message: 'Email sent successfully', info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// =============================================
// API: USER AUTHENTICATION
// =============================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = await db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, 'user')
  `).run(name, email, phone || '', hash);

  const userId = result.lastInsertRowid;
  const token = jwt.sign(
    { id: userId, email, name, company_id: null, role: 'user' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  await logActivity(db, null, userId, 'register', `User baru terdaftar: ${name}`);

  res.status(201).json({
    message: 'Registrasi berhasil',
    token,
    user: { id: userId, name, email, phone: phone || '', company_id: null }
  });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, company_id: user.company_id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    message: 'Login berhasil',
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, company_id: user.company_id }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await db.prepare('SELECT id, name, email, phone, company_id, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json({ user });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email wajib diisi' });

  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    // Return success anyway to prevent email enumeration
    return res.json({ message: 'Jika email terdaftar, instruksi reset password telah dikirim.' });
  }

  // Generate a 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  // Clean old tokens for this email
  await db.prepare('DELETE FROM password_resets WHERE email = ?').run(email);
  await db.prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)').run(email, otp, expires);
  // Send email directly using nodemailer
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_PASS || process.env.APP_PASSWORD || '').replace(/\s+/g, '');

  if (!smtpUser || !smtpPass) {
    await db.prepare('DELETE FROM password_resets WHERE email = ?').run(email);
    return res.status(500).json({
      error: 'Layanan email belum aktif di server. Pastikan SMTP_USER dan SMTP_PASS Gmail telah diisi di Environment Variables Vercel.'
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT),
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${smtpUser}>`,
    to: email,
    subject: 'Kode Verifikasi Reset Password - JHC HalalFlow',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">JHC HalalFlow</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Sistem Manajemen Sertifikasi Halal</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Halo,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Anda telah meminta untuk mereset kata sandi akun JHC HalalFlow Anda. Masukkan kode verifikasi berikut untuk melanjutkan proses reset password:
          </p>
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px dashed #059669; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="font-size: 12px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase;">Kode Verifikasi</span>
            <div style="font-size: 34px; font-weight: 800; color: #047857; letter-spacing: 8px; margin-top: 8px; font-family: monospace;">${otp}</div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
            ⏳ Kode verifikasi ini berlaku selama <strong>1 jam</strong>. Demi keamanan, jangan bagikan kode ini kepada siapa pun.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[OTP] Email reset password berhasil dikirim ke: ${email}`);
    return res.json({ message: `Kode 6 digit telah dikirim ke email ${email}. Periksa inbox/spam.` });
  } catch (error) {
    console.error(`[OTP] Gagal mengirim email ke ${email}:`, error.message);
    await db.prepare('DELETE FROM password_resets WHERE email = ?').run(email);
    return res.status(500).json({
      error: `Gagal mengirim email verifikasi (${error.message}). Pastikan SMTP_USER dan App Password Gmail valid di Vercel.`
    });
  }
});

// POST /api/auth/verify-reset-token
app.post('/api/auth/verify-reset-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token wajib diisi' });

  const resetRecord = await db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);
  if (!resetRecord) {
    return res.status(400).json({ error: 'Kode verifikasi tidak valid atau sudah kadaluarsa.' });
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    await db.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);
    return res.status(400).json({ error: 'Kode verifikasi sudah kadaluarsa.' });
  }

  res.json({ message: 'Kode verifikasi valid.' });
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token dan password baru wajib diisi' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const resetRecord = await db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);
  if (!resetRecord) {
    return res.status(400).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    await db.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);
    return res.status(400).json({ error: 'Token sudah kadaluarsa.' });
  }

  // Valid, update password
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, resetRecord.email);
  await db.prepare('DELETE FROM password_resets WHERE email = ?').run(resetRecord.email);

  res.json({ message: 'Password berhasil diubah. Silakan login.' });
});

// =============================================
// API: ADMIN AUTHENTICATION
// =============================================

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const admin = await db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
  if (!admin) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h' }
  );

  res.json({
    message: 'Login admin berhasil',
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email }
  });
});

// =============================================
// API: COMPANIES (USER)
// =============================================

// POST /api/companies — Create or update company profile
app.post('/api/companies', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { nama, nib, npwp, penanggung_jawab, jenis_usaha, skala_usaha, jumlah_outlet, cabang, alamat } = req.body;

  if (!nama) return res.status(400).json({ error: 'Nama perusahaan wajib diisi' });

  // Check if user already has a company
  let company = await db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId);

  if (company) {
    // Update existing
    await db.prepare(`
      UPDATE companies SET
        nama = ?, nib = ?, npwp = ?, penanggung_jawab = ?,
        jenis_usaha = ?, skala_usaha = ?, jumlah_outlet = ?,
        cabang = ?, alamat = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(nama, nib || '', npwp || '', penanggung_jawab || '', jenis_usaha || '', skala_usaha || '', jumlah_outlet || '', cabang || '', alamat || '', company.id);

    company = await db.prepare('SELECT * FROM companies WHERE id = ?').get(company.id);
    
    // Update stage 1 progress to Selesai
    await db.prepare(`UPDATE certification_progress SET status = 'Selesai', updated_at = datetime('now') WHERE company_id = ? AND stage = 1`).run(company.id);
    
    await logActivity(db, company.id, userId, 'company_update', `Registrasi perusahaan diperbarui: ${nama}`);
  } else {
    // Create new company
    const result = await db.prepare(`
      INSERT INTO companies (user_id, nama, nib, npwp, penanggung_jawab, jenis_usaha, skala_usaha, jumlah_outlet, cabang, alamat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, nama, nib || '', npwp || '', penanggung_jawab || '', jenis_usaha || '', skala_usaha || '', jumlah_outlet || '', cabang || '', alamat || '');

    const companyId = result.lastInsertRowid;

    // Update user's company_id
    await db.prepare('UPDATE users SET company_id = ?, updated_at = datetime(\'now\') WHERE id = ?').run(companyId, userId);

    // Initialize progress stages
    await initCompanyProgress(db, companyId);

    // Set stage 1 to Selesai
    await db.prepare(`UPDATE certification_progress SET status = 'Selesai', updated_at = datetime('now') WHERE company_id = ? AND stage = 1`).run(companyId);

    company = await db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);

    await logActivity(db, companyId, userId, 'company_create', `Perusahaan baru terdaftar: ${nama}`);
  }

  // Update JWT hint (company_id now set)
  res.json({ message: 'Data perusahaan berhasil disimpan', company });
});

// GET /api/companies/mine — Get user's own company
app.get('/api/companies/mine', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId);
  if (!company) return res.json({ company: null });
  res.json({ company });
});

// =============================================
// API: LEGAL DOCUMENTS (USER)
// =============================================

// GET /api/companies/:id/legal-documents
app.get('/api/companies/:id/legal-documents', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  
  // Verify ownership
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, req.user.id);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const doc = await db.prepare('SELECT * FROM legal_documents WHERE company_id = ?').get(companyId);
  res.json({ legal: doc || {} });
});

// POST /api/companies/:id/legal-documents
app.post('/api/companies/:id/legal-documents', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const userId = req.user.id;

  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, userId);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const { telp_pemilik, telp_penyelia, email_sihalal, permohonan, sk_penyelia, sk_manajemen, kebijakan, ttd_pemilik, ttd_penyelia, ktp_pemilik, ktp_penyelia } = req.body;

  const existing = await db.prepare('SELECT id FROM legal_documents WHERE company_id = ?').get(companyId);

  if (existing) {
    await db.prepare(`
      UPDATE legal_documents SET
        telp_pemilik = ?, telp_penyelia = ?, email_sihalal = ?,
        permohonan = ?, sk_penyelia = ?, sk_manajemen = ?,
        kebijakan = ?, ttd_pemilik = ?, ttd_penyelia = ?,
        ktp_pemilik = ?, ktp_penyelia = ?,
        status = 'Menunggu Verifikasi', updated_at = datetime('now')
      WHERE company_id = ?
    `).run(telp_pemilik || '', telp_penyelia || '', email_sihalal || '', permohonan || '', sk_penyelia || '', sk_manajemen || '', kebijakan || '', ttd_pemilik || '', ttd_penyelia || '', ktp_pemilik || '', ktp_penyelia || '', companyId);
  } else {
    await db.prepare(`
      INSERT INTO legal_documents (company_id, telp_pemilik, telp_penyelia, email_sihalal, permohonan, sk_penyelia, sk_manajemen, kebijakan, ttd_pemilik, ttd_penyelia, ktp_pemilik, ktp_penyelia, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Verifikasi')
    `).run(companyId, telp_pemilik || '', telp_penyelia || '', email_sihalal || '', permohonan || '', sk_penyelia || '', sk_manajemen || '', kebijakan || '', ttd_pemilik || '', ttd_penyelia || '', ktp_pemilik || '', ktp_penyelia || '');
  }

  // Update stage 2 progress
  await db.prepare(`UPDATE certification_progress SET status = 'Menunggu Verifikasi', updated_at = datetime('now') WHERE company_id = ? AND stage = 2`).run(companyId);

  await logActivity(db, companyId, userId, 'legal_submit', 'Dokumen legal disubmit untuk verifikasi');

  const doc = await db.prepare('SELECT * FROM legal_documents WHERE company_id = ?').get(companyId);
  res.json({ message: 'Dokumen legal berhasil disimpan', legal: doc });
});

// =============================================
// API: MATERIALS (USER)
// =============================================

// GET /api/companies/:id/materials
app.get('/api/companies/:id/materials', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, req.user.id);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const progress = await db.prepare('SELECT status FROM certification_progress WHERE company_id = ? AND stage = 3').get(companyId);
  const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id = ? ORDER BY id').all(companyId);
  res.json({ materials, matrixSubmitted: progress?.status === 'Menunggu Verifikasi' || progress?.status === 'Terverifikasi' });
});

// POST /api/companies/:id/materials
app.post('/api/companies/:id/materials', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, userId);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const { nama_bahan, jenis, produsen, negara, supplier, lembaga, nomor_sertifikat, expired, halal_status } = req.body;
  if (!nama_bahan) return res.status(400).json({ error: 'Nama bahan wajib diisi' });

  await db.prepare(`
    INSERT INTO halal_materials (company_id, nama_bahan, jenis, produsen, negara, supplier, lembaga, nomor_sertifikat, expired, halal_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(companyId, nama_bahan, jenis || '', produsen || '', negara || '', supplier || '', lembaga || '', nomor_sertifikat || '', expired || '', halal_status || 'hijau');

  const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id = ? ORDER BY id').all(companyId);
  await logActivity(db, companyId, userId, 'material_add', `Bahan halal ditambahkan: ${nama_bahan}`);
  res.json({ message: 'Bahan berhasil ditambahkan', materials });
});

// PUT /api/companies/:id/materials/:matId
app.put('/api/companies/:id/materials/:matId', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const matId = parseInt(req.params.matId);
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, req.user.id);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const mat = await db.prepare('SELECT * FROM halal_materials WHERE id = ? AND company_id = ?').get(matId, companyId);
  if (!mat) return res.status(404).json({ error: 'Bahan tidak ditemukan' });

  const { nama_bahan, jenis, produsen, negara, supplier, lembaga, nomor_sertifikat, expired, halal_status } = req.body;
  await db.prepare(`
    UPDATE halal_materials SET
      nama_bahan = ?, jenis = ?, produsen = ?, negara = ?, supplier = ?,
      lembaga = ?, nomor_sertifikat = ?, expired = ?, halal_status = ?,
      updated_at = datetime('now')
    WHERE id = ? AND company_id = ?
  `).run(
    nama_bahan || mat.nama_bahan, jenis ?? mat.jenis, produsen ?? mat.produsen,
    negara ?? mat.negara, supplier ?? mat.supplier, lembaga ?? mat.lembaga,
    nomor_sertifikat ?? mat.nomor_sertifikat, expired ?? mat.expired,
    halal_status ?? mat.halal_status, matId, companyId
  );

  const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id = ? ORDER BY id').all(companyId);
  res.json({ message: 'Bahan berhasil diperbarui', materials });
});

// DELETE /api/companies/:id/materials/:matId
app.delete('/api/companies/:id/materials/:matId', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const matId = parseInt(req.params.matId);
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, req.user.id);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  await db.prepare('DELETE FROM halal_materials WHERE id = ? AND company_id = ?').run(matId, companyId);
  const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id = ? ORDER BY id').all(companyId);
  res.json({ message: 'Bahan berhasil dihapus', materials });
});

// POST /api/companies/:id/materials/import — Excel import
app.post('/api/companies/:id/materials/import', authMiddleware, upload.single('file'), async (req, res) => {
  const companyId = parseInt(req.params.id);
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, userId);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });
  if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' });

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const errors = [];
    const insertMat = await db.prepare(`
      INSERT INTO halal_materials (company_id, nama_bahan, jenis, produsen, negara, supplier, lembaga, nomor_sertifikat, expired, halal_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAll = db.transaction((rows) => {
      let count = 0;
      rows.forEach((row, idx) => {
        const nama = (row['nama_bahan'] || row['Nama Bahan'] || row['name'] || '').toString().trim();
        const expired = (row['masa_berlaku'] || row['Expired'] || row['expired'] || row['Tanggal Terbit'] || row['tanggal_terbit'] || '').toString().trim();
        const sertifikat = (
          row['nomor_sertifikat/registr'] || row['nomor_sertifikat'] || row['Nomor Sertifikat'] ||
          row['No. Sertifikat'] || row['No Sertifikat'] || row['sertifikat'] ||
          row['ID Halal'] || row['id_halal'] || row['No. Registrasi'] || ''
        ).toString().trim();

        if (!nama) {
          errors.push(`Baris ${idx + 2}: Nama bahan wajib diisi`);
          return;
        }

        let status = (row['Status Halal'] || row['status'] || 'hijau').toString().toLowerCase().trim();
        if (!['hijau', 'kuning', 'merah'].includes(status)) status = 'hijau';

        insertMat.run(
          companyId, nama,
          (row['jenis_bahan'] || '').toString().trim(),
          (row['produsen'] || '').toString().trim(),
          (row['negara'] || '').toString().trim(),
          (row['supplier'] || row['Supplier'] || '').toString().trim(),
          (row['lembaga_penerbit'] || row['Lembaga Penerbit'] || row['lembaga'] || '').toString().trim(),
          sertifikat, expired, status
        );
        count++;
      });
      return count;
    });

    const count = insertAll(rows);
    const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id = ? ORDER BY id').all(companyId);
    await logActivity(db, companyId, userId, 'materials_import', `${count} bahan diimpor dari Excel`);

    res.json({
      message: `${count} bahan berhasil diimpor`,
      errors: errors.length > 0 ? errors : undefined,
      materials
    });
  } catch (err) {
    console.error('Excel import error:', err);
    res.status(500).json({ error: 'Gagal mengimpor file Excel: ' + err.message });
  }
});

// POST /api/companies/:id/materials/submit
app.post('/api/companies/:id/materials/submit', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, userId);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const matCount = await db.prepare('SELECT COUNT(*) as c FROM halal_materials WHERE company_id = ?').get(companyId).c;
  if (matCount === 0) return res.status(400).json({ error: 'Tambahkan minimal satu bahan sebelum submit' });

  await db.prepare(`UPDATE certification_progress SET status = 'Menunggu Verifikasi', updated_at = datetime('now') WHERE company_id = ? AND stage = 3`).run(companyId);
  await logActivity(db, companyId, userId, 'matrix_submit', `Matrix bahan halal (${matCount} bahan) disubmit untuk verifikasi`);

  res.json({ message: 'Matrix bahan berhasil disubmit', matrixSubmitted: true });
});

// =============================================
// API: PROGRESS (USER)
// =============================================

// GET /api/companies/:id/progress
app.get('/api/companies/:id/progress', authMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?').get(companyId, req.user.id);
  if (!company) return res.status(403).json({ error: 'Akses ditolak' });

  const stages = await db.prepare('SELECT * FROM certification_progress WHERE company_id = ? ORDER BY stage').all(companyId);
  const matCount = await db.prepare('SELECT COUNT(*) as c FROM halal_materials WHERE company_id = ?').get(companyId).c;

  const completedStages = stages.filter(s => ['Selesai', 'Terverifikasi'].includes(s.status)).length;
  const totalPercent = Math.round((completedStages / 7) * 100);

  const currentStage = stages.find(s => !['Selesai', 'Terverifikasi'].includes(s.status)) || stages[stages.length - 1];

  res.json({
    company,
    stages,
    completedStages,
    totalPercent,
    currentStage: currentStage?.stage_name || 'Selesai',
    currentStageNum: currentStage?.stage || 7,
    matCount
  });
});

// =============================================
// API: FILE UPLOAD (USER)
// =============================================

// POST /api/upload
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File tidak ada' });

  const companyId = req.body.company_id ? parseInt(req.body.company_id) : null;
  const docType = req.body.document_type || 'general';

  const ext = path.extname(req.file.originalname);
  const basename = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
  const storedName = `${basename}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  // Upload ke Supabase Storage
  const supabase = getSupabase();
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'halalflow-uploads';
  let fileUrl = `/uploads/${storedName}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storedName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
      if (error) {
        console.error('Supabase upload error:', error.message);
      } else {
        const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(storedName);
        if (publicData?.publicUrl) {
          fileUrl = publicData.publicUrl;
        }
      }
    } catch(uploadErr) {
      console.error('Failed to upload to Supabase storage:', uploadErr.message);
    }
  }

  // Simpan record ke database
  await db.prepare(`
    INSERT INTO uploaded_files (company_id, user_id, original_name, stored_name, file_path, document_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(companyId, req.user.id, req.file.originalname, storedName, fileUrl, docType);

  res.json({
    message: 'File berhasil diupload',
    filename: storedName,
    originalName: req.file.originalname,
    url: fileUrl
  });
});

// DELETE /api/upload/:filename
app.delete('/api/upload/:filename', authMiddleware, async (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  if (!safeFilename) {
    return res.status(400).json({ error: 'Nama berkas tidak valid' });
  }

  // Hapus dari folder uploads
  const filePath = path.join(uploadsDir, safeFilename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Gagal menghapus berkas fisik:', err);
    }
  }

  // Hapus dari tabel uploaded_files jika ada
  try {
    await db.prepare('DELETE FROM uploaded_files WHERE stored_name = ?').run(safeFilename);
  } catch (err) {
    console.error('Gagal menghapus log uploaded_files:', err);
  }

  // Bersihkan referensi di evidence_data jika ada
  try {
    const userId = req.user.id;
    const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
    if (company) {
      const evRow = await db.prepare('SELECT * FROM evidence_data WHERE company_id=?').get(company.id);
      if (evRow) {
        const cleanList = (val) => {
          if (!val) return val;
          return val.split(',').map(s => s.trim()).filter(s => s && s !== safeFilename).join(',');
        };
        const updatedSosialisasi = cleanList(evRow.sosialisasiFoto);
        const updatedAudit = cleanList(evRow.auditInternalFoto);
        await db.prepare('UPDATE evidence_data SET sosialisasiFoto=?, auditInternalFoto=?, updated_at=datetime(\'now\') WHERE company_id=?')
          .run(updatedSosialisasi, updatedAudit, company.id);
      }
    }
  } catch (err) {
    console.error('Gagal membersihkan evidence_data:', err);
  }

  res.json({ message: 'Berkas berhasil dihapus', filename: safeFilename });
});

// =============================================
// BACKWARD COMPATIBILITY: Legacy API routes
// These allow the existing frontend to work while migrating
// =============================================

// Legacy: GET /api/company-profile
app.get('/api/company-profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId);
  if (!company) return res.json({});
  // Map to old format
  res.json({
    nama: company.nama,
    nib: company.nib,
    npwp: company.npwp,
    penanggungJawab: company.penanggung_jawab,
    jenisUsaha: company.jenis_usaha,
    skalaUsaha: company.skala_usaha,
    jumlahOutlet: company.jumlah_outlet,
    cabang: company.cabang,
    alamat: company.alamat,
    _company_id: company.id
  });
});

// Legacy: POST /api/company-profile
app.post('/api/company-profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { nama, nib, npwp, penanggungJawab, jenisUsaha, skalaUsaha, jumlahOutlet, cabang, alamat } = req.body;

  let company = await db.prepare('SELECT * FROM companies WHERE user_id = ?').get(userId);
  if (company) {
    await db.prepare(`
      UPDATE companies SET nama=?, nib=?, npwp=?, penanggung_jawab=?, jenis_usaha=?, skala_usaha=?, jumlah_outlet=?, cabang=?, alamat=?, updated_at=datetime('now')
      WHERE user_id=?
    `).run(nama||'', nib||'', npwp||'', penanggungJawab||'', jenisUsaha||'', skalaUsaha||'', jumlahOutlet||'', cabang||'', alamat||'', userId);
  } else {
    const r = await db.prepare(`INSERT INTO companies (user_id,nama,nib,npwp,penanggung_jawab,jenis_usaha,skala_usaha,jumlah_outlet,cabang,alamat) VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).run(userId, nama||'', nib||'', npwp||'', penanggungJawab||'', jenisUsaha||'', skalaUsaha||'', jumlahOutlet||'', cabang||'', alamat||'');
    const cid = r.lastInsertRowid;
    await db.prepare('UPDATE users SET company_id=? WHERE id=?').run(cid, userId);
    await initCompanyProgress(db, cid);
  }

  company = await db.prepare('SELECT * FROM companies WHERE user_id=?').get(userId);
  if (company) {
    await db.prepare(`UPDATE certification_progress SET status='Selesai' WHERE company_id=? AND stage=1`).run(company.id);
    await logActivity(db, company.id, userId, 'company_update', `Registrasi perusahaan: ${nama}`);
  }

  res.json({ message: 'Profile saved successfully', data: req.body });
});

// Legacy: GET /api/legal
app.get('/api/legal', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.json({});
  const doc = await db.prepare('SELECT * FROM legal_documents WHERE company_id=?').get(company.id);
  if (!doc) return res.json({});
  res.json({
    telpPemilik: doc.telp_pemilik, telpPenyelia: doc.telp_penyelia,
    emailSihalal: doc.email_sihalal, permohonan: doc.permohonan,
    sk_penyelia: doc.sk_penyelia, sk_manajemen: doc.sk_manajemen,
    kebijakan: doc.kebijakan, ttdPemilik: doc.ttd_pemilik, ttdPenyelia: doc.ttd_penyelia
  });
});

// Legacy: POST /api/legal
app.post('/api/legal', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Buat profil perusahaan dulu' });

  const { telpPemilik, telpPenyelia, emailSihalal, permohonan, sk_penyelia, sk_manajemen, kebijakan, ttdPemilik, ttdPenyelia, ktpPemilik, ktpPenyelia } = req.body;
  const existing = await db.prepare('SELECT id FROM legal_documents WHERE company_id=?').get(company.id);
  if (existing) {
    await db.prepare(`UPDATE legal_documents SET telp_pemilik=?,telp_penyelia=?,email_sihalal=?,permohonan=?,sk_penyelia=?,sk_manajemen=?,kebijakan=?,ttd_pemilik=?,ttd_penyelia=?,ktp_pemilik=?,ktp_penyelia=?,status='Menunggu Verifikasi',updated_at=datetime('now') WHERE company_id=?`
    ).run(telpPemilik||'', telpPenyelia||'', emailSihalal||'', permohonan||'', sk_penyelia||'', sk_manajemen||'', kebijakan||'', ttdPemilik||'', ttdPenyelia||'', ktpPemilik||'', ktpPenyelia||'', company.id);
  } else {
    await db.prepare(`INSERT INTO legal_documents (company_id,telp_pemilik,telp_penyelia,email_sihalal,permohonan,sk_penyelia,sk_manajemen,kebijakan,ttd_pemilik,ttd_penyelia,ktp_pemilik,ktp_penyelia,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'Menunggu Verifikasi')`
    ).run(company.id, telpPemilik||'', telpPenyelia||'', emailSihalal||'', permohonan||'', sk_penyelia||'', sk_manajemen||'', kebijakan||'', ttdPemilik||'', ttdPenyelia||'', ktpPemilik||'', ktpPenyelia||'');
  }
  await db.prepare(`UPDATE certification_progress SET status='Menunggu Verifikasi' WHERE company_id=? AND stage=2`).run(company.id);
  await logActivity(db, company.id, userId, 'legal_submit', 'Dokumen legal disubmit');
  res.json({ message: 'Legal data saved successfully' });
});

// Legacy: GET /api/materials
app.get('/api/materials', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.json({ materials: [], matrixSubmitted: false });
  const progress = await db.prepare('SELECT status FROM certification_progress WHERE company_id=? AND stage=3').get(company.id);
  const materials = await db.prepare('SELECT * FROM halal_materials WHERE company_id=? ORDER BY id').all(company.id);
  // Map to legacy format
  const mapped = materials.map(m => ({ id: m.id, name: m.nama_bahan, jenis: m.jenis, produsen: m.produsen, negara: m.negara, supplier: m.supplier, lembaga: m.lembaga, sertifikat: m.nomor_sertifikat, expired: m.expired, status: m.halal_status }));
  res.json({ materials: mapped, matrixSubmitted: ['Menunggu Verifikasi','Terverifikasi'].includes(progress?.status) });
});

// Legacy: POST /api/materials
app.post('/api/materials', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Buat profil perusahaan dulu' });
  const { name, jenis, produsen, negara, supplier, lembaga, sertifikat, expired, status } = req.body;
  await db.prepare(`INSERT INTO halal_materials (company_id,nama_bahan,jenis,produsen,negara,supplier,lembaga,nomor_sertifikat,expired,halal_status) VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(company.id, name||'', jenis||'', produsen||'', negara||'', supplier||'', lembaga||'', sertifikat||'', expired||'', status||'hijau');
  const all = await db.prepare('SELECT * FROM halal_materials WHERE company_id=? ORDER BY id').all(company.id);
  const mapped = all.map(m => ({ id: m.id, name: m.nama_bahan, jenis: m.jenis, produsen: m.produsen, negara: m.negara, supplier: m.supplier, lembaga: m.lembaga, sertifikat: m.nomor_sertifikat, expired: m.expired, status: m.halal_status }));
  await logActivity(db, company.id, userId, 'material_add', `Bahan ditambahkan: ${name}`);
  res.json({ message: 'Material added successfully', materials: mapped });
});

// Legacy: PUT /api/materials/:id
app.put('/api/materials/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  const matId = parseInt(req.params.id);
  const mat = await db.prepare('SELECT * FROM halal_materials WHERE id=? AND company_id=?').get(matId, company.id);
  if (!mat) return res.status(404).json({ error: 'Bahan tidak ditemukan' });
  const { name, jenis, produsen, negara, supplier, lembaga, sertifikat, expired, status } = req.body;
  await db.prepare(`UPDATE halal_materials SET nama_bahan=?,jenis=?,produsen=?,negara=?,supplier=?,lembaga=?,nomor_sertifikat=?,expired=?,halal_status=?,updated_at=datetime('now') WHERE id=? AND company_id=?`
  ).run(name||mat.nama_bahan, jenis??mat.jenis, produsen??mat.produsen, negara??mat.negara, supplier??mat.supplier, lembaga??mat.lembaga, sertifikat??mat.nomor_sertifikat, expired??mat.expired, status??mat.halal_status, matId, company.id);
  const all = await db.prepare('SELECT * FROM halal_materials WHERE company_id=? ORDER BY id').all(company.id);
  const mapped = all.map(m => ({ id: m.id, name: m.nama_bahan, jenis: m.jenis, produsen: m.produsen, negara: m.negara, supplier: m.supplier, lembaga: m.lembaga, sertifikat: m.nomor_sertifikat, expired: m.expired, status: m.halal_status }));
  res.json({ message: 'Material updated', materials: mapped });
});

// Legacy: DELETE /api/materials/:id
app.delete('/api/materials/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  await db.prepare('DELETE FROM halal_materials WHERE id=? AND company_id=?').run(parseInt(req.params.id), company.id);
  const all = await db.prepare('SELECT * FROM halal_materials WHERE company_id=? ORDER BY id').all(company.id);
  const mapped = all.map(m => ({ id: m.id, name: m.nama_bahan, jenis: m.jenis, produsen: m.produsen, negara: m.negara, supplier: m.supplier, lembaga: m.lembaga, sertifikat: m.nomor_sertifikat, expired: m.expired, status: m.halal_status }));
  res.json({ message: 'Material deleted', materials: mapped });
});

// Legacy: POST /api/materials/import
app.post('/api/materials/import', authMiddleware, upload.single('file'), async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Buat profil perusahaan dulu' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });
    const insertMat = await db.prepare(`INSERT INTO halal_materials (company_id,nama_bahan,jenis,produsen,negara,supplier,lembaga,nomor_sertifikat,expired,halal_status) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    let count = 0;
    const insertAll = db.transaction((rows) => {
      for (const row of rows) {
        const name = (row['nama_bahan']||row['Nama Bahan']||row['name']||'').toString().trim();
        if (!name) continue;
        let status = (row['Status Halal']||row['status']||'hijau').toString().toLowerCase().trim();
        if (!['hijau','kuning','merah'].includes(status)) status = 'hijau';
        const sertifikat = (
          row['nomor_sertifikat/registr'] || row['nomor_sertifikat'] || row['Nomor Sertifikat'] ||
          row['No. Sertifikat'] || row['No Sertifikat'] || row['sertifikat'] ||
          row['ID Halal'] || row['id_halal'] || row['No. Registrasi'] || ''
        ).toString().trim();
        const expired = (
          row['masa_berlaku'] || row['Masa Berlaku'] || row['Expired'] || row['expired'] ||
          row['Tanggal Terbit'] || row['tanggal_terbit'] || ''
        ).toString().trim();
        insertMat.run(company.id, name, (row['jenis_bahan']||'').toString().trim(), (row['produsen']||'').toString().trim(), (row['negara']||'').toString().trim(), (row['supplier']||row['Supplier']||'').toString().trim(), (row['lembaga_penerbit']||row['Lembaga Penerbit']||row['lembaga']||'').toString().trim(), sertifikat, expired, status);
        count++;
      }
    });
    insertAll(rows);
    const all = await db.prepare('SELECT * FROM halal_materials WHERE company_id=? ORDER BY id').all(company.id);
    const mapped = all.map(m => ({ id: m.id, name: m.nama_bahan, jenis: m.jenis, produsen: m.produsen, negara: m.negara, supplier: m.supplier, lembaga: m.lembaga, sertifikat: m.nomor_sertifikat, expired: m.expired, status: m.halal_status }));
    await logActivity(db, company.id, userId, 'materials_import', `${count} bahan diimpor dari Excel`);
    res.json({ message: `${count} bahan baku berhasil diimpor`, materials: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengimpor file Excel' });
  }
});

// Legacy: POST /api/materials/submit
app.post('/api/materials/submit', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  await db.prepare(`UPDATE certification_progress SET status='Menunggu Verifikasi',updated_at=datetime('now') WHERE company_id=? AND stage=3`).run(company.id);
  await logActivity(db, company.id, userId, 'matrix_submit', 'Matrix bahan disubmit');
  res.json({ message: 'Matrix submitted successfully', matrixSubmitted: true });
});

// Legacy: GET /api/progress
app.get('/api/progress', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT * FROM companies WHERE user_id=?').get(userId);
  const user = await db.prepare('SELECT * FROM users WHERE id=?').get(userId);

  if (!company) {
    return res.json({ currentUser: { namaLengkap: user?.name, email: user?.email, nomorTelepon: user?.phone, loginAt: user?.created_at }, steps: [], completedCount: 0, totalPercent: 0, materialsCount: 0, certificationStatus: 0 });
  }

  const stages = await db.prepare('SELECT * FROM certification_progress WHERE company_id=? ORDER BY stage').all(company.id);
  const matCount = await db.prepare('SELECT COUNT(*) as c FROM halal_materials WHERE company_id=?').get(company.id).c;

  const steps = stages.map(s => ({
    id: s.stage, label: s.stage_name,
    completed: ['Selesai','Terverifikasi'].includes(s.status),
    status: s.status,
    detail: s.status
  }));

  const completedCount = steps.filter(s => s.completed).length;
  const totalPercent = Math.round((completedCount / 7) * 100);

  res.json({
    currentUser: { namaLengkap: user?.name, email: user?.email, nomorTelepon: user?.phone, loginAt: user?.created_at },
    company,
    steps, completedCount, totalPercent,
    materialsCount: matCount, certificationStatus: company.certification_status || 0
  });
});

// GET /api/certification-status
app.get('/api/certification-status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT certification_status, permohonan_status, permohonan_catatan, nomor_sertifikat, tgl_terbit_sertifikat, file_sertifikat, jadwal_audit, auditor_name FROM companies WHERE user_id=?').get(userId);
  res.json({
    certificationStatus: company?.certification_status || 0,
    permohonanStatus: company?.permohonan_status || 'belum',
    permohonanCatatan: company?.permohonan_catatan || '',
    nomorSertifikat: company?.nomor_sertifikat || '',
    tglTerbitSertifikat: company?.tgl_terbit_sertifikat || '',
    fileSertifikat: company?.file_sertifikat || '',
    jadwalAudit: company?.jadwal_audit || '',
    auditorName: company?.auditor_name || ''
  });
});

// =============================================
// API: PRODUCTS & BOM (USER)
// =============================================

// Ensure products table exists
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        bahan JSONB DEFAULT '[]'::jsonb,
        submitted INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS production_data (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
        alur_proses TEXT,
        layout_ruang TEXT,
        bebas_babi TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch(e) { console.log('Tables may already exist:', e.message); }
})()

// GET /api/products — get all products for user's company
app.get('/api/products', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.json({ products: [], productsSubmitted: false });
  const rows = await db.prepare('SELECT * FROM products WHERE company_id=? ORDER BY id').all(company.id);
  const products = rows.map(r => ({ ...r, bahan: JSON.parse(r.bahan || '[]') }));
  const submitted = products.length > 0 && products.every(p => p.submitted === 1);
  res.json({ products, productsSubmitted: submitted });
});

// POST /api/products — save a product with BOM
app.post('/api/products', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan belum dibuat' });
  const { name, bahan } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama produk wajib diisi' });
  const bahanJson = JSON.stringify(bahan || []);
  await db.prepare(`INSERT INTO products (company_id, name, bahan, submitted) VALUES (?, ?, ?, 0)`).run(company.id, name, bahanJson);
  const rows = await db.prepare('SELECT * FROM products WHERE company_id=? ORDER BY id').all(company.id);
  const products = rows.map(r => ({ ...r, bahan: JSON.parse(r.bahan || '[]') }));
  await logActivity(db, company.id, userId, 'product_add', `Produk ditambahkan: ${name}`);
  res.json({ message: 'OK', products });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  await db.prepare('DELETE FROM products WHERE id=? AND company_id=?').run(parseInt(req.params.id), company.id);
  const rows = await db.prepare('SELECT * FROM products WHERE company_id=? ORDER BY id').all(company.id);
  const products = rows.map(r => ({ ...r, bahan: JSON.parse(r.bahan || '[]') }));
  res.json({ message: 'OK', products });
});

// POST /api/products/import — Excel import (stub, keeps compatibility)
app.post('/api/products/import', authMiddleware, upload.single('file'), async (req, res) => res.json({ message: '0 produk diimpor', products: [] }));

// POST /api/products/submit — mark stage 4 as submitted
app.post('/api/products/submit', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  await db.prepare(`UPDATE products SET submitted=1 WHERE company_id=?`).run(company.id);
  await db.prepare(`UPDATE certification_progress SET status='Menunggu Verifikasi', updated_at=datetime('now') WHERE company_id=? AND stage=4`).run(company.id);
  await logActivity(db, company.id, userId, 'products_submit', 'Data produk & BOM disubmit untuk verifikasi');
  res.json({ message: 'OK', productsSubmitted: true });
});

// =============================================
// API: PROSES PRODUKSI (USER)
// =============================================

// GET /api/production
app.get('/api/production', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.json({});
  const row = await db.prepare('SELECT * FROM production_data WHERE company_id=?').get(company.id);
  if (!row) return res.json({});
  res.json({ alurProses: row.alur_proses, layoutRuang: row.layout_ruang, bebasBabi: row.bebas_babi });
});

// POST /api/production
app.post('/api/production', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  const { alurProses, layoutRuang, bebasBabi } = req.body;
  const existing = await db.prepare('SELECT id FROM production_data WHERE company_id=?').get(company.id);
  if (existing) {
    await db.prepare(`UPDATE production_data SET alur_proses=?, layout_ruang=?, bebas_babi=?, updated_at=datetime('now') WHERE company_id=?`)
      .run(alurProses||existing.alur_proses, layoutRuang||existing.layout_ruang, bebasBabi||existing.bebas_babi, company.id);
  } else {
    await db.prepare(`INSERT INTO production_data (company_id, alur_proses, layout_ruang, bebas_babi) VALUES (?,?,?,?)`)
      .run(company.id, alurProses||'', layoutRuang||'', bebasBabi||'');
  }
  await db.prepare(`UPDATE certification_progress SET status='Menunggu Verifikasi', updated_at=datetime('now') WHERE company_id=? AND stage=5`).run(company.id);
  await logActivity(db, company.id, userId, 'production_save', 'Dokumen proses produksi halal disimpan');
  res.json({ message: 'OK' });
});

// =============================================
// API: EVIDENCE BUKTI (USER)
// =============================================

// Ensure evidence_data table exists
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS evidence_data (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
        sosialisasiFoto TEXT,
        auditInternalFoto TEXT,
        sosialisasiAbsen TEXT,
        auditInternalAbsen TEXT,
        pembelianBahan TEXT,
        penyimpananBahan TEXT,
        hasilProduksi TEXT,
        distribusiProduk TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch(e) { console.log('Tables may already exist:', e.message); }
})()

app.get('/api/evidence', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.json({});
  const row = await db.prepare('SELECT * FROM evidence_data WHERE company_id=?').get(company.id);
  if (!row) return res.json({});
  res.json({
    sosialisasiFoto: row.sosialisasiFoto,
    auditInternalFoto: row.auditInternalFoto,
    sosialisasiAbsen: row.sosialisasiAbsen,
    auditInternalAbsen: row.auditInternalAbsen,
    pembelianBahan: row.pembelianBahan,
    penyimpananBahan: row.penyimpananBahan,
    hasilProduksi: row.hasilProduksi,
    distribusiProduk: row.distribusiProduk
  });
});

app.post('/api/evidence', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  const data = req.body;
  const existing = await db.prepare('SELECT id FROM evidence_data WHERE company_id=?').get(company.id);
  if (existing) {
    await db.prepare(`
      UPDATE evidence_data SET 
        sosialisasiFoto=?, auditInternalFoto=?, sosialisasiAbsen=?, auditInternalAbsen=?, 
        pembelianBahan=?, penyimpananBahan=?, hasilProduksi=?, distribusiProduk=?, updated_at=datetime('now')
      WHERE company_id=?
    `).run(
      data.sosialisasiFoto !== undefined ? data.sosialisasiFoto : (existing.sosialisasiFoto || ''),
      data.auditInternalFoto !== undefined ? data.auditInternalFoto : (existing.auditInternalFoto || ''),
      data.sosialisasiAbsen !== undefined ? data.sosialisasiAbsen : (existing.sosialisasiAbsen || ''),
      data.auditInternalAbsen !== undefined ? data.auditInternalAbsen : (existing.auditInternalAbsen || ''),
      data.pembelianBahan !== undefined ? data.pembelianBahan : (existing.pembelianBahan || ''),
      data.penyimpananBahan !== undefined ? data.penyimpananBahan : (existing.penyimpananBahan || ''),
      data.hasilProduksi !== undefined ? data.hasilProduksi : (existing.hasilProduksi || ''),
      data.distribusiProduk !== undefined ? data.distribusiProduk : (existing.distribusiProduk || ''),
      company.id
    );
  } else {
    await db.prepare(`
      INSERT INTO evidence_data (
        company_id, sosialisasiFoto, auditInternalFoto, sosialisasiAbsen, auditInternalAbsen,
        pembelianBahan, penyimpananBahan, hasilProduksi, distribusiProduk
      ) VALUES (?,?,?,?,?,?,?,?,?)
    `).run(
      company.id, data.sosialisasiFoto||'', data.auditInternalFoto||'', data.sosialisasiAbsen||'', data.auditInternalAbsen||'',
      data.pembelianBahan||'', data.penyimpananBahan||'', data.hasilProduksi||'', data.distribusiProduk||''
    );
  }
  await db.prepare(`UPDATE certification_progress SET status='Menunggu Verifikasi', updated_at=datetime('now') WHERE company_id=? AND stage=6`).run(company.id);
  await logActivity(db, company.id, userId, 'evidence_save', 'Dokumen evidence disimpan');
  res.json({ message: 'OK' });
});

// =============================================
// API: SUBMIT APPLICATION & CERTIFICATE (USER)
// =============================================

app.post('/api/submit-application', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id, nama FROM companies WHERE user_id=?').get(userId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  // Update status permohonan to 'menunggu' (pending review by admin)
  await db.prepare(`
    UPDATE companies 
    SET permohonan_status='menunggu', permohonan_catatan='', updated_at=datetime('now') 
    WHERE id=?
  `).run(company.id);

  await db.prepare(`
    UPDATE certification_progress 
    SET status='Menunggu Verifikasi', updated_by='user', updated_at=datetime('now') 
    WHERE company_id=? AND stage=7
  `).run(company.id);

  await logActivity(db, company.id, userId, 'submit_application', 'Pelaku usaha mengajukan permohonan sertifikasi halal');
  res.json({ message: 'Permohonan berhasil diajukan ke Admin JHC', permohonanStatus: 'menunggu' });
});

app.get('/api/certificate', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const company = await db.prepare('SELECT id, nama, nib, certification_status, permohonan_status, nomor_sertifikat, tgl_terbit_sertifikat, file_sertifikat FROM companies WHERE user_id=?').get(userId);
  if (!company || (company.certification_status < 8 && !company.file_sertifikat)) {
    return res.status(403).json({ error: 'Sertifikat belum tersedia atau belum diterbitkan' });
  }

  // If company has uploaded file and user requests direct file download or redirect
  if (req.query.file === '1' && company.file_sertifikat) {
    return res.redirect(`/uploads/${company.file_sertifikat}`);
  }
  
  const nomorSertifikat = company.nomor_sertifikat || 'ID' + (company.id + 311100000000).toString();
  const tglTerbit = company.tgl_terbit_sertifikat || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Halal - ${company.nama || 'Perusahaan'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html {
            background-color: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 24px;
        }
        
        .certificate-wrapper {
            background: #ffffff;
            padding: 24px;
            box-shadow: 0 25px 60px -15px rgba(0,0,0,0.5);
            border-radius: 20px;
            max-width: 900px;
            width: 100%;
        }

        .certificate {
            width: 100%;
            min-height: 600px;
            padding: 48px 40px;
            position: relative;
            background: #ffffff radial-gradient(#10b981 0.75px, transparent 0.75px);
            background-size: 24px 24px;
            border: 8px double #059669;
            border-radius: 12px;
            box-sizing: border-box;
            text-align: center;
            color: #1e293b;
        }

        .cert-header {
            margin-bottom: 24px;
        }

        .logo-title {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            color: #065f46;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 900;
        }

        .main-title {
            font-family: 'Cinzel', serif;
            font-size: 38px;
            color: #047857;
            margin: 12px 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-weight: 700;
        }

        .sub-title {
            font-size: 13px;
            color: #64748b;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .cert-number {
            display: inline-block;
            margin-top: 14px;
            padding: 6px 18px;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            color: #065f46;
            letter-spacing: 1px;
        }

        .content {
            margin: 28px 0;
        }

        .presented-to {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 10px;
        }

        .company-name {
            font-family: 'Cinzel', serif;
            font-size: 34px;
            color: #0f172a;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
            display: inline-block;
            padding-bottom: 6px;
            margin-bottom: 16px;
        }

        .company-nib {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 14px;
        }

        .description {
            font-size: 14px;
            color: #334155;
            line-height: 1.7;
            max-width: 680px;
            margin: 0 auto;
        }

        .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 20px;
        }

        .sig-block {
            text-align: center;
            min-width: 180px;
        }

        .sig-val {
            font-weight: 700;
            font-size: 14px;
            color: #0f172a;
            border-bottom: 1.5px solid #94a3b8;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }

        .sig-lbl {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .halal-badge {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #059669, #10b981);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.5);
            border: 4px solid #ffffff;
            outline: 2px dashed #059669;
        }

        .halal-badge .text {
            font-family: 'Cinzel', serif;
            font-weight: 900;
            font-size: 14px;
            letter-spacing: 1px;
        }

        .actions-bar {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 12px;
        }

        .btn-print {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-print:hover { background: #047857; }

        @media print {
            body, html { background: white; padding: 0; }
            .certificate-wrapper { box-shadow: none; padding: 0; }
            .actions-bar { display: none; }
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <div class="cert-header">
                <div class="logo-title">JHC HalalFlow • BPJPH</div>
                <h1 class="main-title">Sertifikat Halal</h1>
                <div class="sub-title">Sistem Jaminan Produk Halal (SJPH)</div>
                <div class="cert-number">Nomor Sertifikat: ${nomorSertifikat}</div>
            </div>

            <div class="content">
                <div class="presented-to">Diberikan secara resmi kepada:</div>
                <div class="company-name">${company.nama || 'Nama Perusahaan'}</div>
                ${company.nib ? `<div class="company-nib">Nomor Induk Berusaha (NIB): <strong>${company.nib}</strong></div>` : ''}
                <div class="description">
                    Telah memenuhi seluruh kriteria dan standar penerapan <strong>Sistem Jaminan Produk Halal (SJPH)</strong> sesuai dengan ketentuan Badan Penyelenggara Jaminan Produk Halal (BPJPH) dan Majelis Ulama Indonesia (MUI).
                </div>
            </div>

            <div class="footer">
                <div class="sig-block">
                    <div class="sig-val">${tglTerbit}</div>
                    <div class="sig-lbl">Tanggal Terbit</div>
                </div>

                <div class="halal-badge">
                    <span class="text">HALAL</span>
                    <span style="font-size: 9px; opacity: 0.9;">INDONESIA</span>
                </div>

                <div class="sig-block">
                    <div class="sig-val">Admin & Komite Halal JHC</div>
                    <div class="sig-lbl">Otorisasi Resmi</div>
                </div>
            </div>
        </div>

        <div class="actions-bar">
            <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
            ${company.file_sertifikat ? `<a href="/uploads/${company.file_sertifikat}" target="_blank" class="btn-print" style="background:#0284c7; text-decoration:none;">📄 Unduh Berkas Asli (PDF/Gambar)</a>` : ''}
        </div>
    </div>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

// =============================================
// API: CHAT (USER) — Smart HalalFlow Assistant
// =============================================
app.get('/api/chat', authMiddleware, async (req, res) => res.json([{ sender: 'ai', text: 'Halo! 👋 Saya AI Halal Assistant JHC HalalFlow.\n\nSaya siap membantu Anda seputar:\n• Proses sertifikasi halal BPJPH\n• Cara penggunaan aplikasi JHC HalalFlow\n• Regulasi SJPH & dokumen yang dibutuhkan\n• Bahan halal & status halal produk\n\nSilakan tanyakan apa yang ingin Anda ketahui! 😊' }]));

app.post('/api/chat', authMiddleware, async (req, res) => {
  const userText = (req.body.text || '').toLowerCase().trim();

  // Knowledge base - keyword matching
  const KB = [
    // === HALALFLOW PLATFORM ===
    {
      keys: ['halalflow', 'jhc halalflow', 'platform', 'aplikasi ini', 'sistem ini', 'halalflow.or.id'],
      answer: 'JHC HalalFlow adalah platform digital resmi dari Jasa Halal Consulting (JHC) yang membantu pelaku usaha dalam proses pendampingan sertifikasi halal BPJPH secara online.\n\nMelalui JHC HalalFlow di halalflow.or.id, Anda dapat:\n✅ Mendaftar dan mengelola profil perusahaan\n✅ Upload dokumen SJPH secara digital\n✅ Memantau progress sertifikasi halal secara real-time\n✅ Berkomunikasi langsung dengan pendamping JHC\n✅ Mengunduh sertifikat halal yang sudah terbit\n\nInfo lebih lanjut: halalflow.or.id'
    },
    // === SERTIFIKASI HALAL UMUM ===
    {
      keys: ['sertifikasi halal', 'sertifikat halal', 'cara daftar', 'proses sertifikasi', 'bagaimana cara', 'mulai dari mana', 'langkah'],
      answer: 'Proses Sertifikasi Halal melalui JHC HalalFlow:\n\n1️⃣ Registrasi Perusahaan — Lengkapi profil usaha Anda\n2️⃣ Dokumen Legal — Upload SK Penyelia Halal, SK Manajemen, Kebijakan Halal\n3️⃣ Matrix Bahan Halal — Daftarkan semua bahan baku beserta sertifikat halalnya\n4️⃣ Upload Produk & BOM — Masukkan daftar produk beserta komposisi bahan\n5️⃣ Proses Produksi — Upload alur proses, layout, surat pernyataan bebas babi\n6️⃣ Upload Evidence (Bukti) — Foto sosialisasi, audit internal, dll\n7️⃣ Pengajuan ke BPJPH — Submit permohonan resmi\n\nSetelah diajukan, Admin JHC akan memproses pengajuan Anda ke BPJPH/SIHALAL.'
    },
    // === SJPH ===
    {
      keys: ['sjph', 'sistem jaminan produk halal', 'jaminan halal'],
      answer: 'SJPH (Sistem Jaminan Produk Halal) adalah sistem yang terintegrasi dan komprehensif yang mencakup keseluruhan proses untuk menghasilkan produk halal.\n\nKomponen utama SJPH:\n📋 Komitmen & Tanggung Jawab Manajemen\n👤 Penyelia Halal yang tersertifikasi\n📚 Prosedur dan panduan halal tertulis\n🔬 Pengelolaan bahan (harus bersertifikat halal)\n🏭 Proses produksi yang terjamin kehalalannya\n🧪 Produk yang diklaim halal\n📦 Pengemasan & penyimpanan yang sesuai\n📝 Audit internal & evaluasi berkala\n\nSemua komponen ini harus didokumentasikan dan diupload melalui JHC HalalFlow.'
    },
    // === BPJPH ===
    {
      keys: ['bpjph', 'badan penyelenggara', 'sihalal', 'lph', 'lembaga pemeriksa halal'],
      answer: 'BPJPH (Badan Penyelenggara Jaminan Produk Halal) adalah badan pemerintah di bawah Kemenag RI yang berwenang menyelenggarakan sertifikasi halal.\n\nAlur di BPJPH:\n1. Pelaku usaha daftar di SIHALAL (sihalal.bpjph.go.id)\n2. BPJPH memeriksa kelengkapan dokumen\n3. Diteruskan ke LPH (Lembaga Pemeriksa Halal) untuk audit\n4. LPH melakukan pemeriksaan/audit\n5. MUI melakukan Sidang Fatwa penetapan kehalalan\n6. BPJPH menerbitkan Sertifikat Halal\n\nJHC HalalFlow membantu Anda mempersiapkan semua dokumen sebelum pengajuan ke BPJPH.'
    },
    // === PENYELIA HALAL ===
    {
      keys: ['penyelia halal', 'penyelia', 'sk penyelia', 'sertifikat penyelia'],
      answer: 'Penyelia Halal adalah orang yang bertanggung jawab atas penerapan SJPH di perusahaan.\n\nSyarat Penyelia Halal:\n✅ Beragama Islam\n✅ Memiliki wawasan luas seputar kehalalan produk\n✅ Sudah mengikuti pelatihan/sertifikasi Penyelia Halal\n✅ Mendapatkan SK (Surat Keputusan) penunjukan dari pimpinan perusahaan\n\nDokumen yang perlu diupload:\n📄 SK Penyelia Halal (dari pimpinan perusahaan)\n📄 Sertifikat Pelatihan Penyelia Halal\n\nUpload di Tahap 2: Dokumen Legal di JHC HalalFlow.'
    },
    // === BAHAN HALAL / MATRIX ===
    {
      keys: ['bahan halal', 'matrix bahan', 'bahan baku', 'daftar bahan', 'nomor sertifikat bahan', 'id halal bahan'],
      answer: 'Matrix Bahan Halal adalah daftar seluruh bahan baku yang digunakan dalam proses produksi.\n\nSetiap bahan harus mencantumkan:\n📝 Nama bahan (merk)\n🏭 Jenis bahan (Bahan Baku, Cleaning Agent, Kemasan)\n🏢 Produsen & Supplier\n🌍 Negara asal\n🏛️ Lembaga penerbit sertifikat (misal: BPJPH, MUI)\n🔢 Nomor Sertifikat Halal (format: ID + 17 digit angka)\n📅 Tanggal terbit sertifikat\n\nCara cek nomor sertifikat bahan:\n👉 Kunjungi cekhalal.bpjph.go.id atau bpjph.halal.go.id\n\nAnda bisa upload bahan via Excel (gunakan template yang tersedia) atau input manual satu per satu.'
    },
    // === CEK HALAL ===
    {
      keys: ['cek halal', 'cek sertifikat', 'verifikasi halal', 'cekhalal', 'nomor sertifikat'],
      answer: 'Untuk mengecek keaslian dan status sertifikat halal suatu bahan/produk:\n\n🔍 Website Resmi BPJPH:\n• cekhalal.bpjph.go.id\n• bpjph.halal.go.id\n\nMasukkan nama produk atau nomor sertifikat halal untuk memverifikasi.\n\nFormat Nomor Sertifikat Halal BPJPH:\nID + [Kode Wilayah] + [Kode LPH] + [Nomor Urut] + [Tahun]\nContoh: ID00410000054900720\n\nTip: Pastikan sertifikat masih berlaku (belum melewati tanggal terbit + 4 tahun).'
    },
    // === DOKUMEN LEGAL ===
    {
      keys: ['dokumen legal', 'dokumen apa', 'persyaratan dokumen', 'sk manajemen', 'kebijakan halal', 'permohonan'],
      answer: 'Dokumen Legal yang dibutuhkan untuk sertifikasi halal:\n\n📄 Surat Permohonan Halal — Ditandatangani pimpinan\n📄 SK Manajemen Halal — Surat keputusan penunjukan Tim Manajemen Halal\n📄 SK Penyelia Halal — Surat keputusan penunjukan Penyelia Halal\n📄 Kebijakan Halal Perusahaan — Komitmen tertulis manajemen\n📄 Tanda Tangan Digital Pemilik & Penyelia\n\nSemua dokumen dapat diupload langsung di Tahap 2: Dokumen Legal pada JHC HalalFlow.\n\nJika Anda membutuhkan template dokumen, hubungi Admin JHC melalui WhatsApp: 0851-1702-1977'
    },
    // === BIAYA SERTIFIKASI ===
    {
      keys: ['biaya', 'harga', 'tarif', 'berapa biaya', 'gratis', 'bayar'],
      answer: 'Biaya Sertifikasi Halal bervariasi tergantung jenis dan skala usaha:\n\n💰 Biaya Sertifikasi melalui BPJPH:\n• UMK (Usaha Mikro & Kecil): Dapat mengajukan sertifikasi gratis melalui program fasilitasi pemerintah\n• Usaha Menengah & Besar: Dikenakan biaya sesuai Peraturan BPJPH\n\n💼 Biaya Pendampingan JHC:\nUntuk info biaya pendampingan JHC HalalFlow, silakan hubungi:\n📱 WhatsApp: 0851-1702-1977\n🌐 Website: halalflow.or.id\n\n📌 Catatan: Penggunaan platform JHC HalalFlow untuk mengelola dokumen tersedia untuk klien JHC.'
    },
    // === AUDIT HALAL ===
    {
      keys: ['audit', 'audit internal', 'audit halal', 'pemeriksaan', 'inspeksi'],
      answer: 'Audit Internal Halal adalah evaluasi berkala yang dilakukan perusahaan untuk memastikan penerapan SJPH berjalan dengan baik.\n\nAudit Internal meliputi:\n🔍 Pemeriksaan bahan baku\n🔍 Pemeriksaan proses produksi\n🔍 Pemeriksaan kebersihan & sanitasi\n🔍 Pemeriksaan pembersihan peralatan\n🔍 Pemeriksaan karyawan (khususnya area produksi)\n\nBukti Audit Internal yang harus diupload di JHC HalalFlow:\n📸 Foto kegiatan audit internal\n📋 Absensi peserta audit\n\nUpload di Tahap 6: Upload Evidence (Bukti).\n\nUntuk Audit Eksternal, LPH yang ditunjuk BPJPH akan melakukan pemeriksaan langsung ke lokasi usaha Anda.'
    },
    // === SOSIALISASI HALAL ===
    {
      keys: ['sosialisasi', 'training halal', 'pelatihan halal', 'edukasi halal'],
      answer: 'Sosialisasi/Training Halal adalah kegiatan edukasi kepada seluruh karyawan tentang pentingnya kehalalan produk dan penerapan SJPH.\n\nMateri Sosialisasi Halal:\n📚 Pemahaman dasar kehalalan\n📚 Kebijakan halal perusahaan\n📚 Prosedur produksi halal\n📚 Penanganan bahan non-halal\n📚 Tanggung jawab masing-masing karyawan\n\nBukti yang harus diupload:\n📸 Foto kegiatan sosialisasi/training\n📋 Daftar hadir (absensi) peserta\n\nUpload di Tahap 6: Upload Evidence (Bukti) pada aplikasi JHC HalalFlow.'
    },
    // === PRODUK HALAL ===
    {
      keys: ['produk halal', 'produk yang didaftarkan', 'bom', 'bill of material', 'komposisi produk'],
      answer: 'Di JHC HalalFlow, Anda perlu mendaftarkan:\n\n🍽️ Daftar Produk yang akan disertifikasi:\n• Nama produk yang diklaim halal\n• Komposisi/BOM (Bill of Material) — daftar bahan pembentuk produk\n\nCara Input Produk:\n1. Buka Tahap 4: Upload Produk & BOM\n2. Klik "+ Tambah Produk" atau upload via Excel\n3. Untuk setiap produk, tambahkan bahan-bahan pembentuknya dari Matrix Bahan\n4. Klik Submit setelah semua produk selesai\n\n📌 Penting: Pastikan semua bahan yang digunakan dalam produk sudah terdaftar di Matrix Bahan Halal terlebih dahulu.'
    },
    // === STATUS PROGRESS ===
    {
      keys: ['status', 'progress', 'sudah sampai mana', 'tahap berapa', 'proses berjalan'],
      answer: 'Anda dapat memantau status pengajuan sertifikasi halal di Dashboard JHC HalalFlow.\n\nTahapan Status Pengajuan:\n1️⃣ Menunggu Pengajuan — Belum/sedang mempersiapkan dokumen\n2️⃣ Diterima Admin — Admin JHC sedang memeriksa\n3️⃣ Diproses — Dokumen sedang dipersiapkan untuk BPJPH\n4️⃣ Disubmit di SIHALAL — Sudah diajukan ke sistem BPJPH\n5️⃣ Feedback BPJPH/LPH — Menunggu/menindaklanjuti feedback\n6️⃣ Penjadwalan Audit — LPH menjadwalkan audit\n7️⃣ Perbaikan Hasil Audit — Perlu perbaikan dokumen\n8️⃣ Sidang Fatwa MUI — Proses penetapan kehalalan\n9️⃣ Sertifikat Terbit! 🎉 — Sertifikat Halal resmi terbit\n\nJika ada pertanyaan tentang status, hubungi Admin JHC: 0851-1702-1977'
    },
    // === MASA BERLAKU SERTIFIKAT ===
    {
      keys: ['masa berlaku', 'berlaku berapa lama', 'expire', 'expired', 'perpanjang', 'renewal'],
      answer: 'Masa Berlaku Sertifikat Halal BPJPH:\n\n⏰ Sertifikat Halal berlaku selama 4 (empat) tahun sejak tanggal diterbitkan.\n\nPerbaruan/Perpanjangan Sertifikat:\n• Pengajuan perpanjangan dapat dilakukan H-6 bulan sebelum habis masa berlaku\n• Proses perpanjangan serupa dengan pengajuan baru\n• Pelaku usaha wajib memastikan tidak ada perubahan bahan/proses yang mempengaruhi kehalalan\n\n📌 JHC HalalFlow akan membantu proses perpanjangan sertifikat Anda. Hubungi Admin JHC untuk info lebih lanjut.'
    },
    // === KONTAK JHC ===
    {
      keys: ['kontak', 'hubungi', 'whatsapp', 'admin jhc', 'bantuan', 'konsultasi', 'telepon'],
      answer: '📞 Hubungi JHC HalalFlow:\n\n💬 WhatsApp Admin JHC:\n0851-1702-1977\n(Senin-Jumat, 08.00-17.00 WIB)\n\n🌐 Website Resmi:\nhalalflow.or.id\n\n📧 Email:\njhc.halalflow@gmail.com\n\nKami siap membantu Anda dalam proses sertifikasi halal! Jangan ragu untuk menghubungi kami jika ada pertanyaan atau kendala dalam penggunaan aplikasi JHC HalalFlow.'
    },
    // === CARA UPLOAD ===
    {
      keys: ['cara upload', 'upload file', 'upload dokumen', 'upload foto', 'cara input', 'cara tambah'],
      answer: 'Cara Upload Dokumen/File di JHC HalalFlow:\n\n📄 Upload Dokumen Legal (Tahap 2):\n• Klik area upload pada kolom dokumen yang sesuai\n• Pilih file dari komputer (format: PDF, JPG, PNG)\n• File akan tersimpan otomatis\n\n📊 Upload Bahan Halal via Excel (Tahap 3):\n• Unduh template Excel yang tersedia\n• Isi data bahan sesuai format kolom\n• Klik "Upload Excel" dan pilih file\n\n📸 Upload Foto Evidence (Tahap 6):\n• Klik area upload foto\n• Pilih satu atau lebih foto (JPG, PNG)\n• Foto tersimpan otomatis\n\n💡 Tips: Pastikan ukuran file tidak melebihi 20MB per file.'
    },
    // === USAHA MIKRO KECIL ===
    {
      keys: ['umk', 'usaha mikro', 'usaha kecil', 'ukm', 'umkm', 'self declare'],
      answer: 'Sertifikasi Halal untuk UMK (Usaha Mikro & Kecil):\n\n✅ Program Sertifikasi Halal Gratis (SEHATI) untuk UMK:\n• Didanai oleh pemerintah melalui Kemenag\n• Dapat diajukan melalui BPJPH\n• Prosesnya lebih sederhana (pernyataan mandiri/self-declare)\n\n📋 Syarat UMK Self-Declare:\n• Usaha berskala mikro/kecil\n• Produk diproduksi sendiri (rumahan)\n• Proses produksi sederhana\n• Tidak menggunakan bahan yang diragukan kehalalannya\n\n🤝 JHC HalalFlow juga membantu UMK dalam proses sertifikasi. Hubungi kami untuk konsultasi: 0851-1702-1977'
    },
    // === PERMOHONAN DITOLAK ===
    {
      keys: ['ditolak', 'tidak diterima', 'revisi', 'perbaikan', 'catatan admin'],
      answer: 'Jika permohonan Anda ditolak atau perlu perbaikan:\n\n⚠️ Penyebab Umum Penolakan:\n• Dokumen tidak lengkap atau tidak sesuai format\n• Bahan baku belum memiliki sertifikat halal\n• Data produk/BOM belum lengkap\n• Foto evidence kurang jelas\n\n📋 Langkah Perbaikan:\n1. Baca catatan dari Admin JHC di Dashboard\n2. Perbaiki dokumen/data yang diminta\n3. Upload ulang dokumen yang sudah diperbaiki\n4. Klik "Ajukan Ulang" di Dashboard\n\n💬 Jika tidak jelas, segera hubungi Admin JHC:\nWhatsApp: 0851-1702-1977'
    },
    // === TENTANG JHC ===
    {
      keys: ['jhc', 'jasa halal consulting', 'tentang jhc', 'siapa jhc', 'konsultan halal'],
      answer: 'JHC (Jasa Halal Consulting) adalah lembaga konsultan halal yang berpengalaman membantu pelaku usaha dalam proses sertifikasi halal BPJPH.\n\n🏢 Layanan JHC:\n✅ Pendampingan lengkap proses sertifikasi halal\n✅ Konsultasi SJPH (Sistem Jaminan Produk Halal)\n✅ Pelatihan Penyelia Halal\n✅ Audit Halal Internal\n✅ Pengelolaan dokumen melalui platform JHC HalalFlow\n\n🌐 Platform Digital: halalflow.or.id\n📱 WhatsApp: 0851-1702-1977\n📧 Email: jhc.halalflow@gmail.com\n\nDengan JHC, proses sertifikasi halal Anda menjadi lebih mudah, cepat, dan terstruktur!'
    },
  ];

  // Find best matching answer
  let reply = null;
  for (const item of KB) {
    if (item.keys.some(k => userText.includes(k))) {
      reply = item.answer;
      break;
    }
  }

  // Greeting handler
  if (!reply && (userText.match(/^(halo|hai|hi|hello|assalam|selamat|pagi|siang|sore|malam|permisi|hei)/) || userText.length < 5)) {
    reply = 'Halo! 😊 Selamat datang di JHC HalalFlow Assistant!\n\nSaya bisa membantu Anda dengan:\n• Cara sertifikasi halal BPJPH\n• Penggunaan aplikasi JHC HalalFlow\n• Dokumen yang dibutuhkan\n• Bahan & produk halal\n• Kontak dan informasi JHC\n\nAda yang ingin Anda tanyakan?';
  }

  // Fallback
  if (!reply) {
    reply = 'Terima kasih atas pertanyaan Anda! 🙏\n\nUntuk pertanyaan spesifik yang belum dapat saya jawab secara otomatis, silakan hubungi Admin JHC langsung:\n\n💬 WhatsApp: 0851-1702-1977\n🌐 Website: halalflow.or.id\n📧 Email: jhc.halalflow@gmail.com\n\nKami siap membantu Anda! Atau coba tanyakan dengan kata kunci seperti: "sertifikasi halal", "dokumen yang dibutuhkan", "cara upload", "status pengajuan", dll.';
  }

  const messages = [
    { sender: 'user', text: req.body.text },
    { sender: 'ai', text: reply }
  ];

  res.json({ messages });
});

// Legacy: Template downloads
const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
app.get('/api/template/bahan', async (req, res) => {
  const f = path.join(frontendPublicDir, 'nama-bahan.xlsx');
  if (!fs.existsSync(f)) return res.status(404).json({ error: 'Template tidak ditemukan' });
  res.setHeader('Content-Type', XLSX_MIME);
  res.setHeader('Content-Disposition', 'attachment; filename="nama-bahan.xlsx"');
  res.sendFile(f);
});
app.get('/api/template/produk', async (req, res) => {
  const f = path.join(frontendPublicDir, 'nama_produk.xlsx');
  if (!fs.existsSync(f)) return res.status(404).json({ error: 'Template tidak ditemukan' });
  res.setHeader('Content-Type', XLSX_MIME);
  res.setHeader('Content-Disposition', 'attachment; filename="nama_produk.xlsx"');
  res.sendFile(f);
});

// =============================================
// API: ADMIN ENDPOINTS
// =============================================

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', adminAuthMiddleware, async (req, res) => {
  const totalCompanies = await db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
  const newThisWeek = await db.prepare(`SELECT COUNT(*) as c FROM companies WHERE created_at >= datetime('now', '-7 days')`).get().c;
  const totalUsers = await db.prepare('SELECT COUNT(*) as c FROM users').get().c;

  const legalPending = await db.prepare(`SELECT COUNT(*) as c FROM legal_documents WHERE status = 'Menunggu Verifikasi'`).get().c;
  const legalVerified = await db.prepare(`SELECT COUNT(*) as c FROM legal_documents WHERE status = 'Terverifikasi'`).get().c;
  const matrixPending = await db.prepare(`SELECT COUNT(*) as c FROM certification_progress WHERE stage = 3 AND status = 'Menunggu Verifikasi'`).get().c;

  // Stage status overview
  const stageStats = await db.prepare(`
    SELECT status, COUNT(*) as count FROM certification_progress GROUP BY status
  `).all();

  // Recent activities
  const recentActivities = await db.prepare(`
    SELECT a.*, c.nama as company_name, u.name as user_name
    FROM activities a
    LEFT JOIN companies c ON a.company_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 10
  `).all();

  res.json({
    stats: { totalCompanies, newThisWeek, totalUsers, legalPending, legalVerified, matrixPending },
    stageStats,
    recentActivities
  });
});

// GET /api/admin/companies
app.get('/api/admin/companies', adminAuthMiddleware, async (req, res) => {
  const { search, status, jenis_usaha, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
    (SELECT COUNT(*) FROM halal_materials WHERE company_id = c.id) as mat_count,
    (SELECT status FROM certification_progress WHERE company_id = c.id AND stage = 2) as legal_status,
    (SELECT status FROM certification_progress WHERE company_id = c.id AND stage = 3) as matrix_status,
    (SELECT COUNT(*) FROM certification_progress WHERE company_id = c.id AND status IN ('Selesai','Terverifikasi')) as completed_stages
    FROM companies c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (c.nama LIKE ? OR c.nib LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (jenis_usaha) { query += ` AND c.jenis_usaha = ?`; params.push(jenis_usaha); }

  const countResult = await db.prepare(query.replace('SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone,\n    (SELECT COUNT(*) FROM halal_materials WHERE company_id = c.id) as mat_count,\n    (SELECT status FROM certification_progress WHERE company_id = c.id AND stage = 2) as legal_status,\n    (SELECT status FROM certification_progress WHERE company_id = c.id AND stage = 3) as matrix_status,\n    (SELECT COUNT(*) FROM certification_progress WHERE company_id = c.id AND status IN (\'Selesai\',\'Terverifikasi\')) as completed_stages', 'SELECT COUNT(*) as total')).get(...params);

  query += ` ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const companies = await db.prepare(query).all(...params);
  companies.forEach(c => { c.progress_percent = Math.round((c.completed_stages / 7) * 100); });

  res.json({
    companies,
    pagination: {
      total: countResult?.total || companies.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((countResult?.total || companies.length) / parseInt(limit))
    }
  });
});

// DELETE /api/admin/companies/:id
app.delete('/api/admin/companies/:id', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id, user_id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  // Delete will cascade to child tables if schema is set up with ON DELETE CASCADE
  // We'll manually delete just in case, since SQLite sometimes needs PRAGMA foreign_keys = ON
  await db.prepare('DELETE FROM halal_materials WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM legal_documents WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM products WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM production_data WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM evidence_data WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM certification_progress WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM activities WHERE company_id=?').run(companyId);
  await db.prepare('DELETE FROM uploaded_files WHERE company_id=?').run(companyId);
  
  await db.prepare('DELETE FROM companies WHERE id=?').run(companyId);
  
  // Clear user's company_id
  await db.prepare('UPDATE users SET company_id=NULL WHERE id=?').run(company.user_id);
  
  await logActivity(db, null, null, 'admin_company_delete', `Admin menghapus data perusahaan (ID: ${companyId})`);
  res.json({ message: 'Perusahaan berhasil dihapus' });
});

// GET /api/admin/companies/:id
app.get('/api/admin/companies/:id', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare(`
    SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.created_at as user_registered_at
    FROM companies c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  const progress = await db.prepare('SELECT * FROM certification_progress WHERE company_id = ? ORDER BY stage').all(companyId);
  const completedStages = progress.filter(s => ['Selesai','Terverifikasi'].includes(s.status)).length;
  company.progress_percent = Math.round((completedStages / 7) * 100);
  company.completed_stages = completedStages;
  company.mat_count = await db.prepare('SELECT COUNT(*) as c FROM halal_materials WHERE company_id=?').get(companyId).c;

  res.json({ company, progress });
});

// Admin: Update Jadwal Audit
app.put('/api/admin/companies/:id/audit-schedule', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { jadwal_audit, auditor_name } = req.body;
  try {
    await db.prepare('UPDATE companies SET jadwal_audit=?, auditor_name=? WHERE id=?').run(jadwal_audit, auditor_name, companyId);
    res.json({ success: true, message: 'Jadwal audit berhasil diperbarui' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/companies/:id/legal-documents
app.get('/api/admin/companies/:id/legal-documents', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  const doc = await db.prepare('SELECT * FROM legal_documents WHERE company_id=?').get(companyId);
  const files = await db.prepare('SELECT * FROM uploaded_files WHERE company_id=? ORDER BY uploaded_at DESC').all(companyId);
  res.json({ legal: doc || {}, files });
});

// GET /api/admin/companies/:id/materials
app.get('/api/admin/companies/:id/materials', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  const { search, halal_status, page = 1, limit = 10000 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = 'SELECT * FROM halal_materials WHERE company_id = ?';
  const params = [companyId];
  if (search) { query += ' AND nama_bahan LIKE ?'; params.push(`%${search}%`); }
  if (halal_status) { query += ' AND halal_status = ?'; params.push(halal_status); }
  query += ' ORDER BY id LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const rawMaterials = await db.prepare(query).all(...params);
  // Add sertifikat alias so frontend can read both m.nomor_sertifikat and m.sertifikat
  const materials = rawMaterials.map(m => ({ ...m, sertifikat: m.nomor_sertifikat }));
  const total = await db.prepare('SELECT COUNT(*) as c FROM halal_materials WHERE company_id=?').get(companyId).c;
  const progress = await db.prepare('SELECT status FROM certification_progress WHERE company_id=? AND stage=3').get(companyId);

  res.json({ materials, total, matrixStatus: progress?.status || 'Belum Dimulai' });
});

// GET /api/admin/companies/:id/activities
app.get('/api/admin/companies/:id/activities', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const activities = await db.prepare(`
    SELECT a.*, u.name as user_name FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.company_id = ? ORDER BY a.created_at DESC LIMIT 50
  `).all(companyId);
  res.json({ activities });
});

// GET /api/admin/companies/:id/progress
app.get('/api/admin/companies/:id/progress', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const progress = await db.prepare('SELECT * FROM certification_progress WHERE company_id=? ORDER BY stage').all(companyId);
  const completedStages = progress.filter(s => ['Selesai','Terverifikasi'].includes(s.status)).length;
  res.json({ progress, completedStages, totalPercent: Math.round((completedStages / 7) * 100) });
});

// PATCH /api/admin/companies/:id/stage-status — Admin update status per stage
app.patch('/api/admin/companies/:id/stage-status', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { stage, status, notes } = req.body;
  const VALID_STATUSES = ['Belum Dimulai','Dalam Proses','Menunggu Verifikasi','Terverifikasi','Perlu Perbaikan','Selesai'];

  if (!stage || !status) return res.status(400).json({ error: 'Stage dan status wajib diisi' });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });

  const company = await db.prepare('SELECT * FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  await db.prepare(`
    UPDATE certification_progress SET status=?, notes=?, updated_by='admin', updated_at=datetime('now')
    WHERE company_id=? AND stage=?
  `).run(status, notes || '', companyId, stage);

  await logActivity(db, companyId, null, 'admin_status_update', `Admin mengubah status Tahap ${stage} menjadi: ${status}`);

  const progress = await db.prepare('SELECT * FROM certification_progress WHERE company_id=? ORDER BY stage').all(companyId);
  res.json({ message: 'Status berhasil diperbarui', progress });
});

// PATCH /api/admin/companies/:id/certification-status
app.patch('/api/admin/companies/:id/certification-status', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { status } = req.body;
  if (typeof status !== 'number') return res.status(400).json({ error: 'Status tidak valid' });

  await db.prepare('UPDATE companies SET certification_status=?, updated_at=datetime(\'now\') WHERE id=?').run(status, companyId);
  await logActivity(db, companyId, null, 'admin_cert_update', `Admin mengubah status sertifikasi BPJPH ke tahap ${status}`);

  // --- Kirim notifikasi email ke user perusahaan ---
  const STAGE_LABELS = {
    1: 'Diterima oleh Admin',
    2: 'Sedang Diproses',
    3: 'Disubmit di SIHALAL',
    4: 'Feedback BPJPH / Dikirim ke LPH',
    5: 'Penjadwalan Audit',
    6: 'Perbaikan Hasil Audit',
    7: 'Sidang Fatwa MUI',
    8: 'Terbit Sertifikat Halal BPJPH',
    9: 'Sertifikasi Halal Selesai / Lulus',
  };

  const STAGE_MESSAGES = {
    1: 'Pengajuan sertifikasi halal Anda telah <strong>diterima dan diverifikasi oleh Admin JHC</strong>. Proses selanjutnya segera dimulai.',
    2: 'Dokumen dan pengajuan Anda sedang <strong>dalam proses review</strong> oleh tim JHC. Kami akan segera memberi kabar lebih lanjut.',
    3: 'Pengajuan Anda telah <strong>disubmit ke sistem SIHALAL BPJPH</strong>. Nomor registrasi akan diinformasikan segera.',
    4: 'Pengajuan Anda sedang mendapat <strong>feedback dari BPJPH</strong> dan diteruskan ke Lembaga Pemeriksa Halal (LPH).',
    5: 'Tim auditor LPH akan segera menghubungi Anda untuk <strong>menjadwalkan sesi audit</strong> di lokasi produksi.',
    6: 'Terdapat <strong>perbaikan yang diperlukan</strong> berdasarkan hasil audit. Harap segera tindak lanjuti dan upload dokumen perbaikan.',
    7: 'Berkas Anda sedang dibahas dalam <strong>Sidang Fatwa MUI</strong> untuk penetapan kehalalan produk.',
    8: '🎉 Selamat! <strong>Sertifikat Halal BPJPH Anda telah terbit!</strong> Silakan login ke sistem JHC HalalFlow untuk mengakses sertifikat.',
    9: '🏆 Selamat! Proses sertifikasi halal Anda telah <strong>selesai dan lulus</strong>. Terima kasih telah mempercayakan proses ini kepada JHC.',
  };

  try {
    const company = await db.prepare('SELECT c.*, u.email, u.name FROM companies c LEFT JOIN users u ON c.user_id = u.id WHERE c.id=?').get(companyId);
    if (company && company.email && process.env.SMTP_USER) {
      const stageLabel = STAGE_LABELS[status] || `Tahap ${status}`;
      const stageMessage = STAGE_MESSAGES[status] || `Status pengajuan Anda telah diperbarui ke <strong>${stageLabel}</strong>.`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${process.env.SMTP_USER}>`,
        to: company.email,
        subject: `🔔 Update Status Sertifikasi Halal - ${stageLabel}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">JHC HalalFlow</h2>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Sistem Manajemen Sertifikasi Halal</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <p style="color: #1e293b; font-size: 15px; margin: 0 0 12px 0;">Halo, <strong>${company.name || 'Pengguna'}</strong>,</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 20px 0;">
                Kami ingin memberitahukan bahwa terdapat <strong>pembaruan status pengajuan sertifikasi halal</strong> untuk perusahaan <strong>${company.nama || '-'}</strong>.
              </p>
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px solid #059669; padding: 20px; border-radius: 12px; margin: 0 0 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase;">Status Terbaru</p>
                <p style="margin: 0; font-size: 18px; font-weight: 800; color: #047857;">Tahap ${status}: ${stageLabel}</p>
              </div>
              <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 20px 0;">${stageMessage}</p>
              <a href="http://localhost:5173" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px;">Lihat Detail di Dashboard →</a>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                Email ini dikirim secara otomatis oleh sistem JHC HalalFlow. Jika ada pertanyaan, hubungi Admin: <a href="https://wa.me/6285117021977" style="color: #059669;">0851-1702-1977</a>
              </p>
            </div>
          </div>
        `
      });
      console.log(`[EMAIL] Notifikasi status tahap ${status} dikirim ke: ${company.email}`);
    }
  } catch (emailErr) {
    console.error('[EMAIL] Gagal kirim notifikasi status:', emailErr.message);
    // Jangan stop response hanya karena email gagal
  }

  res.json({ message: 'Status sertifikasi diperbarui', certification_status: status });
});

// =============================================
// ADMIN: APPLICATIONS & APPROVAL ROUTES
// =============================================

// GET /api/admin/applications — List all applications with status
app.get('/api/admin/applications', adminAuthMiddleware, async (req, res) => {
  try {
    const applications = await db.prepare(`
      SELECT 
        c.id, c.user_id, c.nama, c.nib, c.npwp, c.penanggung_jawab, c.jenis_usaha, c.skala_usaha,
        c.permohonan_status, c.permohonan_catatan, c.certification_status,
        c.nomor_sertifikat, c.tgl_terbit_sertifikat, c.file_sertifikat,
        c.created_at, c.updated_at,
        u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY 
        CASE 
          WHEN c.permohonan_status = 'menunggu' THEN 0 
          WHEN c.permohonan_status = 'ditolak' THEN 1
          WHEN c.permohonan_status = 'disetujui' THEN 2
          ELSE 3 
        END,
        c.updated_at DESC
    `).all();

    const stats = {
      total: applications.length,
      menunggu: applications.filter(a => a.permohonan_status === 'menunggu').length,
      disetujui: applications.filter(a => a.permohonan_status === 'disetujui').length,
      ditolak: applications.filter(a => a.permohonan_status === 'ditolak').length,
    };

    res.json({ applications, stats });
  } catch (err) {
    console.error('Error fetching admin applications:', err);
    res.status(500).json({ error: 'Gagal mengambil data permohonan' });
  }
});

// POST /api/admin/applications/:id/approve — Admin approves application
app.post('/api/admin/applications/:id/approve', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT c.*, u.email, u.name FROM companies c LEFT JOIN users u ON c.user_id = u.id WHERE c.id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  const nextCertStatus = company.certification_status > 0 ? company.certification_status : 1;

  await db.prepare(`
    UPDATE companies 
    SET permohonan_status='disetujui', permohonan_catatan='', certification_status=?, updated_at=datetime('now')
    WHERE id=?
  `).run(nextCertStatus, companyId);

  await db.prepare(`
    UPDATE certification_progress 
    SET status='Terverifikasi', updated_by='admin', updated_at=datetime('now')
    WHERE company_id=? AND stage=7
  `).run(companyId);

  await logActivity(db, companyId, null, 'admin_permohonan_approved', 'Admin menyetujui permohonan sertifikasi halal');

  // Send email notification if configured
  if (company.email && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${process.env.SMTP_USER}>`,
        to: company.email,
        subject: `✅ Permohonan Sertifikasi Halal Disetujui - ${company.nama || 'JHC HalalFlow'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
            <h2 style="color: #059669; margin-top: 0;">Permohonan Anda Disetujui!</h2>
            <p>Halo <strong>${company.name || 'Pelaku Usaha'}</strong>,</p>
            <p>Kabar baik! Permohonan sertifikasi halal untuk <strong>${company.nama || 'perusahaan Anda'}</strong> telah diverifikasi dan <strong>disetujui</strong> oleh Admin JHC HalalFlow.</p>
            <p>Proses sertifikasi saat ini telah aktif pada <strong>Tahap 1 (Diterima oleh Admin)</strong>. Anda dapat memantau perkembangannya langsung di dashboard.</p>
            <a href="http://localhost:5173" style="display:inline-block; padding:12px 24px; background:#059669; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold; margin-top:10px;">Buka Dashboard →</a>
          </div>
        `
      });
    } catch (e) {
      console.error('[EMAIL] Gagal kirim email approve:', e.message);
    }
  }

  res.json({ message: 'Permohonan berhasil disetujui', permohonan_status: 'disetujui', certification_status: nextCertStatus });
});

// POST /api/admin/applications/:id/reject — Admin rejects application with reason
app.post('/api/admin/applications/:id/reject', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const notes = (req.body.notes || req.body.reason || '').trim();
  if (!notes) {
    return res.status(400).json({ error: 'Penjelasan/alasan penolakan wajib diisi' });
  }

  const company = await db.prepare('SELECT c.*, u.email, u.name FROM companies c LEFT JOIN users u ON c.user_id = u.id WHERE c.id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  await db.prepare(`
    UPDATE companies 
    SET permohonan_status='ditolak', permohonan_catatan=?, updated_at=datetime('now')
    WHERE id=?
  `).run(notes, companyId);

  await db.prepare(`
    UPDATE certification_progress 
    SET status='Perlu Perbaikan', notes=?, updated_by='admin', updated_at=datetime('now')
    WHERE company_id=? AND stage=7
  `).run(notes, companyId);

  await logActivity(db, companyId, null, 'admin_permohonan_rejected', `Admin menolak permohonan: ${notes}`);

  // Send email notification if configured
  if (company.email && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${process.env.SMTP_USER}>`,
        to: company.email,
        subject: `⚠️ Perbaikan Berkas Permohonan Sertifikasi Halal - ${company.nama || 'JHC HalalFlow'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1.5px solid #fca5a5; border-radius: 16px; background: #fffaf0;">
            <h2 style="color: #dc2626; margin-top: 0;">Permohonan Memerlukan Perbaikan</h2>
            <p>Halo <strong>${company.name || 'Pelaku Usaha'}</strong>,</p>
            <p>Admin JHC telah meninjau pengajuan berkas permohonan sertifikasi halal Anda dan memberikan catatan perbaikan berikut:</p>
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 14px 16px; margin: 16px 0; border-radius: 8px; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
              <strong>Catatan Admin:</strong><br/>
              ${notes}
            </div>
            <p>Silakan login ke akun JHC HalalFlow Anda untuk memperbaiki data dan mengajukan ulang.</p>
            <a href="http://localhost:5173" style="display:inline-block; padding:12px 24px; background:#ef4444; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold; margin-top:10px;">Lihat & Perbaiki Dokumen →</a>
          </div>
        `
      });
    } catch (e) {
      console.error('[EMAIL] Gagal kirim email reject:', e.message);
    }
  }

  res.json({ message: 'Permohonan ditolak dan catatan telah dikirim ke user', permohonan_status: 'ditolak', notes });
});

// Helper for issuing certificate
const issueCertificateHandler = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT c.*, u.email, u.name FROM companies c LEFT JOIN users u ON c.user_id = u.id WHERE c.id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  const nomorSertifikat = (req.body.nomorSertifikat || req.body.nomor_sertifikat || company.nomor_sertifikat || `ID3211000894109${new Date().getFullYear()}`).trim();
  const tglTerbit = (req.body.tglTerbit || req.body.tgl_terbit_sertifikat || company.tgl_terbit_sertifikat || new Date().toISOString().split('T')[0]).trim();
  
  let fileName = company.file_sertifikat || '';
  const uploadedFile = req.file || (req.files && req.files[0]);
  if (uploadedFile) {
    fileName = uploadedFile.filename;
  }

  await db.prepare(`
    UPDATE companies 
    SET nomor_sertifikat=?, tgl_terbit_sertifikat=?, file_sertifikat=?, certification_status=8, permohonan_status='disetujui', updated_at=datetime('now')
    WHERE id=?
  `).run(nomorSertifikat, tglTerbit, fileName, companyId);

  await db.prepare(`
    UPDATE certification_progress 
    SET status='Selesai', updated_by='admin', updated_at=datetime('now')
    WHERE company_id=? AND stage=7
  `).run(companyId);

  await logActivity(db, companyId, null, 'admin_issued_certificate', `Admin menerbitkan sertifikat halal (No: ${nomorSertifikat})`);

  res.json({
    message: 'Sertifikat halal berhasil diterbitkan',
    nomorSertifikat,
    nomor_sertifikat: nomorSertifikat,
    tglTerbit,
    tgl_terbit_sertifikat: tglTerbit,
    file_sertifikat: fileName,
    certification_status: 8
  });
};

// POST /api/admin/companies/:id/certificate & POST /api/admin/applications/:id/certificate
app.post('/api/admin/companies/:id/certificate', adminAuthMiddleware, upload.any(), issueCertificateHandler);
app.post('/api/admin/applications/:id/certificate', adminAuthMiddleware, upload.any(), issueCertificateHandler);

// GET /api/admin/companies/:id/certificate — Admin Preview Certificate
const getAdminCertificateHandler = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id, nama, nib, certification_status, nomor_sertifikat, tgl_terbit_sertifikat, file_sertifikat FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });

  if (req.query.file === '1' && company.file_sertifikat) {
    return res.redirect(`/uploads/${company.file_sertifikat}`);
  }

  const nomorSertifikat = company.nomor_sertifikat || `ID3211000894109${new Date().getFullYear()}`;
  const tglTerbit = company.tgl_terbit_sertifikat || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Halal (Preview) - ${company.nama || 'Perusahaan'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html {
            background-color: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 24px;
        }
        .certificate-wrapper {
            background: #ffffff;
            padding: 24px;
            box-shadow: 0 25px 60px -15px rgba(0,0,0,0.5);
            border-radius: 20px;
            max-width: 900px;
            width: 100%;
        }
        .certificate {
            width: 100%;
            min-height: 600px;
            padding: 48px 40px;
            position: relative;
            background: #ffffff radial-gradient(#10b981 0.75px, transparent 0.75px);
            background-size: 24px 24px;
            border: 8px double #059669;
            border-radius: 12px;
            box-sizing: border-box;
            text-align: center;
            color: #1e293b;
        }
        .cert-header { margin-bottom: 24px; }
        .logo-title {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            color: #065f46;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 900;
        }
        .main-title {
            font-family: 'Cinzel', serif;
            font-size: 38px;
            color: #047857;
            margin: 12px 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-weight: 700;
        }
        .sub-title {
            font-size: 13px;
            color: #64748b;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .cert-number {
            display: inline-block;
            margin-top: 14px;
            padding: 6px 18px;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            color: #065f46;
            letter-spacing: 1px;
        }
        .content { margin: 28px 0; }
        .presented-to { font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 10px; }
        .company-name {
            font-family: 'Cinzel', serif;
            font-size: 34px;
            color: #0f172a;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
            display: inline-block;
            padding-bottom: 6px;
            margin-bottom: 16px;
        }
        .company-nib { font-size: 12px; color: #64748b; margin-bottom: 14px; }
        .description {
            font-size: 14px;
            color: #334155;
            line-height: 1.7;
            max-width: 680px;
            margin: 0 auto;
        }
        .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 20px;
        }
        .sig-block { text-align: center; min-width: 180px; }
        .sig-val {
            font-weight: 700;
            font-size: 14px;
            color: #0f172a;
            border-bottom: 1.5px solid #94a3b8;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }
        .sig-lbl {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .halal-badge {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #059669, #10b981);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.5);
            border: 4px solid #ffffff;
            outline: 2px dashed #059669;
        }
        .halal-badge .text {
            font-family: 'Cinzel', serif;
            font-weight: 900;
            font-size: 14px;
            letter-spacing: 1px;
        }
        .actions-bar {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 12px;
        }
        .btn-print {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-print:hover { background: #047857; }
        @media print {
            body, html { background: white; padding: 0; }
            .certificate-wrapper { box-shadow: none; padding: 0; }
            .actions-bar { display: none; }
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <div class="cert-header">
                <div class="logo-title">JHC HalalFlow • BPJPH</div>
                <h1 class="main-title">Sertifikat Halal</h1>
                <div class="sub-title">Sistem Jaminan Produk Halal (SJPH)</div>
                <div class="cert-number">Nomor Sertifikat: ${nomorSertifikat}</div>
            </div>

            <div class="content">
                <div class="presented-to">Diberikan secara resmi kepada:</div>
                <div class="company-name">${company.nama || 'Nama Perusahaan'}</div>
                ${company.nib ? `<div class="company-nib">Nomor Induk Berusaha (NIB): <strong>${company.nib}</strong></div>` : ''}
                <div class="description">
                    Telah memenuhi seluruh kriteria dan standar penerapan <strong>Sistem Jaminan Produk Halal (SJPH)</strong> sesuai dengan ketentuan Badan Penyelenggara Jaminan Produk Halal (BPJPH) dan Majelis Ulama Indonesia (MUI).
                </div>
            </div>

            <div class="footer">
                <div class="sig-block">
                    <div class="sig-val">${tglTerbit}</div>
                    <div class="sig-lbl">Tanggal Terbit</div>
                </div>

                <div class="halal-badge">
                    <span class="text">HALAL</span>
                    <span style="font-size: 9px; opacity: 0.9;">INDONESIA</span>
                </div>

                <div class="sig-block">
                    <div class="sig-val">Admin & Komite Halal JHC</div>
                    <div class="sig-lbl">Otorisasi Resmi</div>
                </div>
            </div>
        </div>

        <div class="actions-bar">
            <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
            ${company.file_sertifikat ? `<a href="/uploads/${company.file_sertifikat}" target="_blank" class="btn-print" style="background:#0284c7; text-decoration:none;">📄 Unduh Berkas Asli (PDF/Gambar)</a>` : ''}
        </div>
    </div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
};

app.get('/api/admin/companies/:id/certificate', adminAuthMiddleware, getAdminCertificateHandler);
app.get('/api/admin/applications/:id/certificate', adminAuthMiddleware, getAdminCertificateHandler);

// Legacy: POST /api/certification-status (for backward compat with old admin)
app.post('/api/certification-status', adminAuthMiddleware, async (req, res) => {
  const { status, userEmail } = req.body;
  if (typeof status !== 'number') return res.status(400).json({ error: 'Status tidak valid' });
  const user = await db.prepare('SELECT id FROM users WHERE email=?').get(userEmail);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  const company = await db.prepare('SELECT id FROM companies WHERE user_id=?').get(user.id);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  await db.prepare('UPDATE companies SET certification_status=? WHERE id=?').run(status, company.id);
  res.json({ certificationStatus: status });
});

// GET /api/admin/activities (global)
app.get('/api/admin/activities', adminAuthMiddleware, async (req, res) => {
  const activities = await db.prepare(`
    SELECT a.*, c.nama as company_name, u.name as user_name
    FROM activities a
    LEFT JOIN companies c ON a.company_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 50
  `).all();
  res.json({ activities });
});

// GET /api/admin/companies/:id/products — produk & BOM per perusahaan
app.get('/api/admin/companies/:id/products', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  try {
    const rows = await db.prepare('SELECT * FROM products WHERE company_id=? ORDER BY id').all(companyId);
    const products = rows.map(r => ({ ...r, bahan: JSON.parse(r.bahan || '[]') }));
    const stage = await db.prepare('SELECT status FROM certification_progress WHERE company_id=? AND stage=4').get(companyId);
    res.json({ products, stageStatus: stage?.status || 'Belum Dimulai' });
  } catch(e) {
    res.json({ products: [], stageStatus: 'Belum Dimulai' });
  }
});

// GET /api/admin/companies/:id/production — proses produksi halal
app.get('/api/admin/companies/:id/production', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  try {
    const row = await db.prepare('SELECT * FROM production_data WHERE company_id=?').get(companyId);
    const stage = await db.prepare('SELECT status FROM certification_progress WHERE company_id=? AND stage=5').get(companyId);
    res.json({
      production: row ? { alurProses: row.alur_proses, layoutRuang: row.layout_ruang, bebasBabi: row.bebas_babi } : null,
      stageStatus: stage?.status || 'Belum Dimulai'
    });
  } catch(e) {
    res.json({ production: null, stageStatus: 'Belum Dimulai' });
  }
});

// GET /api/admin/companies/:id/evidence — dokumen evidence
app.get('/api/admin/companies/:id/evidence', adminAuthMiddleware, async (req, res) => {
  const companyId = parseInt(req.params.id);
  const company = await db.prepare('SELECT id FROM companies WHERE id=?').get(companyId);
  if (!company) return res.status(404).json({ error: 'Perusahaan tidak ditemukan' });
  try {
    const row = await db.prepare('SELECT * FROM evidence_data WHERE company_id=?').get(companyId);
    const stage = await db.prepare('SELECT status FROM certification_progress WHERE company_id=? AND stage=6').get(companyId);
    res.json({
      evidence: row ? {
        sosialisasiFoto: row.sosialisasiFoto,
        auditInternalFoto: row.auditInternalFoto,
        sosialisasiAbsen: row.sosialisasiAbsen,
        auditInternalAbsen: row.auditInternalAbsen,
        pembelianBahan: row.pembelianBahan,
        penyimpananBahan: row.penyimpananBahan,
        hasilProduksi: row.hasilProduksi,
        distribusiProduk: row.distribusiProduk
      } : null,
      stageStatus: stage?.status || 'Belum Dimulai'
    });
  } catch(e) {
    res.json({ evidence: null, stageStatus: 'Belum Dimulai' });
  }
});


// =============================================
// START SERVER
// =============================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🟢 JHC HalalFlow Backend v2.0 (Supabase / PostgreSQL)`);
    console.log(`   Port: ${PORT}`);
    console.log(`   http://localhost:${PORT}/api/status\n`);
  });
}

module.exports = app;
