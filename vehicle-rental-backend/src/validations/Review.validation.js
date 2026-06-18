const Joi = require('joi');

// ── Review ───────────────────────────────────────────────────────────────────
exports.createReviewSchema = Joi.object({
    bookingId: Joi.string().hex().length(24).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(10).max(1000).required(),
});

exports.updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string().trim().min(10).max(1000),
}).min(1);

// ── Category ─────────────────────────────────────────────────────────────────
exports.createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().max(200).optional(),
    icon: Joi.string().trim().optional(),
});

exports.updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    description: Joi.string().trim().max(200).allow(''),
    icon: Joi.string().trim().allow(''),
    isActive: Joi.boolean(),
}).min(1);