export default async function handler(req, res) {
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
