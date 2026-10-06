export default async function handler(req, res) {
  if (req.url === '/api/debug-env' || req.url === '/debug-env') {
    const dbUrl = process.env.DATABASE_URL || '';
    const masked = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : 'NOT_SET';
    return res.status(200).json({
      DATABASE_URL: masked,
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_KEY: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
      VERCEL: !!process.env.VERCEL
    });
  }

  try {
    const mod = await import('../backend/server.cjs');
    const app = mod.default || mod;
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (err) {
    console.error('SERVERLESS ERROR:', err);
    return res.status(500).json({
      error: 'Serverless invocation error',
      message: err.message,
      stack: err.stack
    });
  }
}
