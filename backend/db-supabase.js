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

    let pass = decodeURIComponent(u.password || '');
    if (pass.startsWith('[') && pass.endsWith(']')) {
      pass = pass.slice(1, -1);
      u.password = encodeURIComponent(pass);
    }

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
      throw new Error('DATABASE_URL environment variable is missing! Silakan tambahkan DATABASE_URL di environment.');
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

function getCleanSupabaseConfig() {
  let rawUrl = process.env.SUPABASE_URL || '';
  let url = rawUrl.replace(/[\r\n\t]/g, '').trim().replace(/^["']+|["']+$/g, '');
  if (!url || url.length < 10) {
    url = 'https://qptzbrbtzfnjuvurkbhr.supabase.co';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');

  let rawKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  let key = rawKey.replace(/[\r\n\t]/g, '').trim().replace(/^["']+|["']+$/g, '');
  if (!key || key.length < 20) {
    key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHpicmJ0emZuanV2dXJrYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTI2OTMxMCwiZXhwIjoyMTA2ODQ1MzEwfQ.SXFlMQ_hJa7ZXZ3na4dy_ycCYtm43ma2WAUCrFfxq-w';
  }

  let rawBucket = process.env.SUPABASE_STORAGE_BUCKET || '';
  let bucket = rawBucket.replace(/[\r\n\t]/g, '').trim().replace(/^["']+|["']+$/g, '') || 'halal-flow-uploads';

  return { url, key, bucket };
}

function getSupabase() {
  if (!supabaseClient) {
    try {
      const { url, key } = getCleanSupabaseConfig();
      if (url && key) {
        supabaseClient = createClient(url, key);
      }
    } catch (err) {
      console.error('Failed to init Supabase client:', err.message);
      return null;
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

const path = require('path');

let sqliteDb = null;
function getSqlite() {
  if (!sqliteDb) {
    let Database;
    try {
      Database = require('better-sqlite3');
    } catch (err) {
      throw new Error("Modul 'better-sqlite3' tidak terpasang. Di server production/Vercel, gunakan DATABASE_URL (Supabase PostgreSQL).");
    }
    const dbPath = path.join(__dirname, 'halalflow.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    console.log('📦 [Database] DATABASE_URL tidak diatur. Menggunakan SQLite lokal:', dbPath);
  }
  return sqliteDb;
}

function normalizeSqlite(sql) {
  return sql
    .replace(/\$[0-9]+/g, '?')
    .replace(/\bDEFAULT\s+NOW\(\)/gi, "DEFAULT (datetime('now'))")
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/TIMESTAMP WITH TIME ZONE/gi, 'TEXT')
    .replace(/TIMESTAMP/gi, 'TEXT')
    .replace(/JSONB/gi, 'TEXT')
    .replace(/::[a-zA-Z0-9_]+/g, '');
}

/**
 * Helper Database Async kompatibel (Dual Driver: Supabase PostgreSQL / Local SQLite)
 */
const db = {
  getPool,
  getSupabase,

  async query(sql, params = []) {
    if (getConnectionString()) {
      const p = getPool();
      const queryText = normalizeQuery(sql);
      return await p.query(queryText, params);
    }
    const cleanSql = normalizeSqlite(sql).trim();
    if (/^\s*select/i.test(cleanSql)) {
      const rows = getSqlite().prepare(cleanSql).all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const info = getSqlite().prepare(cleanSql).run(...params);
      return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  },

  async get(sql, params = []) {
    if (getConnectionString()) {
      const p = getPool();
      const queryText = normalizeQuery(sql);
      const res = await p.query(queryText, params);
      return res.rows[0] || null;
    }
    const cleanSql = normalizeSqlite(sql);
    return getSqlite().prepare(cleanSql).get(...params) || null;
  },

  async all(sql, params = []) {
    if (getConnectionString()) {
      const p = getPool();
      const queryText = normalizeQuery(sql);
      const res = await p.query(queryText, params);
      return res.rows;
    }
    const cleanSql = normalizeSqlite(sql);
    return getSqlite().prepare(cleanSql).all(...params) || [];
  },

  async run(sql, params = []) {
    if (getConnectionString()) {
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
        if (isInsert && err.message.includes('duplicate key value violates unique constraint') && err.message.includes('_pkey')) {
          // Auto-heal sequence for out-of-sync migrated data
          const match = queryText.match(/^\s*insert\s+into\s+([a-zA-Z0-9_]+)/i);
          if (match) {
            const tableName = match[1];
            try {
              await p.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), coalesce(max(id), 0) + 1, false) FROM ${tableName};`);
              const res = await p.query(queryText, params); // Retry
              return { lastInsertRowid: res.rows[0]?.id || null, rowCount: res.rowCount, rows: res.rows };
            } catch(syncErr) {
              console.error(`⚠️ Failed to auto-sync sequence for ${tableName}:`, syncErr.message);
            }
          }
        }

        // Jika INSERT ON CONFLICT DO NOTHING dan tidak ada row yang kembali
        if (err.message.includes('ON CONFLICT') || isInsert) {
          try {
            // Retry tanpa RETURNING jika error kolom id
            const cleanQuery = normalizeQuery(sql);
            const res = await p.query(cleanQuery, params);
            return { lastInsertRowid: null, rowCount: res.rowCount };
          } catch(retryErr) {
            throw retryErr;
          }
        }
        throw err;
      }
    }

    // SQLite fallback mode
    let cleanSql = normalizeSqlite(sql);
    cleanSql = cleanSql.replace(/\s+RETURNING\s+[a-zA-Z0-9_*,\s]+/i, '');
    const info = getSqlite().prepare(cleanSql).run(...params);
    return {
      lastInsertRowid: info.lastInsertRowid,
      rowCount: info.changes,
      rows: []
    };
  },

  async exec(sql) {
    if (getConnectionString()) {
      const p = getPool();
      const queryText = normalizeQuery(sql);
      return await p.query(queryText);
    }
    const cleanSql = normalizeSqlite(sql);
    return getSqlite().exec(cleanSql);
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
    if (getConnectionString()) {
      return [];
    }
    return getSqlite().pragma(cmd);
  }
};

module.exports = {
  db,
  getPool,
  getSupabase,
  getConnectionString,
  getCleanSupabaseConfig
};
