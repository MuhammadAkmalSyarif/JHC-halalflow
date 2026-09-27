const { chromium } = require('playwright');

// ========================================
// CONFIG
// ========================================
const USER_URL = 'http://localhost:5173';
const ADMIN_URL = 'http://localhost:5174';
// Path ke Microsoft Edge yang sudah terinstall di komputer
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const USER_CREDS = { email: 'user@jhc.co.id', password: 'user123' };
const ADMIN_CREDS = { email: 'admin@jhc.co.id', password: 'admin123' };

const SLOWMO = 800; // ms antara setiap aksi

// ========================================
// UTILITIES
// ========================================
function log(msg, status = 'INFO') {
  const icons = { INFO: '🔵', PASS: '✅', FAIL: '❌', WARN: '⚠️', STEP: '▶️' };
  console.log(`${icons[status] || '🔵'} [${status}] ${msg}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeFill(page, selector, value, description) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, value);
    log(`Isi input "${description}" → "${value}"`, 'PASS');
    await wait(600);
  } catch (err) {
    log(`Gagal isi input: ${description} → ${err.message}`, 'FAIL');
  }
}

// ========================================
// FASE 1 - Tampilan Halaman Login
// ========================================
async function testLoginPage(page) {
  log('\n' + '='.repeat(60));
  log('FASE 1: Halaman Login Pengguna', 'STEP');
  log('='.repeat(60));

  await page.goto(USER_URL);
  await wait(3000);
  await page.screenshot({ path: 'screenshots/01_halaman_login.png', fullPage: true });
  log('Screenshot halaman login disimpan', 'INFO');

  const title = await page.title();
  log(`Judul Halaman: "${title}"`, 'INFO');

  const hasMasukTab = await page.locator('button:has-text("Masuk")').count() > 0;
  const hasDaftarTab = await page.locator('button:has-text("Daftar Baru")').count() > 0;
  log(`Tab "Masuk" ada: ${hasMasukTab}`, hasMasukTab ? 'PASS' : 'FAIL');
  log(`Tab "Daftar Baru" ada: ${hasDaftarTab}`, hasDaftarTab ? 'PASS' : 'FAIL');
}

// ========================================
// FASE 2 - Tab Daftar (Register)
// ========================================
async function testRegisterTab(page) {
  log('\n' + '='.repeat(60));
  log('FASE 2: Tab Daftar Baru (Form Register)', 'STEP');
  log('='.repeat(60));

  await wait(1500);
  const registerTab = page.locator('button:has-text("Daftar Baru")').first();
  if (await registerTab.count() > 0) {
    await registerTab.click();
    await wait(2000);
    await page.screenshot({ path: 'screenshots/02_tab_daftar_baru.png', fullPage: true });
    log('Tab Daftar Baru terbuka', 'PASS');

    const hasName = await page.locator('input[name="name"]').count() > 0;
    const hasEmail = await page.locator('input[name="email"]').count() > 0;
    const hasPhone = await page.locator('input[name="phone"]').count() > 0;
    log(`Field Nama Lengkap: ${hasName}`, hasName ? 'PASS' : 'FAIL');
    log(`Field Email: ${hasEmail}`, hasEmail ? 'PASS' : 'FAIL');
    log(`Field No. Telepon: ${hasPhone}`, hasPhone ? 'PASS' : 'FAIL');
  } else {
    log('Tab Daftar Baru tidak ditemukan', 'FAIL');
  }

  // Kembali ke Masuk
  await page.locator('button:has-text("Masuk")').first().click().catch(() => {});
  await wait(1500);
  log('Kembali ke tab Masuk', 'INFO');
}

// ========================================
// FASE 3 - Login Salah (Error Handling)
// ========================================
async function testWrongLogin(page) {
  log('\n' + '='.repeat(60));
  log('FASE 3: Test Login dengan Kredensial SALAH', 'STEP');
  log('='.repeat(60));

  await safeFill(page, 'input[name="email"]', 'salah@email.com', 'Email Salah');
  await safeFill(page, 'input[type="password"]', 'passwordsalah', 'Password Salah');
  await wait(1000);

  await page.screenshot({ path: 'screenshots/03_form_login_salah.png', fullPage: true });
  await page.locator('button[type="submit"]').first().click();
  await wait(3000);

  await page.screenshot({ path: 'screenshots/04_pesan_error_login.png', fullPage: true });
  log('Screenshot pesan error login disimpan', 'INFO');

  const errorEl = page.locator('.text-red-600, .bg-red-50').first();
  const hasError = await errorEl.count() > 0;
  log(`Pesan error muncul: ${hasError}`, hasError ? 'PASS' : 'WARN');
  if (hasError) {
    const errText = await errorEl.textContent();
    log(`Isi pesan error: "${errText.trim()}"`, 'INFO');
  }
}

// ========================================
// FASE 4 - Lupa Password (3 Langkah)
// ========================================
async function testForgotPassword(page) {
  log('\n' + '='.repeat(60));
  log('FASE 4: Alur Lupa Password (3 Langkah)', 'STEP');
  log('='.repeat(60));

  // Kosongkan field email
  await page.locator('input[name="email"]').fill('').catch(() => {});
  await wait(500);

  const forgotBtn = page.locator('button:has-text("Lupa Password?")');
  if (await forgotBtn.count() === 0) {
    // Password field mungkin belum muncul, isi email & password dulu
    await page.locator('input[name="email"]').fill('coba@email.com').catch(() => {});
    await page.locator('input[type="password"]').fill('coba123').catch(() => {});
    await wait(500);
  }

  const forgotLink = page.locator('button:has-text("Lupa Password?")');
  if (await forgotLink.count() > 0) {
    await forgotLink.click();
    await wait(2000);
    await page.screenshot({ path: 'screenshots/05_lupa_password_step1.png', fullPage: true });
    log('STEP 1 - Form email muncul', 'PASS');

    // Isi email
    await safeFill(page, 'input[name="email"]', 'test@example.com', 'Email untuk reset');
    await wait(800);
    await page.locator('button[type="submit"]').first().click();
    await wait(4000);

    await page.screenshot({ path: 'screenshots/06_lupa_password_step2.png', fullPage: true });
    log('STEP 2 - Setelah kirim email reset', 'INFO');

    const otpInput = page.locator('input[name="token"]');
    if (await otpInput.count() > 0) {
      log('STEP 2 - Form OTP muncul', 'PASS');
      const otpVal = await otpInput.inputValue();
      log(`OTP (Mode Dev auto-fill): "${otpVal}"`, otpVal ? 'PASS' : 'WARN');

      if (otpVal) {
        // Verifikasi OTP
        await page.locator('button[type="submit"]').first().click();
        await wait(3500);
        await page.screenshot({ path: 'screenshots/07_lupa_password_step3.png', fullPage: true });
        log('STEP 3 - Setelah verifikasi OTP', 'INFO');

        const hasNewPwd = await page.locator('input[name="password"]').count() > 0;
        log(`STEP 3 - Form password baru muncul: ${hasNewPwd}`, hasNewPwd ? 'PASS' : 'FAIL');
      }
    } else {
      log('Input OTP tidak muncul (email tidak terdaftar di DB)', 'WARN');
    }

    // Kembali ke Login
    const backBtn = page.locator('button:has-text("Kembali ke Login")');
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await wait(2000);
      log('Kembali ke halaman login berhasil', 'PASS');
    }
  } else {
    log('Tombol "Lupa Password?" tidak ditemukan', 'FAIL');
  }
}

// ========================================
// FASE 5 - Login Pengguna Benar
// ========================================
async function testUserLogin(page) {
  log('\n' + '='.repeat(60));
  log('FASE 5: Login Pengguna dengan Kredensial BENAR', 'STEP');
  log('='.repeat(60));

  await wait(1000);
  await safeFill(page, 'input[name="email"]', USER_CREDS.email, 'Email Pengguna');
  await safeFill(page, 'input[type="password"]', USER_CREDS.password, 'Password Pengguna');
  await wait(1500);

  await page.screenshot({ path: 'screenshots/08_form_login_benar.png', fullPage: true });
  await page.locator('button[type="submit"]').first().click();
  await wait(5000);

  await page.screenshot({ path: 'screenshots/09_dashboard_pengguna.png', fullPage: true });
  log('Screenshot dashboard pengguna disimpan', 'INFO');

  const isDashboard = await page.locator('aside').count() > 0;
  log(`Berhasil login ke Dashboard: ${isDashboard}`, isDashboard ? 'PASS' : 'WARN');
  if (!isDashboard) {
    log('Cek kredensial: email & password mungkin belum terdaftar di database', 'WARN');
  }
  return isDashboard;
}

// ========================================
// FASE 6 - Jelajahi Menu Dashboard
// ========================================
async function testUserDashboard(page) {
  log('\n' + '='.repeat(60));
  log('FASE 6: Jelajahi Semua Menu Dashboard Pengguna', 'STEP');
  log('='.repeat(60));

  const sidebarCount = await page.locator('aside button').count();
  log(`Total menu di sidebar: ${sidebarCount}`, 'INFO');

  const menus = [
    'Dashboard Utama',
    'Tahap 1',
    'Tahap 2',
    'Tahap 3',
    'Tahap 4',
    'Tahap 5',
    'Tahap 6',
    'Tahap 7',
  ];

  for (let i = 0; i < menus.length; i++) {
    const menuName = menus[i];
    const btn = page.locator(`aside button:has-text("${menuName}")`).first();
    if (await btn.count() > 0) {
      await btn.click();
      await wait(3000);
      const fname = `screenshots/10_${String(i + 1).padStart(2, '0')}_menu_${menuName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await page.screenshot({ path: fname, fullPage: true });
      log(`Menu "${menuName}" → ${fname}`, 'PASS');
    } else {
      log(`Menu "${menuName}" tidak ditemukan`, 'WARN');
    }
  }
}

// ========================================
// FASE 7 - Logout Pengguna
// ========================================
async function testUserLogout(page) {
  log('\n' + '='.repeat(60));
  log('FASE 7: Logout Pengguna', 'STEP');
  log('='.repeat(60));

  const logoutBtn = page.locator('button:has-text("Keluar")').first();
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    await wait(2500);
    await page.screenshot({ path: 'screenshots/11_setelah_logout.png', fullPage: true });
    const backToLogin = await page.locator('button:has-text("Masuk")').count() > 0;
    log(`Logout berhasil, kembali ke Login: ${backToLogin}`, backToLogin ? 'PASS' : 'FAIL');
  } else {
    log('Tombol "Keluar" tidak ditemukan', 'WARN');
  }
}

// ========================================
// FASE 8 - Admin Frontend
// ========================================
async function testAdminFrontend(page) {
  log('\n' + '='.repeat(60));
  log('FASE 8: Admin Frontend (http://localhost:5174)', 'STEP');
  log('='.repeat(60));

  await page.goto(ADMIN_URL);
  await wait(3000);
  await page.screenshot({ path: 'screenshots/12_admin_login.png', fullPage: true });
  log('Halaman Login Admin terbuka', 'INFO');

  await safeFill(page, 'input[type="email"], input[name="email"]', ADMIN_CREDS.email, 'Email Admin');
  await safeFill(page, 'input[type="password"]', ADMIN_CREDS.password, 'Password Admin');
  await wait(1000);

  await page.locator('button[type="submit"]').first().click();
  await wait(5000);
  await page.screenshot({ path: 'screenshots/13_admin_dashboard.png', fullPage: true });
  log('Hasil login Admin disimpan', 'INFO');

  const isDashboard = await page.locator('aside').count() > 0;
  log(`Admin login berhasil: ${isDashboard}`, isDashboard ? 'PASS' : 'WARN');

  if (isDashboard) {
    // Jelajahi menu admin
    const adminMenus = ['Dashboard', 'Data Perusahaan'];
    for (let i = 0; i < adminMenus.length; i++) {
      const menu = adminMenus[i];
      const btn = page.locator(`aside button:has-text("${menu}"), aside a:has-text("${menu}")`).first();
      if (await btn.count() > 0) {
        await btn.click();
        await wait(2500);
        const fname = `screenshots/14_admin_menu_${i + 1}_${menu.replace(/\s/g, '_')}.png`;
        await page.screenshot({ path: fname, fullPage: true });
        log(`Admin menu "${menu}" → ${fname}`, 'PASS');
      }
    }
  }
}

// ========================================
// MAIN
// ========================================
(async () => {
  const fs = require('fs');
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  console.log('\n' + '🚀'.repeat(30));
  log('MEMULAI AUTOMATED TESTING - JHC HALALFLOW');
  log(`Waktu: ${new Date().toLocaleString('id-ID')}`);
  console.log('🚀'.repeat(30));
  log('\n💡 Pastikan server sudah aktif:');
  log('   Backend  → http://localhost:5000');
  log('   User     → http://localhost:5173');
  log('   Admin    → http://localhost:5174\n');

  const browser = await chromium.launch({
    headless: false,   // Browser terlihat (bukan mode tersembunyi)
    slowMo: SLOWMO,    // Perlambat setiap aksi agar bisa dilihat
    executablePath: EDGE_PATH,  // Gunakan Microsoft Edge yang sudah ada
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await testLoginPage(page);
    await testRegisterTab(page);
    await testWrongLogin(page);
    await testForgotPassword(page);
    const loggedIn = await testUserLogin(page);
    if (loggedIn) {
      await testUserDashboard(page);
      await testUserLogout(page);
    } else {
      log('Dashboard tidak bisa dibuka, fase 6 dan 7 dilewati', 'WARN');
    }
    await testAdminFrontend(page);
  } catch (err) {
    log(`Error tidak terduga: ${err.message}`, 'FAIL');
    console.error(err);
    await page.screenshot({ path: 'screenshots/ERROR.png', fullPage: true }).catch(() => {});
  }

  log('\n' + '='.repeat(60));
  log('TESTING SELESAI!', 'STEP');
  log(`Screenshot tersimpan di folder: c:\\project halalflow\\test\\screenshots\\`);
  log(`Waktu selesai: ${new Date().toLocaleString('id-ID')}`);
  log('='.repeat(60) + '\n');

  await wait(3000);
  await browser.close();
})();
