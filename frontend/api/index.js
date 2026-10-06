const app = require('../backend/server.js');

// Vercel Serverless Function entry point
module.exports = (req, res) => {
  // Normalisasi URL agar selalu diawali dengan /api sesuai route definition di server.js
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
