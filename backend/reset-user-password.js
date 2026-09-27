const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'halalflow.db');
const db = new Database(dbPath);

const email = '241572010004.akmal@student.stmik.tazkia.ac.id';
const newPassword = 'PasswordBaru123!';

const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!user) {
  console.log(`User with email ${email} not found.`);
} else {
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
  console.log(`Password for ${email} has been reset successfully to: ${newPassword}`);
}
