const app = require('../backend/server.js');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
