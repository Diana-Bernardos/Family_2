const serverless = require('serverless-http');
const app = require('../server');

// Wrap Express app for Netlify Functions
module.exports.handler = serverless(app);
