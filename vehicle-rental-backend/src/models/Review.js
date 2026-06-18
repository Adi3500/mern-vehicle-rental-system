const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:       { type: string }
 *         customer:  { type: string }
 *         vehicle:   { type: string }
 *         booking:   { type: string }
 *         rating:    { type: number, minimum: 1, maximum: 5 }
 *         comment:   { type: string }
 */
const reviewSchema = new mongoose.Schema({
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true, // one review per booking
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
reviewSchema.index({ vehicle: 1 });
reviewSchema.index({ customer: 1 });

// ── Soft-delete filter ────────────────────────────────────────────────────────
reviewSchema.pre(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

// ── Static: recalculate average rating for a vehicle ─────────────────────────
reviewSchema.statics.calcAverageRating = async function(vehicleId) {
    const stats = await this.aggregate([
        { $match: { vehicle: vehicleId, isDeleted: { $ne: true } } },
        {
            $group: {
                _id: '$vehicle',
                totalReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Vehicle.findByIdAndUpdate(vehicleId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].totalReviews,
        });
    } else {
        await Vehicle.findByIdAndUpdate(vehicleId, {
            averageRating: 0,
            totalReviews: 0,
        });
    }
};

reviewSchema.post('save', function() {
    this.constructor.calcAverageRating(this.vehicle);
});

// Recalculate after findOneAndDelete / findOneAndUpdate
reviewSchema.post(/findOneAnd/, async function(doc) {
    if (doc) await doc.constructor.calcAverageRating(doc.vehicle);
});

reviewSchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Review', reviewSchema);