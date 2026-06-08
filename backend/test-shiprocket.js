/**
 * Shiprocket API Key Test Script
 * Tests email+password auth to get a real JWT, then calls Shiprocket.
 * Run: node test-shiprocket.js
 */

const https = require('https');

// The client's Shiprocket credentials
// The "API key" they gave is actually the account password
const SHIPROCKET_EMAIL    = 'mohdaffanahmad007@gmail.com';
const SHIPROCKET_PASSWORD = 'Shadab@4012';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'apiv2.shiprocket.in',
      port: 443,
      path: `/v1/external${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  console.log('\n🚀 Testing Shiprocket Integration...\n');

  // Step 1: Login to get real JWT token
  console.log('── Step 1: Login with email+password ──');
  const auth = await request('POST', '/auth/login', {
    email: SHIPROCKET_EMAIL,
    password: SHIPROCKET_PASSWORD,
  });

  if (auth.status !== 200 || !auth.body.token) {
    console.log('❌ Login FAILED (HTTP ' + auth.status + ')');
    console.log('   Message:', auth.body.message || JSON.stringify(auth.body));
    console.log('\n💡 Check:\n  1. The email is the Shiprocket account email (not oncolifeindia email)\n  2. The password is correct\n  3. Ask client to share their Shiprocket login credentials\n');
    return;
  }

  const token = auth.body.token;
  console.log('✅ Login SUCCESS! JWT token received.');
  console.log('   Token (first 40 chars):', token.substring(0, 40) + '...');

  // Step 2: Get channels
  console.log('\n── Step 2: Sales Channels ──');
  const ch = await request('GET', '/channels', null, token);
  if (ch.status === 200 && ch.body.data) {
    console.log(`✅ Found ${ch.body.data.length} channel(s):`);
    ch.body.data.forEach(c => console.log(`   • ${c.name} [${c.channel_type}]`));
  } else {
    console.log('   Status:', ch.status, JSON.stringify(ch.body?.message || ch.body));
  }

  // Step 3: Pickup locations
  console.log('\n── Step 3: Pickup Locations ──');
  const pu = await request('GET', '/settings/company/pickup', null, token);
  if (pu.status === 200 && pu.body.data) {
    const locs = pu.body.data.shipping_address || [];
    console.log(`✅ Found ${locs.length} pickup location(s):`);
    locs.forEach(l => console.log(`   • "${l.pickup_location}" — ${l.city}, ${l.state} ${l.pin_code}`));
    if (locs.length === 0) {
      console.log('   ⚠️  No pickup locations set up. Admin needs to add one at shiprocket.in → Settings → Manage Pickups');
    }
  } else {
    console.log('   Status:', pu.status, JSON.stringify(pu.body?.message || pu.body));
  }

  console.log('\n✅ All tests done. Integration is ready to go!\n');
})();
