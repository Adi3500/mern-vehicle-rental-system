const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length === 2,
            message: 'GeoJSON coordinates must be [longitude, latitude].',
        },
    },
}, { _id: false });

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       properties:
 *         _id:           { type: string }
 *         title:         { type: string }
 *         description:   { type: string }
 *         category:      { type: string, description: Category ID }
 *         host:          { type: string, description: Host User ID }
 *         pricePerDay:   { type: number }
 *         pricePerHour:  { type: number }
 *         location:      { type: object }
 *         images:        { type: array, items: { type: string } }
 *         status:        { type: string, enum: [active, inactive, pending] }
 *         averageRating: { type: number }
 *         totalReviews:  { type: number }
 */
const vehicleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vehicle title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Host is required'],
    },
    make: { type: String, trim: true }, // e.g. Toyota
    model: { type: String, trim: true }, // e.g. Camry
    year: { type: Number },
    color: { type: String, trim: true },
    licensePlate: { type: String, trim: true },

    pricePerDay: {
        type: Number,
        required: [true, 'Price per day is required'],
        min: [0, 'Price cannot be negative'],
    },
    pricePerHour: {
        type: Number,
        default: null,
    },

    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
        zipCode: { type: String },
        // GeoJSON for geo queries
        coordinates: {
            type: pointSchema,
            default: undefined,
        },
    },

    images: [{
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public_id for deletion
    }, ],

    features: [String], // e.g. ['AC', 'GPS', 'Bluetooth']
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
        default: 'petrol',
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic'],
        default: 'manual',
    },
    seats: { type: Number, default: 5 },

    status: {
        type: String,
        enum: ['active', 'inactive', 'pending_review'],
        default: 'active',
    },

    // Availability: blocked date ranges
    unavailableDates: [{
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    }, ],

    // Aggregated ratings (updated on review save)
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },

    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
vehicleSchema.index({ host: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ 'location.city': 1 });
vehicleSchema.index({ pricePerDay: 1 });
vehicleSchema.index({ averageRating: -1 });
vehicleSchema.index({ 'location.coordinates': '2dsphere' }); // geo queries

// ── Soft-delete filter ────────────────────────────────────────────────────────
vehicleSchema.pre(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

vehicleSchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
