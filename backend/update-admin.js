const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('halalflow.db');

const email = 'admin@jhc.or.id';
const password = 'JHC_Admin_2026!';

const hash = bcrypt.hashSync(password, 12);
db.prepare('UPDATE admin_users SET password_hash = ? WHERE email = ?').run(hash, email);

console.log('Password successfully updated for', email);
const updated = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
console.log('Matches:', bcrypt.compareSync(password, updated.password_hash));
