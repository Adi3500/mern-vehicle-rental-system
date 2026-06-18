/**
 * Build a standardised paginated response.
 *
 * @param {object} model        - Mongoose model
 * @param {object} filter       - Query filter object
 * @param {object} queryParams  - req.query
 * @param {object} [options]    - { select, populate, sort }
 * @returns {object}            - { data, pagination }
 */
const paginate = async(model, filter, queryParams = {}, options = {}) => {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, parseInt(queryParams.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const sort = options.sort || (queryParams.sort ?
        queryParams.sort.split(',').join(' ') :
        '-createdAt');

    let query = model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    if (options.select) query = query.select(options.select);
    if (options.populate) {
        const pops = Array.isArray(options.populate) ? options.populate : [options.populate];
        pops.forEach((p) => { query = query.populate(p); });
    }

    const [data, total] = await Promise.all([query, model.countDocuments(filter)]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
    };
};

module.exports = { paginate };