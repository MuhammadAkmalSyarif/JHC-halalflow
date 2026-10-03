const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'halalflow.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // =============================================
  // TABLE: admin_users
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // =============================================
  // TABLE: users
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      company_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // =============================================
  // TABLE: companies
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nama TEXT,
      nib TEXT,
      npwp TEXT,
      penanggung_jawab TEXT,
      jenis_usaha TEXT,
      skala_usaha TEXT,
      jumlah_outlet TEXT,
      cabang TEXT,
      alamat TEXT,
      jadwal_audit TEXT,
      auditor_name TEXT,
      certification_status INTEGER DEFAULT 0,
      current_stage INTEGER DEFAULT 1,
      overall_status TEXT DEFAULT 'Belum Dimulai',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migration for companies table: Add jadwal_audit and auditor_name
  try {
    const columnsInfo = db.pragma('table_info(companies)');
    const hasJadwalAudit = columnsInfo.some(c => c.name === 'jadwal_audit');
    if (!hasJadwalAudit) {
      db.exec('ALTER TABLE companies ADD COLUMN jadwal_audit TEXT;');
      db.exec('ALTER TABLE companies ADD COLUMN auditor_name TEXT;');
      console.log('Migrated companies table: added jadwal_audit and auditor_name columns.');
    }
  } catch (e) {
    console.error('Error during companies migration:', e.message);
  }

  // =============================================
  // TABLE: legal_documents
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS legal_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL UNIQUE,
      telp_pemilik TEXT,
      telp_penyelia TEXT,
      email_sihalal TEXT,
      permohonan TEXT,
      sk_penyelia TEXT,
      sk_manajemen TEXT,
      kebijakan TEXT,
      ttd_pemilik TEXT,
      ttd_penyelia TEXT,
      status TEXT DEFAULT 'Belum Dimulai',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // =============================================
  // TABLE: halal_materials
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS halal_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      nama_bahan TEXT NOT NULL,
      jenis TEXT,
      produsen TEXT,
      negara TEXT,
      supplier TEXT,
      lembaga TEXT,
      nomor_sertifikat TEXT,
      expired TEXT,
      halal_status TEXT DEFAULT 'hijau',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // =============================================
  // TABLE: certification_progress (per stage)
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS certification_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      stage INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      status TEXT DEFAULT 'Belum Dimulai',
      notes TEXT,
      updated_by TEXT DEFAULT 'system',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE(company_id, stage)
    )
  `);

  // =============================================
  // TABLE: activities
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      user_id INTEGER,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // =============================================
  // TABLE: uploaded_files
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      user_id INTEGER,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      document_type TEXT,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // =============================================
  // TABLE: password_resets
  // =============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Safe migrations for companies table
  const columns = db.prepare(`PRAGMA table_info(companies)`).all().map(c => c.name);
  if (!columns.includes('permohonan_status')) {
    db.exec(`ALTER TABLE companies ADD COLUMN permohonan_status TEXT DEFAULT 'belum'`);
  }
  if (!columns.includes('permohonan_catatan')) {
    db.exec(`ALTER TABLE companies ADD COLUMN permohonan_catatan TEXT DEFAULT ''`);
  }
  if (!columns.includes('nomor_sertifikat')) {
    db.exec(`ALTER TABLE companies ADD COLUMN nomor_sertifikat TEXT DEFAULT ''`);
  }
  if (!columns.includes('tgl_terbit_sertifikat')) {
    db.exec(`ALTER TABLE companies ADD COLUMN tgl_terbit_sertifikat TEXT DEFAULT ''`);
  }
  if (!columns.includes('file_sertifikat')) {
    db.exec(`ALTER TABLE companies ADD COLUMN file_sertifikat TEXT DEFAULT ''`);
  }

  // =============================================
  // SEED ADMIN (Upsert on every startup for Render Free Tier)
  // =============================================
  const adminEmail = 'jhc.halalflow@gmail.com';
  const adminPassword = 'JHC_Admin123';
  const adminName = 'JHC Administrator';
  const adminHash = bcrypt.hashSync(adminPassword, 12);

  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO admin_users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(adminName, adminEmail, adminHash);
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    // Always update password hash on startup to ensure credentials are correct
    db.prepare(`
      UPDATE admin_users SET password_hash = ?, name = ?, updated_at = datetime('now')
      WHERE email = ?
    `).run(adminHash, adminName, adminEmail);
    console.log(`🔄 Admin credentials refreshed: ${adminEmail}`);
  }

  console.log('✅ Database schema initialized successfully');
  return db;
}

// Helper: Initialize certification progress stages for a company
function initCompanyProgress(db, companyId) {
  const STAGES = [
    { stage: 1, name: 'Registrasi Perusahaan' },
    { stage: 2, name: 'Dokumen Legal' },
    { stage: 3, name: 'Matrix Bahan Halal' },
    { stage: 4, name: 'Upload Produk & BOM' },
    { stage: 5, name: 'Proses Produksi Halal' },
    { stage: 6, name: 'Upload Evidence' },
    { stage: 7, name: 'Pengajuan BPJPH' },
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO certification_progress (company_id, stage, stage_name, status)
    VALUES (?, ?, ?, 'Belum Dimulai')
  `);

  const insertMany = db.transaction((stages) => {
    for (const s of stages) {
      insert.run(companyId, s.stage, s.name);
    }
  });

  insertMany(STAGES);
}

// Helper: Log activity
function logActivity(db, companyId, userId, activityType, description) {
  try {
    db.prepare(`
      INSERT INTO activities (company_id, user_id, activity_type, description)
      VALUES (?, ?, ?, ?)
    `).run(companyId, userId, activityType, description);
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = {
  getDb,
  initializeDatabase,
  initCompanyProgress,
  logActivity
};
