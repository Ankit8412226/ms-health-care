const dotenv = require('dotenv');
dotenv.config();

// Serverless entrypoint.
//
// connectDB is intentionally NOT called here. It used to be invoked at module
// scope and un-awaited: on a cold start a request could reach a handler before
// the connection was ready, and a rejected connection promise became an
// unhandled rejection that took the instance down. app.js now awaits the
// cached connection per request instead, which is a no-op once warm.
module.exports = require('../src/app');
