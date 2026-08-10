/**
 * Shiprocket API Client
 * Uses Node.js built-in https module — no axios needed.
 * Authenticates with email+password to get a JWT, then caches it.
 */

const https = require('https');
const env = require('./env');

// ── Shiprocket credentials ────────────────────────────────────────────────
// The Shiprocket ACCOUNT login email and password (not a scoped API key).
// Resolved through config/env.js, which keeps the working values as built-in
// defaults so nothing needs configuring on Vercel, and lets
// SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD override them.
const SHIPROCKET_EMAIL = env.shiprocket.email;
const SHIPROCKET_PASSWORD = env.shiprocket.password;
const SHIPROCKET_BASE = 'apiv2.shiprocket.in';
const SHIPROCKET_API_BASE = '/v1/external';

// ── Token cache (refreshed automatically on expiry) ───────────────────────
let cachedToken = null;
let tokenExpiry = 0; // epoch ms


function shiprocketRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: SHIPROCKET_BASE,
      port: 443,
      path: `${SHIPROCKET_API_BASE}${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Shiprocket JSON parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * Authenticate with Shiprocket and cache the JWT token (valid 24h).
 */
async function getToken() {
  if (!env.shiprocket.configured) {
    throw new Error(
      'Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.'
    );
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  console.log('🚚 Shiprocket: Logging in to get token...');
  const response = await shiprocketRequest('POST', '/auth/login', {
    email: SHIPROCKET_EMAIL,
    password: SHIPROCKET_PASSWORD,
  });

  if (!response.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(response)}`);
  }

  cachedToken = response.token;
  tokenExpiry = now + 23 * 60 * 60 * 1000; // 23 hours
  console.log('✅ Shiprocket token obtained successfully');
  return cachedToken;
}

/**
 * Create a Shiprocket order + shipment
 */
async function createShipment(orderData) {
  const token = await getToken();
  return shiprocketRequest('POST', '/orders/create/adhoc', orderData, token);
}

/**
 * Track a shipment by AWB number
 */
async function trackByAwb(awb) {
  const token = await getToken();
  return shiprocketRequest('GET', `/courier/track/awb/${awb}`, null, token);
}

/**
 * Check serviceability for a pincode pair
 */
async function checkServiceability(params) {
  const token = await getToken();
  const { pickup_postcode, delivery_postcode, weight = 0.5, cod = 0 } = params;
  const query = `pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;
  return shiprocketRequest('GET', `/courier/serviceability/?${query}`, null, token);
}

/**
 * Cancel shipments by AWB
 */
async function cancelShipment(awbs) {
  const token = await getToken();
  return shiprocketRequest('POST', '/orders/cancel/shipment/awbs', { awbs }, token);
}

module.exports = {
  getToken,
  createShipment,
  trackByAwb,
  checkServiceability,
  cancelShipment,
};
