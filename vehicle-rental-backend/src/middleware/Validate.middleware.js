const AppError = require('../utils/AppError');

/**
 * Factory: returns a middleware that validates req.body against a Joi schema.
 * @param {object} schema - Joi schema object
 * @param {string} [property='body'] - 'body' | 'query' | 'params'
 */
const validate = (schema, property = 'body') => (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
        abortEarly: false, // collect all errors
        allowUnknown: false,
        stripUnknown: true, // remove unknown keys
    });

    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        return next(new AppError(messages, 400));
    }

    req[property] = value; // replace with sanitised value
    next();
};

module.exports = validate;