/**
 * Script untuk test koneksi SMTP Gmail
 * Jalankan: node test-smtp.js
 * 
 * Jika hasilnya ERROR -> App Password perlu dibuat ulang di:
 * https://myaccount.google.com/apppasswords
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const cleanSmtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

console.log('=== JHC HalalFlow SMTP Test ===');
console.log('User  :', process.env.SMTP_USER);
console.log('Pass  :', cleanSmtpPass ? `${cleanSmtpPass.substring(0, 4)}****` : '(kosong!)');
console.log('Host  :', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: cleanSmtpPass
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP GAGAL:', error.message);
    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.error('');
      console.error('🔑 App Password tidak valid / sudah kadaluarsa!');
      console.error('   Buat App Password baru di:');
      console.error('   https://myaccount.google.com/apppasswords');
      console.error('   Lalu update SMTP_PASS di .env dan Render Environment Variables');
    }
  } else {
    console.log('✅ SMTP OK! Koneksi Gmail berhasil.');
    console.log('   Email siap dikirim dari:', process.env.SMTP_USER);
  }
  process.exit(error ? 1 : 0);
});
