/**
 * Cloudinary delivery transformations.
 *
 * Product imagery is stored at full resolution, and SafeImage passes
 * `unoptimized` for every remote URL — so a 120px grid thumbnail was
 * downloading the original multi-hundred-kilobyte file. With 12+ cards on the
 * shop page that is the single largest cost of a page view.
 *
 * Cloudinary resizes on delivery when transformation directives are inserted
 * into the URL path, and caches the result on its CDN. Doing it here rather
 * than through Next's optimizer keeps the work off the Vercel function (it is
 * billed per optimized image and adds a cold-start hop).
 *
 *   f_auto  - serve AVIF/WebP to browsers that accept it
 *   q_auto  - let Cloudinary pick a quality that looks lossless
 *   w_<n>   - cap the width at what the layout actually renders
 *   c_limit - never upscale beyond the original
 */

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

/**
 * Return `url` rewritten to deliver at roughly `width` device pixels.
 *
 * Non-Cloudinary URLs, relative paths and already-transformed URLs are
 * returned untouched, so this is safe to apply to any image in the catalogue.
 */
export function cldImage(url: string | undefined | null, width: number): string {
  if (!url) return "/default-product.png";
  if (!url.includes("res.cloudinary.com") || !url.includes(CLOUDINARY_UPLOAD_MARKER)) {
    return url;
  }

  const [prefix, rest] = url.split(CLOUDINARY_UPLOAD_MARKER);
  if (!rest) return url;

  // Leave URLs that already carry a transformation segment alone rather than
  // stacking a second one on top.
  if (/^[a-z]{1,3}_[^/]+\//.test(rest)) return url;

  // Retina screens need roughly double the CSS pixels; cap it so a 4x display
  // does not request an absurd width.
  const target = Math.min(Math.round(width * 2), 1600);

  return `${prefix}${CLOUDINARY_UPLOAD_MARKER}f_auto,q_auto,c_limit,w_${target}/${rest}`;
}

/** Widths matching how images are actually rendered around the app. */
export const IMAGE_WIDTHS = {
  thumbnail: 96,
  card: 260,
  detail: 640,
  hero: 1200,
} as const;
