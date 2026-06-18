const Joi = require('joi');

const licensePlatePattern = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{1,4}$/i;

const coordinatesSchema = Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number().required()).length(2).required(),
});

const locationSchema = Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().optional(),
    country: Joi.string().required(),
    zipCode: Joi.string().optional(),
    coordinates: coordinatesSchema.optional(),
});

exports.createVehicleSchema = Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(20).required(),
    category: Joi.string().hex().length(24).required(),
    make: Joi.string().trim().optional(),
    model: Joi.string().trim().optional(),
    year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).optional(),
    color: Joi.string().trim().optional(),
    licensePlate: Joi.string().trim().uppercase().pattern(licensePlatePattern).optional().allow('').messages({
        'string.pattern.base': 'License plate must be a valid vehicle registration number, for example MH 12 AB 1234.',
    }),
    registrationNumber: Joi.string().trim().optional(),
    registrationExpiryDate: Joi.date().iso().optional().allow(null, ''),
    pricePerDay: Joi.number().positive().required(),
    pricePerHour: Joi.number().positive().optional(),
    location: locationSchema.required(),
    features: Joi.array().items(Joi.string()).optional(),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid', 'cng').optional(),
    transmission: Joi.string().valid('manual', 'automatic').optional(),
    seats: Joi.number().integer().min(1).max(50).optional(),
});

exports.updateVehicleSchema = Joi.object({
    title: Joi.string().trim().min(5).max(100),
    description: Joi.string().trim().min(20),
    category: Joi.string().hex().length(24),
    make: Joi.string().trim(),
    model: Joi.string().trim(),
    year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1),
    color: Joi.string().trim(),
    licensePlate: Joi.string().trim().uppercase().pattern(licensePlatePattern).allow('').messages({
        'string.pattern.base': 'License plate must be a valid vehicle registration number, for example MH 12 AB 1234.',
    }),
    registrationNumber: Joi.string().trim(),
    registrationExpiryDate: Joi.date().iso().allow(null, ''),
    pricePerDay: Joi.number().positive(),
    pricePerHour: Joi.number().positive().allow(null),
    location: locationSchema,
    features: Joi.array().items(Joi.string()),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid', 'cng'),
    transmission: Joi.string().valid('manual', 'automatic'),
    seats: Joi.number().integer().min(1).max(50),
    status: Joi.string().valid('active', 'inactive'),
}).min(1);

exports.vehicleQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    sort: Joi.string().valid('pricePerDay', '-pricePerDay', '-averageRating', '-createdAt', 'createdAt').default('-createdAt'),
    category: Joi.string().trim().empty('').hex().length(24).optional(),
    city: Joi.string().trim().empty('').optional(),
    country: Joi.string().trim().empty('').optional(),
    minPrice: Joi.number().empty('').min(0).optional(),
    maxPrice: Joi.number().empty('').min(0).optional(),
    startDate: Joi.date().empty('').iso().optional(),
    endDate: Joi.date().empty('').iso().min(Joi.ref('startDate')).optional(),
    fuelType: Joi.string().trim().empty('').valid('petrol', 'diesel', 'electric', 'hybrid', 'cng').optional(),
    transmission: Joi.string().trim().empty('').valid('manual', 'automatic').optional(),
    minRating: Joi.number().empty('').min(0).max(5).optional(),
    search: Joi.string().trim().empty('').optional(),
});
