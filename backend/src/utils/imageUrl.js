const ApiError = require('./ApiError');

/**
 * Guards for fields that are supposed to hold an image *reference*.
 *
 * The failure this prevents: when the old Cloudinary call failed, the helper
 * returned the caller's input unchanged and the controller persisted a
 * multi-megabyte `data:` URI into MongoDB. Those documents then bloated every
 * subsequent list response. Storing the bytes in the database is never the
 * right fallback, so a `data:` URI is now a hard 400 that tells the caller what
 * to do instead.
 */

const DATA_URI_MESSAGE =
  'Inline base64 image data is not accepted. Request a signature from POST /api/uploads/signature, upload the file directly to Cloudinary, then send the returned https URL.';

/** True for `data:...` payloads (bytes inlined into the request). */
const isDataUri = (value) => typeof value === 'string' && value.trim().startsWith('data:');

/**
 * Validate one image reference.
 *
 * Accepts absolute http(s) URLs and site-relative paths such as
 * `/default-product.png`, both of which already exist in the catalogue.
 *
 * @param {*} value
 * @param {string} field - Field name, used in the error message.
 * @returns {string|undefined} The trimmed value, or undefined if absent.
 */
const assertImageReference = (value, field = 'image') => {
  if (value === undefined || value === null || value === '') return undefined;

  if (typeof value !== 'string') {
    throw ApiError.badRequest(`${field} must be a URL string`);
  }

  const trimmed = value.trim();

  if (isDataUri(trimmed)) {
    throw ApiError.badRequest(`${field}: ${DATA_URI_MESSAGE}`);
  }

  const looksLikeUrl = /^https?:\/\//i.test(trimmed);
  const looksLikePath = trimmed.startsWith('/');
  if (!looksLikeUrl && !looksLikePath) {
    throw ApiError.badRequest(`${field} must be an http(s) URL or a site-relative path`);
  }

  return trimmed;
};

/**
 * Validate every image reference on a product-shaped payload in place.
 *
 * Covers the main `image` plus each `src`/`thumbnail` in the gallery, so a
 * base64 blob cannot slip in through the gallery while `image` looks clean.
 */
const assertProductImages = (body) => {
  if (body.image !== undefined) {
    body.image = assertImageReference(body.image, 'image');
  }

  if (Array.isArray(body.images)) {
    body.images.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      if (entry.src !== undefined) {
        entry.src = assertImageReference(entry.src, `images[${index}].src`);
      }
      if (entry.thumbnail !== undefined) {
        entry.thumbnail = assertImageReference(entry.thumbnail, `images[${index}].thumbnail`);
      }
    });
  }

  return body;
};

module.exports = { isDataUri, assertImageReference, assertProductImages, DATA_URI_MESSAGE };
