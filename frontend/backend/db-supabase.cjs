const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

let pool = null;
let supabaseClient = null;

function getConnectionString() {
  let conn = process.env.DATABASE_URL;
  if (!conn) return null;
  conn = conn.trim().replace(/^["']|["']$/g, '');

  try {
    const urlToParse = conn.startsWith('postgres://') ? conn.replace('postgres://', 'postgresql://') : conn;
    const u = new URL(urlToParse);
    if (u.hostname.startsWith('db.') && u.hostname.includes('.supabase.co')) {
      const parts = u.hostname.split('.');
      const ref = parts[1];
      u.hostname = 'aws-0-ap-southeast-1.pooler.supabase.com';
      u.port = '6543';
      if (u.username === 'postgres') {
        u.username = `postgres.${ref}`;
      }
      return u.toString();
    }
  } catch (err) {
    console.error('⚠️ Failed to parse DATABASE_URL with new URL:', err.message);
  }
  return conn;
}

function getPool() {
  if (!pool) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing on Vercel! Silakan tambahkan DATABASE_URL di Vercel Dashboard.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key);
    }
  }
  return supabaseClient;
}

/**
 * Mengubah placeholder SQLite '?' menjadi placeholder PostgreSQL '$1, $2, ...'
 * Serta menyesuaikan datetime('now') menjadi NOW()
 */
function normalizeQuery(sql) {
  let index = 1;
  let normalized = sql
    .replace(/\?/g, () => `$${index++}`)
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  return normalized;
}

/**
 * Helper Database Async kompatibel
 */
const db = {
  getPool,
  getSupabase,

  async query(sql, params = []) {
    const p = getPool();
    const queryText = normalizeQuery(sql);
    return await p.query(queryText, params);
  },

  async get(sql, params = []) {
    const p = getPool();
    const queryText = normalizeQuery(sql);
    const res = await p.query(queryText, params);
    return res.rows[0] || null;
  },

  async all(sql, params = []) {
    const p = getPool();
    const queryText = normalizeQuery(sql);
    const res = await p.query(queryText, params);
    return res.rows;
  },

  async run(sql, params = []) {
    const p = getPool();
    let queryText = normalizeQuery(sql);
    
    // Jika INSERT dan belum punya RETURNING, tambahkan RETURNING id
    const isInsert = /^\s*insert\s+into/i.test(queryText);
    if (isInsert && !/returning/i.test(queryText)) {
      queryText += ' RETURNING id';
    }

    try {
      const res = await p.query(queryText, params);
      return {
        lastInsertRowid: res.rows[0]?.id || null,
        rowCount: res.rowCount,
        rows: res.rows
      };
    } catch (err) {
      // Jika INSERT ON CONFLICT DO NOTHING dan tidak ada row yang kembali
      if (err.message.includes('ON CONFLICT') || isInsert) {
        // Retry tanpa RETURNING jika error kolom id
        const cleanQuery = normalizeQuery(sql);
        const res = await p.query(cleanQuery, params);
        return { lastInsertRowid: null, rowCount: res.rowCount };
      }
      throw err;
    }
  },

  async exec(sql) {
    const p = getPool();
    const queryText = normalizeQuery(sql);
    return await p.query(queryText);
  },

  prepare(sql) {
    return {
      get: async (...args) => {
        const flattened = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await db.get(sql, flattened);
      },
      all: async (...args) => {
        const flattened = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await db.all(sql, flattened);
      },
      run: async (...args) => {
        const flattened = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await db.run(sql, flattened);
      }
    };
  },

  transaction(fn) {
    return async (...args) => {
      return await fn(...args);
    };
  },

  pragma(cmd) {
    return [];
  }
};

module.exports = {
  db,
  getPool,
  getSupabase,
  getConnectionString
};
