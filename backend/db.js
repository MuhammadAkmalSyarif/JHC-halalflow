const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_MATERIALS = [
  { id: 1, name: 'Tepung Terigu', jenis: 'Bahan', produsen: 'PT Bogasari', negara: 'Indonesia', supplier: 'PT Bogasari Flour Mills', lembaga: 'BPJPH', sertifikat: '12345678', status: 'hijau', expired: '2026-12-31', coa: 'tersedia', sds: 'tersedia' },
  { id: 2, name: 'Minyak Goreng', jenis: 'Bahan', produsen: 'PT Sinar Mas', negara: 'Indonesia', supplier: 'PT Sinar Mas Agro', lembaga: 'BPJPH', sertifikat: '87654321', status: 'hijau', expired: '2026-08-15', coa: 'tersedia', sds: 'tersedia' },
  { id: 3, name: 'Saus Tomat', jenis: 'Bahan Tambahan', produsen: 'PT Indofood', negara: 'Indonesia', supplier: 'PT Indofood CBP', lembaga: 'LPPOM MUI', sertifikat: '11223344', status: 'kuning', expired: '2026-05-10', coa: 'perlu_update', sds: 'tersedia' },
  { id: 4, name: 'Flavor Ayam Bawang', jenis: 'Flavoring', produsen: 'PT Firmenich', negara: 'Swiss', supplier: 'PT Firmenich Indonesia', lembaga: '', sertifikat: '', status: 'merah', expired: '2025-11-20', coa: 'tidak_ada', sds: 'tidak_ada' }
];

const DEFAULT_DATA = {
  currentUserEmail: '',
  currentUserName: '',
  currentUserPhone: '',
  currentUserLoginAt: '',
  users: [] // Array of user profiles
};

// Returns a clean user data object for a new user
function getBlankUserData(email, namaLengkap, nomorTelepon) {
  return {
    email: email,
    namaLengkap: namaLengkap,
    nomorTelepon: nomorTelepon,
    registeredAt: new Date().toISOString(),
    companyProfile: {},
    materials: [],
    matrixSubmitted: false,
    products: [],
    productsSubmitted: false,
    legalData: {},
    productionData: {},
    evidenceData: {},
    chatMessages: [
      { sender: 'ai', text: 'Halo! Saya AI Halal Assistant JHC. Ada yang ingin ditanyakan seputar regulasi SJPH atau kelengkapan berkas Anda?' }
    ],
    certificationStatus: 0
  };
}

// (Helper function removed to merge with above)

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
      return DEFAULT_DATA;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB file, returning defaults', err);
    return DEFAULT_DATA;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB file', err);
    return false;
  }
}

module.exports = {
  readDb,
  writeDb,
  getBlankUserData
};
