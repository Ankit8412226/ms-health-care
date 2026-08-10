const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { assertProductImages } = require('../utils/imageUrl');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * Fields a client is allowed to write.
 *
 * Both create and update previously passed `req.body` straight to Mongoose.
 * For update that meant `findByIdAndUpdate(id, req.body)` — any key the caller
 * invented was written to the document, including `rating`, `reviewCount` and
 * `_id`. An admin could silently forge a product's review score, and a typo in
 * the frontend added a junk field to the collection forever.
 */
const WRITABLE_FIELDS = [
  'name', 'slug', 'description', 'shortDescription', 'price', 'regularPrice',
  'category', 'categoryName', 'brand', 'images', 'image', 'salt', 'dosage',
  'manufacturer', 'prescriptionRequired', 'packSize', 'storage', 'howToUse',
  'sideEffects', 'benefits',
];

/** Copy only the writable keys that are actually present on the payload. */
const pickWritable = (body) => {
  const out = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
};

// Fields excluded from list responses. `description`, `howToUse` and
// `benefits` are long prose that only the detail page renders; omitting them
// cut the full-catalogue payload substantially.
const LIST_PROJECTION = '-description -howToUse -benefits -sideEffects -storage';

/**
 * @desc    Get products (paginated, filterable, sortable)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, prescriptionRequired } = req.query;
  const filter = {};

  if (category && category !== 'all') filter.category = category;

  if (search) {
    // Escape regex metacharacters. Without this a search for "c++" throws an
    // invalid-regex error, and inputs like "(a+)+$" are a ReDoS vector against
    // an endpoint that needs no authentication.
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    filter.$or = [{ name: rx }, { salt: rx }, { brand: rx }];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (prescriptionRequired !== undefined) {
    filter.prescriptionRequired = prescriptionRequired === 'true';
  }

  const SORT_MAP = {
    low: { price: 1 },
    high: { price: -1 },
    rating: { rating: -1 },
    popular: { reviewCount: -1 },
    newest: { createdAt: -1 },
  };
  // `_id` is appended as a tiebreaker. Without it, documents with equal sort
  // keys have no stable order between queries, so paging through the catalogue
  // can show the same product twice and skip another entirely.
  const sortSpec = { ...(SORT_MAP[sort] || { createdAt: -1 }), _id: 1 };

  const { page, limit, skip } = getPagination(req);

  // Pagination is now mandatory. The unbounded branch that answered
  // `?limit=all` was returning all 1,292 products — 3.68 MB — and the frontend
  // called it on every page load.
  const [data, total] = await Promise.all([
    Product.find(filter).select(LIST_PROJECTION).sort(sortSpec).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Get a single product by ObjectId or slug
 * @route   GET /api/products/:idOrSlug
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const product = /^[0-9a-fA-F]{24}$/.test(idOrSlug)
    ? await Product.findById(idOrSlug).lean()
    : await Product.findOne({ slug: idOrSlug.toLowerCase() }).lean();

  if (!product) throw ApiError.notFound('Product not found');

  return res.status(200).json({ success: true, data: product });
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const payload = pickWritable(req.body);

  // Reject inline base64 before touching the database.
  assertProductImages(payload);

  // Derive the slug with the same helper the model uses, so the uniqueness
  // check below tests the value that will actually be inserted.
  payload.slug = slugify(payload.slug || payload.name);
  if (!payload.slug) {
    throw ApiError.badRequest('Could not derive a slug — product name must contain letters or numbers');
  }

  const existing = await Product.findOne({ slug: payload.slug }).select('_id name').lean();
  if (existing) {
    throw ApiError.conflict(
      `A product with the slug "${payload.slug}" already exists. Choose a different name or set an explicit slug.`
    );
  }

  const product = await Product.create(payload);
  return res.status(201).json({ success: true, data: product });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  const updates = pickWritable(req.body);
  assertProductImages(updates);

  // Renaming without an explicit slug used to leave the old slug in place, so
  // the product URL kept referring to the previous name. Track the name unless
  // the caller pins the slug.
  if (updates.slug !== undefined) {
    updates.slug = slugify(updates.slug);
  } else if (updates.name && slugify(updates.name) !== product.slug) {
    updates.slug = slugify(updates.name);
  }

  if (updates.slug && updates.slug !== product.slug) {
    const clash = await Product.findOne({ slug: updates.slug, _id: { $ne: id } }).select('_id').lean();
    if (clash) {
      throw ApiError.conflict(`A different product already uses the slug "${updates.slug}"`);
    }
  }

  // Guard the price relationship on partial updates too: sending only `price`
  // could previously push it above the stored regularPrice, leaving the
  // product displaying a negative discount.
  const nextPrice = updates.price !== undefined ? Number(updates.price) : product.price;
  const nextRegular = updates.regularPrice !== undefined ? Number(updates.regularPrice) : product.regularPrice;
  if (nextRegular < nextPrice) {
    throw ApiError.badRequest('Regular price (MRP) cannot be less than the sale price');
  }
  updates.onSale = nextPrice < nextRegular;

  // Assign-then-save rather than findByIdAndUpdate so the schema's pre-validate
  // hook runs and full validators apply to the merged document.
  Object.assign(product, updates);
  await product.save();

  return res.status(200).json({ success: true, data: product });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  // One round-trip instead of the previous findById-then-findByIdAndDelete.
  const product = await Product.findByIdAndDelete(req.params.id).select('_id name').lean();
  if (!product) throw ApiError.notFound('Product not found');

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: { id: product._id },
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
