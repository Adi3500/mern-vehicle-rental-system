const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:           { type: string }
 *         customer:      { type: string }
 *         vehicle:       { type: string }
 *         host:          { type: string }
 *         startDate:     { type: string, format: date-time }
 *         endDate:       { type: string, format: date-time }
 *         totalDays:     { type: number }
 *         totalPrice:    { type: number }
 *         bookingStatus: { type: string }
 *         paymentStatus: { type: string }
 */
const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    totalDays: { type: Number, required: true },

    pricePerDay: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 }, // platform fee
    totalPrice: { type: Number, required: true },

    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending',
    },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'partially_refunded'],
        default: 'unpaid',
    },

    // Payment details
    paymentIntentId: { type: String, default: '' },
    paymentMethod: { type: String, default: 'card' },
    paidAt: { type: Date },

    // Cancellation
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Host response
    hostNotes: { type: String },
    customerNotes: { type: String },

    // Review written after completion
    isReviewed: { type: Boolean, default: false },

    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ customer: 1, bookingStatus: 1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ host: 1, bookingStatus: 1 });
bookingSchema.index({ paymentIntentId: 1 });

// ── Soft-delete filter ────────────────────────────────────────────────────────
bookingSchema.pre(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

bookingSchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Booking', bookingSchema);