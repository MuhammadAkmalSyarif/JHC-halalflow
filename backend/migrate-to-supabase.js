/**
 * JHC HalalFlow - SQLite to Supabase PostgreSQL & Storage Migration Tool
 * 
 * Penggunaan:
 * 1. Isi file backend/.env dengan kredensial Supabase:
 *    DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
 *    SUPABASE_URL=https://[ref].supabase.co
 *    SUPABASE_KEY=eyJhbGciOi... (service_role key)
 *    SUPABASE_STORAGE_BUCKET=halalflow-uploads
 * 
 * 2. Jalankan perintah:
 *    node backend/migrate-to-supabase.js
 */

require('dotenv').config();
const Database = require('better-sqlite3');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('====================================================');
  console.log('🌙 JHC HalalFlow - Migrasi Data ke Supabase Cloud');
  console.log('====================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Error: Variabel DATABASE_URL belum diatur di file .env');
    console.error('   Silakan masukkan connection string PostgreSQL dari Supabase terlebih dahulu.');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'halalflow-uploads';

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Storage Client terhubung.');
  } else {
    console.warn('⚠️  SUPABASE_URL atau SUPABASE_KEY belum diisi. Upload file akan dilewati.');
  }

  // 1. Buka SQLite Lokal
  const localDbPath = path.join(__dirname, 'halalflow.db');
  if (!fs.existsSync(localDbPath)) {
    console.error(`❌ File SQLite tidak ditemukan di: ${localDbPath}`);
    process.exit(1);
  }
  const sqlite = new Database(localDbPath);
  console.log(`✅ SQLite lokal terbaca: ${localDbPath}`);

  // 2. Buka Koneksi PostgreSQL Supabase
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Berhasil terhubung ke Supabase PostgreSQL!\n');
    client.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke Supabase PostgreSQL:', err.message);
    process.exit(1);
  }

  try {
    // 3. Migrasi Admin Users
    console.log('📦 [1/10] Memigrasikan admin_users...');
    const adminUsers = sqlite.prepare('SELECT * FROM admin_users').all();
    for (const u of adminUsers) {
      await pool.query(`
        INSERT INTO admin_users (id, name, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
      `, [u.id, u.name, u.email, u.password_hash, u.created_at || new Date(), u.updated_at || new Date()]);
    }
    console.log(`   ✓ ${adminUsers.length} admin berhasil dimigrasi.`);

    // 4. Migrasi Users
    console.log('📦 [2/10] Memigrasikan users...');
    const users = sqlite.prepare('SELECT * FROM users').all();
    for (const u of users) {
      await pool.query(`
        INSERT INTO users (id, name, email, phone, password_hash, role, company_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
      `, [u.id, u.name, u.email, u.phone, u.password_hash, u.role, u.company_id, u.created_at || new Date(), u.updated_at || new Date()]);
    }
    console.log(`   ✓ ${users.length} user berhasil dimigrasi.`);

    // 5. Migrasi Companies
    console.log('📦 [3/10] Memigrasikan companies...');
    const companies = sqlite.prepare('SELECT * FROM companies').all();
    for (const c of companies) {
      await pool.query(`
        INSERT INTO companies (
          id, user_id, nama, nib, npwp, penanggung_jawab, jenis_usaha, skala_usaha,
          jumlah_outlet, cabang, alamat, jadwal_audit, auditor_name, permohonan_status,
          permohonan_catatan, nomor_sertifikat, tgl_terbit_sertifikat, file_sertifikat,
          certification_status, current_stage, overall_status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama, nib = EXCLUDED.nib, updated_at = NOW()
      `, [
        c.id, c.user_id, c.nama, c.nib, c.npwp, c.penanggung_jawab, c.jenis_usaha, c.skala_usaha,
        c.jumlah_outlet, c.cabang, c.alamat, c.jadwal_audit, c.auditor_name, c.permohonan_status || 'belum',
        c.permohonan_catatan || '', c.nomor_sertifikat || '', c.tgl_terbit_sertifikat || '', c.file_sertifikat || '',
        c.certification_status || 0, c.current_stage || 1, c.overall_status || 'Belum Dimulai',
        c.created_at || new Date(), c.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ ${companies.length} perusahaan berhasil dimigrasi.`);

    // 6. Migrasi Legal Documents
    console.log('📦 [4/10] Memigrasikan legal_documents...');
    const legalDocs = sqlite.prepare('SELECT * FROM legal_documents').all();
    for (const l of legalDocs) {
      await pool.query(`
        INSERT INTO legal_documents (
          id, company_id, telp_pemilik, telp_penyelia, email_sihalal, permohonan,
          sk_penyelia, sk_manajemen, kebijakan, ttd_pemilik, ttd_penyelia,
          ktp_pemilik, ktp_penyelia, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (company_id) DO UPDATE SET permohonan = EXCLUDED.permohonan, status = EXCLUDED.status, updated_at = NOW()
      `, [
        l.id, l.company_id, l.telp_pemilik, l.telp_penyelia, l.email_sihalal, l.permohonan,
        l.sk_penyelia, l.sk_manajemen, l.kebijakan, l.ttd_pemilik, l.ttd_penyelia,
        l.ktp_pemilik, l.ktp_penyelia, l.status, l.created_at || new Date(), l.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ ${legalDocs.length} dokumen legal berhasil dimigrasi.`);

    // 7. Migrasi Halal Materials
    console.log('📦 [5/10] Memigrasikan halal_materials...');
    const materials = sqlite.prepare('SELECT * FROM halal_materials').all();
    for (const m of materials) {
      await pool.query(`
        INSERT INTO halal_materials (
          id, company_id, nama_bahan, jenis, produsen, negara, supplier,
          lembaga, nomor_sertifikat, expired, halal_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `, [
        m.id, m.company_id, m.nama_bahan, m.jenis, m.produsen, m.negara, m.supplier,
        m.lembaga, m.nomor_sertifikat, m.expired, m.halal_status, m.created_at || new Date(), m.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ ${materials.length} bahan halal berhasil dimigrasi.`);

    // 8. Migrasi Certification Progress
    console.log('📦 [6/10] Memigrasikan certification_progress...');
    const progress = sqlite.prepare('SELECT * FROM certification_progress').all();
    for (const p of progress) {
      await pool.query(`
        INSERT INTO certification_progress (
          id, company_id, stage, stage_name, status, notes, updated_by, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (company_id, stage) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
      `, [
        p.id, p.company_id, p.stage, p.stage_name, p.status, p.notes, p.updated_by, p.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ ${progress.length} progres tahap sertifikasi berhasil dimigrasi.`);

    // 9. Migrasi Products
    console.log('📦 [7/10] Memigrasikan products...');
    let products = [];
    try {
      products = sqlite.prepare('SELECT * FROM products').all();
      for (const pr of products) {
        let bahanJson = [];
        try { bahanJson = JSON.parse(pr.bahan || '[]'); } catch(e) {}
        await pool.query(`
          INSERT INTO products (id, company_id, name, bahan, submitted, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bahan = EXCLUDED.bahan, submitted = EXCLUDED.submitted
        `, [pr.id, pr.company_id, pr.name, JSON.stringify(bahanJson), pr.submitted || 0, pr.created_at || new Date(), pr.updated_at || new Date()]);
      }
      console.log(`   ✓ ${products.length} produk berhasil dimigrasi.`);
    } catch(err) {
      console.log('   ℹ️  Tabel products kosong atau dilewati.');
    }

    // 10. Migrasi Production Data
    console.log('📦 [8/10] Memigrasikan production_data...');
    try {
      const prodData = sqlite.prepare('SELECT * FROM production_data').all();
      for (const pd of prodData) {
        await pool.query(`
          INSERT INTO production_data (id, company_id, alur_proses, layout_ruang, bebas_babi, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (company_id) DO UPDATE SET alur_proses = EXCLUDED.alur_proses, layout_ruang = EXCLUDED.layout_ruang, bebas_babi = EXCLUDED.bebas_babi
        `, [pd.id, pd.company_id, pd.alur_proses, pd.layout_ruang, pd.bebas_babi, pd.created_at || new Date(), pd.updated_at || new Date()]);
      }
      console.log(`   ✓ ${prodData.length} data produksi berhasil dimigrasi.`);
    } catch(err) {
      console.log('   ℹ️  Tabel production_data kosong atau dilewati.');
    }

    // 11. Migrasi Evidence Data
    console.log('📦 [9/10] Memigrasikan evidence_data...');
    try {
      const evData = sqlite.prepare('SELECT * FROM evidence_data').all();
      for (const ev of evData) {
        await pool.query(`
          INSERT INTO evidence_data (
            id, company_id, sosialisasiFoto, auditInternalFoto, sosialisasiAbsen,
            auditInternalAbsen, pembelianBahan, penyimpananBahan, hasilProduksi,
            distribusiProduk, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (company_id) DO UPDATE SET sosialisasiFoto = EXCLUDED.sosialisasiFoto, updated_at = NOW()
        `, [
          ev.id, ev.company_id, ev.sosialisasiFoto, ev.auditInternalFoto, ev.sosialisasiAbsen,
          ev.auditInternalAbsen, ev.pembelianBahan, ev.penyimpananBahan, ev.hasilProduksi,
          ev.distribusiProduk, ev.created_at || new Date(), ev.updated_at || new Date()
        ]);
      }
      console.log(`   ✓ ${evData.length} evidence data berhasil dimigrasi.`);
    } catch(err) {
      console.log('   ℹ️  Tabel evidence_data kosong atau dilewati.');
    }

    // 12. Upload File Lampiran ke Supabase Storage (Jika Supabase Storage disiapkan)
    console.log('📦 [10/10] Mengunggah file dari folder uploads ke Supabase Storage...');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir) && supabase) {
      const files = fs.readdirSync(uploadsDir);
      let uploadSuccessCount = 0;
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          const fileBuffer = fs.readFileSync(filePath);
          const { error } = await supabase.storage
            .from(bucketName)
            .upload(file, fileBuffer, { upsert: true });

          if (error) {
            console.warn(`   ⚠️  Gagal mengunggah ${file}:`, error.message);
          } else {
            uploadSuccessCount++;
          }
        }
      }
      console.log(`   ✓ ${uploadSuccessCount} file lampiran berhasil diunggah ke Supabase Storage (${bucketName}).`);
    } else {
      console.log('   ℹ️  Uploads diskip (folder tidak ada atau klien Supabase belum aktif).');
    }

    // Reset sequence auto-increment di PostgreSQL
    console.log('\n🔄 Menyesuaikan Sequence ID di PostgreSQL...');
    const tables = ['admin_users', 'users', 'companies', 'legal_documents', 'halal_materials', 'certification_progress', 'products', 'production_data', 'evidence_data'];
    for (const tbl of tables) {
      try {
        await pool.query(`SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE(MAX(id), 1)) FROM ${tbl}`);
      } catch(e) {}
    }

    console.log('\n🎉 ================================================');
    console.log('🎉 SELURUH DATA BERHASIL DIMIGRASIKAN KE SUPABASE!');
    console.log('🎉 ================================================\n');

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat migrasi:', error);
  } finally {
    sqlite.close();
    await pool.end();
  }
}

main();
