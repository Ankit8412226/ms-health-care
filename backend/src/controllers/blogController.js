const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * @desc    List blogs (with search and category filter)
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 50 });
  const { search, category } = req.query;

  const query = { isPublished: true };

  if (category && category !== 'All') {
    query.category = new RegExp(`^${category}$`, 'i');
  }

  if (search) {
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { title: searchRegex },
      { desc: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ];
  }

  const [data, total] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Get single blog by slug or ID
 * @route   GET /api/blogs/:identifier
 * @access  Public
 */
const getBlogByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  let blog = await Blog.findOne({ slug: identifier }).lean();
  if (!blog && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    blog = await Blog.findById(identifier).lean();
  }

  if (!blog) {
    throw ApiError.notFound('Blog article not found');
  }

  return res.status(200).json({ success: true, data: blog });
});

/**
 * @desc    Create a blog post
 * @route   POST /api/blogs
 * @access  Private/Admin
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, category, author, readTime, image, desc, content, tags, isPublished } = req.body;

  if (!title || !String(title).trim()) {
    throw ApiError.badRequest('Blog title is required');
  }

  if (!content || !String(content).trim()) {
    throw ApiError.badRequest('Blog content is required');
  }

  let slug = slugify(title);
  if (!slug) {
    slug = `blog-${Date.now()}`;
  }

  // Ensure unique slug
  const existingSlug = await Blog.findOne({ slug }).select('_id').lean();
  if (existingSlug) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const blog = await Blog.create({
    title: String(title).trim(),
    slug,
    category: category ? String(category).trim() : 'General',
    author: author ? String(author).trim() : 'Dr. Admin',
    readTime: readTime ? String(readTime).trim() : '5 min read',
    image: image ? String(image).trim() : '',
    desc: desc ? String(desc).trim() : '',
    content: String(content).trim(),
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
  });

  return res.status(201).json({ success: true, data: blog });
});

/**
 * @desc    Update a blog post
 * @route   PUT /api/blogs/:id
 * @access  Private/Admin
 */
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, category, author, readTime, image, desc, content, tags, isPublished } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    throw ApiError.notFound('Blog not found');
  }

  if (title && String(title).trim()) {
    blog.title = String(title).trim();
    const newSlug = slugify(blog.title);
    if (newSlug !== blog.slug) {
      const existingSlug = await Blog.findOne({ slug: newSlug, _id: { $ne: id } }).select('_id').lean();
      blog.slug = existingSlug ? `${newSlug}-${Math.floor(1000 + Math.random() * 9000)}` : newSlug;
    }
  }

  if (category !== undefined) blog.category = String(category).trim();
  if (author !== undefined) blog.author = String(author).trim();
  if (readTime !== undefined) blog.readTime = String(readTime).trim();
  if (image !== undefined) blog.image = String(image).trim();
  if (desc !== undefined) blog.desc = String(desc).trim();
  if (content !== undefined) blog.content = String(content).trim();
  if (tags !== undefined) {
    blog.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  }
  if (isPublished !== undefined) blog.isPublished = Boolean(isPublished);

  await blog.save();

  return res.status(200).json({ success: true, data: blog });
});

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private/Admin
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    throw ApiError.notFound('Blog not found');
  }

  await Blog.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: 'Blog post deleted successfully',
    data: { id },
  });
});

module.exports = {
  getBlogs,
  getBlogByIdentifier,
  createBlog,
  updateBlog,
  deleteBlog,
};
