require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getDb, initializeDatabase, initCompanyProgress, logActivity } = require('./database');

async function migrate() {
  console.log('🚀 Starting JHC HalalFlow Database Migration...\n');

  // Initialize schema
  const db = initializeDatabase();

  // =============================================
  // SEED: Default Admin User
  // =============================================
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@jhc.or.id';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'JHC_Admin_2026!';
  const adminName = process.env.ADMIN_DEFAULT_NAME || 'JHC Administrator';

  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 12);
    db.prepare(`
      INSERT INTO admin_users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(adminName, adminEmail, hash);
    console.log(`✅ Admin created: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ⚠️  Simpan password ini! Tidak akan ditampilkan lagi.\n`);
  } else {
    console.log(`ℹ️  Admin sudah ada: ${adminEmail}\n`);
  }

  // =============================================
  // MIGRATE: Data dari db.json (jika ada)
  // =============================================
  const dbJsonPath = path.join(__dirname, 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    console.log('📂 Ditemukan db.json, migrating existing data...\n');

    let jsonData;
    try {
      jsonData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
    } catch (err) {
      console.error('❌ Gagal membaca db.json:', err.message);
      jsonData = { users: [] };
    }

    const users = jsonData.users || [];
    console.log(`   Found ${users.length} user(s) in db.json`);

    for (const u of users) {
      if (!u.email) continue;

      // Check if user already migrated
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
      if (existingUser) {
        console.log(`   ⏭️  User already migrated: ${u.email}`);
        continue;
      }

      // Create user with temporary password (user must reset)
      const tempPassword = 'Halalflow2026!';
      const hash = bcrypt.hashSync(tempPassword, 10);

      const insertUser = db.prepare(`
        INSERT INTO users (name, email, phone, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, 'user', ?)
      `);

      const userResult = insertUser.run(
        u.namaLengkap || 'Pengguna JHC',
        u.email,
        u.nomorTelepon || '',
        hash,
        u.registeredAt || new Date().toISOString()
      );

      const userId = userResult.lastInsertRowid;
      console.log(`   ✅ Migrated user: ${u.email} (ID: ${userId})`);
      console.log(`      Temp password: ${tempPassword}`);

      // Create company if data exists
      const cp = u.companyProfile || {};
      if (cp.nama || Object.keys(cp).length > 0) {
        const insertCompany = db.prepare(`
          INSERT INTO companies (user_id, nama, nib, npwp, penanggung_jawab, jenis_usaha, skala_usaha, jumlah_outlet, cabang, alamat)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const compResult = insertCompany.run(
          userId,
          cp.nama || '',
          cp.nib || '',
          cp.npwp || '',
          cp.penanggungJawab || '',
          cp.jenisUsaha || '',
          cp.skalaUsaha || '',
          cp.jumlahOutlet || '',
          cp.cabang || '',
          cp.alamat || ''
        );

        const companyId = compResult.lastInsertRowid;

        // Update user with company_id
        db.prepare('UPDATE users SET company_id = ? WHERE id = ?').run(companyId, userId);

        // Initialize progress stages
        initCompanyProgress(db, companyId);

        console.log(`      ✅ Company created (ID: ${companyId}): ${cp.nama || 'N/A'}`);

        // Migrate legal data
        const ld = u.legalData || {};
        if (Object.keys(ld).length > 0) {
          db.prepare(`
            INSERT OR IGNORE INTO legal_documents (company_id, telp_pemilik, telp_penyelia, email_sihalal, permohonan, sk_penyelia, sk_manajemen, kebijakan, ttd_pemilik, ttd_penyelia)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            companyId,
            ld.telpPemilik || '',
            ld.telpPenyelia || '',
            ld.emailSihalal || '',
            ld.permohonan || '',
            ld.sk_penyelia || '',
            ld.sk_manajemen || '',
            ld.kebijakan || '',
            ld.ttdPemilik || '',
            ld.ttdPenyelia || ''
          );
          console.log(`      ✅ Legal documents migrated`);
        }

        // Migrate materials
        const materials = u.materials || [];
        if (materials.length > 0) {
          const insertMat = db.prepare(`
            INSERT INTO halal_materials (company_id, nama_bahan, jenis, produsen, negara, supplier, lembaga, nomor_sertifikat, expired, halal_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const insertMany = db.transaction((mats) => {
            for (const m of mats) {
              insertMat.run(companyId, m.name || '', m.jenis || '', m.produsen || '', m.negara || '', m.supplier || '', m.lembaga || '', m.sertifikat || '', m.expired || '', m.status || 'hijau');
            }
          });
          insertMany(materials);
          console.log(`      ✅ ${materials.length} material(s) migrated`);
        }

        // Update progress status based on old data
        if (cp.nama) {
          db.prepare(`UPDATE certification_progress SET status = 'Selesai' WHERE company_id = ? AND stage = 1`).run(companyId);
        }
        if (ld.telpPemilik || ld.permohonan) {
          db.prepare(`UPDATE certification_progress SET status = 'Selesai' WHERE company_id = ? AND stage = 2`).run(companyId);
        }
        if (u.matrixSubmitted) {
          db.prepare(`UPDATE certification_progress SET status = 'Menunggu Verifikasi' WHERE company_id = ? AND stage = 3`).run(companyId);
        }

        // Log activity
        logActivity(db, companyId, userId, 'migration', `Data user ${u.email} berhasil dimigrasi dari sistem lama`);
      } else {
        // User has no company, still init
        console.log(`      ℹ️  No company data for this user`);
      }
    }

    // Backup db.json
    const backupPath = path.join(__dirname, 'db.json.backup');
    fs.copyFileSync(dbJsonPath, backupPath);
    console.log(`\n   ✅ db.json backed up to db.json.backup`);
  } else {
    console.log('ℹ️  No db.json found, starting fresh database\n');
  }

  // =============================================
  // SUMMARY
  // =============================================
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const companyCount = db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admin_users').get().c;

  console.log('\n✅ Migration Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`   Admin users:    ${adminCount}`);
  console.log(`   Regular users:  ${userCount}`);
  console.log(`   Companies:      ${companyCount}`);
  console.log('═══════════════════════════════════════');
  console.log(`\n🔑 Admin Login:`);
  console.log(`   Email:    ${process.env.ADMIN_DEFAULT_EMAIL || 'admin@jhc.or.id'}`);
  console.log(`   Password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'JHC_Admin_2026!'}`);
  if (userCount > 0) {
    console.log(`\n👤 User Login (migrated):`);
    console.log(`   Email:    (email lama)`);
    console.log(`   Password: Halalflow2026!`);
  }
  console.log('\n🚀 Run backend: npm start\n');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
