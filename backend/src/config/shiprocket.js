/**
 * Shiprocket API Client
 * Uses Node.js built-in https module — no axios needed.
 * Credentials are hardcoded as per project requirements.
 */

const https = require('https');

// ── Hardcoded Shiprocket API Key (Bearer Token) ───────────────────────────
const SHIPROCKET_API_KEY  = 'wD0Jyv#WbQz2cWcr#vd2TyJz$k8la55e';
const SHIPROCKET_BASE     = 'apiv2.shiprocket.in';
const SHIPROCKET_API_BASE = '/v1/external';

/**
 * Make an HTTPS JSON request to Shiprocket
 * @param {string} method   - HTTP method
 * @param {string} path     - API path (without base)
 * @param {object|null} body - Request body (for POST/PUT)
 * @returns {Promise<object>}
 */
function shiprocketRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: SHIPROCKET_BASE,
      port: 443,
      path: `${SHIPROCKET_API_BASE}${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHIPROCKET_API_KEY}`,
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Returns the hardcoded API key (kept for compatibility)
 * @returns {string}
 */
async function getToken() {
  return SHIPROCKET_API_KEY;
}

/**
 * Create a Shiprocket order + shipment (auto-assigns AWB)
 * @param {object} orderData - Order fields
 * @returns {Promise<object>} Shiprocket response
 */
async function createShipment(orderData) {
  return shiprocketRequest('POST', '/orders/create/adhoc', orderData);
}

/**
 * Track a shipment by AWB number
 * @param {string} awb - Airway Bill number
 * @returns {Promise<object>} Tracking response
 */
async function trackByAwb(awb) {
  return shiprocketRequest('GET', `/courier/track/awb/${awb}`);
}

/**
 * Get courier serviceability for a pickup/delivery pincode pair
 * @param {object} params - { pickup_postcode, delivery_postcode, weight, cod }
 * @returns {Promise<object>}
 */
async function checkServiceability(params) {
  const { pickup_postcode, delivery_postcode, weight = 0.5, cod = 0 } = params;
  const query = `pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;
  return shiprocketRequest('GET', `/courier/serviceability/?${query}`);
}

/**
 * Cancel a Shiprocket shipment by AWB
 * @param {string[]} awbs - Array of AWB numbers
 * @returns {Promise<object>}
 */
async function cancelShipment(awbs) {
  return shiprocketRequest('POST', '/orders/cancel/shipment/awbs', { awbs });
}

module.exports = {
  getToken,
  createShipment,
  trackByAwb,
  checkServiceability,
  cancelShipment,
};
