/**
 * Slug generation.
 *
 * This lives in one place deliberately. The frontend, the product controller
 * and the Product model each used to slugify differently — the admin form
 * collapsed only whitespace while the controller collapsed every non
 * alphanumeric run. For a name like "Mofecon-S 360mg (10 Tab)" the two
 * disagreed, so the controller's duplicate check looked up a slug that was
 * never the one being inserted and the write failed on the unique index with an
 * opaque 500.
 */
const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

module.exports = slugify;
