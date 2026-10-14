let app;
try {
  app = require('../backend/server.js');
} catch (err) {
  console.error('Initial backend loading error:', err);
}

module.exports = function handler(req, res) {
  if (!app) {
    try {
      app = require('../backend/server.js');
    } catch (err) {
      console.error('Serverless crash error:', err);
      return res.status(500).json({
        error: 'Backend initialization error',
        message: err.message,
        stack: err.stack
      });
    }
  }

  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
