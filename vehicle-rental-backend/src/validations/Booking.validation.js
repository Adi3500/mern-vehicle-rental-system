const Joi = require('joi');

exports.createBookingSchema = Joi.object({
    vehicleId: Joi.string().hex().length(24).required(),
    startDate: Joi.date().iso().min('now').required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    customerNotes: Joi.string().trim().max(500).optional(),
});

exports.cancelBookingSchema = Joi.object({
    reason: Joi.string().trim().min(5).max(500).required(),
});

exports.updateBookingStatusSchema = Joi.object({
    status: Joi.string().valid('confirmed', 'rejected').required(),
    hostNotes: Joi.string().trim().max(500).optional(),
});