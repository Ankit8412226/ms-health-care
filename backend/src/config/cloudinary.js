const crypto = require('crypto');
const env = require('./env');
const ApiError = require('../utils/ApiError');

/**
 * Cloudinary signed-upload support.
 *
 * The browser uploads directly to Cloudinary; this API only mints the
 * signature that authorises it. Two reasons that matters here:
 *
 *  1. Image bytes never pass through the API, so neither the Express body
 *     limit nor Vercel's hard 4.5 MB request cap applies. Routing a 3 MB phone
 *     photo through the API is exactly what was failing before.
 *  2. The API secret stays on the server. Only a short-lived signature over a
 *     fixed set of parameters ever reaches the client.
 *
 * The signature commits to `folder` and `public_id`, so a client cannot take a
 * signature issued for prescriptions and use it to overwrite product imagery.
 */

/**
 * Build a Cloudinary signature.
 *
 * Cloudinary's rule: take every parameter that will be sent except `file`,
 * `cloud_name`, `resource_type` and `api_key`; sort by key; join as
 * `k=v` with `&`; append the API secret; SHA-1 the result. The parameters
 * signed here must be exactly the ones the browser sends, or Cloudinary
 * rejects the upload with "Invalid Signature".
 */
const sign = (params) => {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(toSign + env.cloudinary.apiSecret)
    .digest('hex');
};

/**
 * Produce everything the browser needs for one direct upload.
 *
 * @param {object} options
 * @param {string} options.folder     Destination folder, scoped by the caller.
 * @param {string} [options.publicId] Deterministic object name.
 * @param {string[]} [options.tags]   Tags applied to the asset.
 * @returns {object} Fields to POST to the Cloudinary upload endpoint.
 */
const createUploadSignature = ({ folder, publicId, tags }) => {
  if (!env.cloudinary.configured) {
    // Fail loudly. The previous code caught this case, logged it, and quietly
    // stored the raw base64 string in MongoDB instead.
    throw ApiError.serviceUnavailable(
      'Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder };
  if (publicId) params.public_id = publicId;
  if (tags && tags.length) params.tags = tags.join(',');

  return {
    ...params,
    signature: sign(params),
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`,
    maxBytes: env.maxUploadBytes,
  };
};

/**
 * True if `url` is an asset on this account's Cloudinary delivery domain.
 *
 * Used to keep arbitrary attacker-controlled URLs, and raw `data:` blobs, out
 * of fields that are supposed to hold hosted images.
 */
const isCloudinaryUrl = (url) => {
  if (typeof url !== 'string') return false;
  return new RegExp(
    `^https://res\\.cloudinary\\.com/${env.cloudinary.cloudName}/`
  ).test(url);
};

module.exports = { sign, createUploadSignature, isCloudinaryUrl };
