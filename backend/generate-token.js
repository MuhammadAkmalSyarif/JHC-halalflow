const jwt = require('jsonwebtoken'); 
const token = jwt.sign({ id: 1, email: 'schevencoxelxynon@gmail.com', role: 'user' }, 'jhc_halalflow_jwt_secret_2026_secure', { expiresIn: '1h' }); 
console.log(token);
const fs = require('fs');
fs.writeFileSync('token.txt', token);
