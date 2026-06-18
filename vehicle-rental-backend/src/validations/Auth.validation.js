const Joi = require('joi');

const driversLicenseNumberPattern = /^[A-Z]{2}[0-9]{2}[ -]?[0-9]{11}$/i;

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

exports.updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    phone: Joi.string().trim().max(20).optional().allow(''),
    address: Joi.object({
        street: Joi.string().trim().max(120).optional().allow(''),
        city: Joi.string().trim().max(80).optional().allow(''),
        state: Joi.string().trim().max(80).optional().allow(''),
        country: Joi.string().trim().max(80).optional().allow(''),
        zipCode: Joi.string().trim().max(20).optional().allow(''),
    }).optional(),
    driversLicense: Joi.object({
        licenseNumber: Joi.string().trim().uppercase().pattern(driversLicenseNumberPattern).optional().allow('').messages({
            'string.pattern.base': 'Driver license number must be valid, for example MH1420110012345.',
        }),
        issuingState: Joi.string().trim().max(80).optional().allow(''),
        expiryDate: Joi.date().iso().greater('now').optional().allow(null, '').messages({
            'date.greater': 'Driver license expiry date must be in the future.',
        }),
    }).optional(),
}).min(1);
