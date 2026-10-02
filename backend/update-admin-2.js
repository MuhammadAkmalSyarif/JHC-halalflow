const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('halalflow.db');

const email = 'jhc.halalflow@gmail.com';
const password = 'JHC_Admin123';

const hash = bcrypt.hashSync(password, 12);

// Check if user exists, if not, insert them
const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get('admin@jhc.or.id');
if (existing) {
    db.prepare('UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?').run(email, hash, existing.id);
} else {
    db.prepare('INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)').run('JHC Administrator', email, hash);
}

console.log('Admin account successfully updated!');
const updated = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
console.log('Verified match:', bcrypt.compareSync(password, updated.password_hash));
