/**
 * Shared pagination helpers.
 *
 * Every list endpoint uses these so the query contract (`?page=&limit=`) and
 * the response envelope are identical across the API.
 */

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

/**
 * Read `page` / `limit` off a request and clamp them into a sane range.
 *
 * Clamping matters: without it `?limit=100000` lets any anonymous caller ask
 * the database for the entire collection in one request.
 *
 * @param {import('express').Request} req
 * @param {{ defaultLimit?: number, maxLimit?: number }} [options]
 */
const getPagination = (req, options = {}) => {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
  const maxLimit = options.maxLimit || MAX_LIMIT;

  const rawPage = parseInt(req.query.page, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = parseInt(req.query.limit, 10);
  let limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Build the standard list response body.
 *
 * `count` and `data` are preserved from the original API shape so existing
 * clients keep working; `pagination` is additive.
 */
const paginatedResponse = ({ data, total, page, limit, extra = {} }) => {
  const pages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    success: true,
    count: data.length,
    total,
    page,
    pages,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
    ...extra,
    data,
  };
};

/**
 * Run a Mongoose query and its count concurrently, then wrap the result.
 *
 * The two round-trips are independent, so issuing them in parallel roughly
 * halves the latency of every list endpoint.
 *
 * @param {import('mongoose').Model} model
 * @param {object} filter
 * @param {object} opts - { page, limit, sort, select, populate, lean }
 */
const paginateQuery = async (model, filter, opts = {}) => {
  const { page = 1, limit = DEFAULT_LIMIT, sort, select, populate, lean = true } = opts;

  let query = model.find(filter).skip((page - 1) * limit).limit(limit);
  if (sort) query = query.sort(sort);
  if (select) query = query.select(select);
  if (populate) {
    for (const p of [].concat(populate)) query = query.populate(p);
  }
  if (lean) query = query.lean();

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return paginatedResponse({ data, total, page, limit });
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  getPagination,
  paginatedResponse,
  paginateQuery,
};
