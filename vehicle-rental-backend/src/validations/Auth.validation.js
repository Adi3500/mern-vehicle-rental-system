const Joi = require('joi');

exports.registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match.',
    }),
    role: Joi.string().valid('customer', 'host').default('customer'),
    phone: Joi.string().trim().optional(),
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
});

exports.refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().optional(), // also accepted from cookie
});

exports.updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match.',
    }),
});