require('dotenv').config();
const { db } = require('./db-supabase');

async function fixSequences() {
  const tables = [
    'users',
    'admin_users',
    'companies',
    'legal_documents',
    'halal_materials',
    'products',
    'product_materials',
    'certification_progress',
    'activities',
    'documents'
  ];

  for (const table of tables) {
    try {
      const query = `SELECT setval(pg_get_serial_sequence('${table}', 'id'), coalesce(max(id), 0) + 1, false) FROM ${table};`;
      await db.query(query);
      console.log(`✅ Synced sequence for table: ${table}`);
    } catch (e) {
      console.error(`❌ Failed to sync sequence for ${table}:`, e.message);
    }
  }
  console.log('Done!');
  process.exit(0);
}

fixSequences();
