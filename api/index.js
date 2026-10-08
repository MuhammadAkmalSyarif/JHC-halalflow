const app = require('../backend/server.js');

module.exports = function handler(req, res) {
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
