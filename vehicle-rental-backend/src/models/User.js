const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:        { type: string }
 *         name:       { type: string }
 *         email:      { type: string, format: email }
 *         role:       { type: string, enum: [admin, host, customer] }
 *         isApproved: { type: boolean }
 *         isBlocked:  { type: boolean }
 *         avatar:     { type: string }
 *         phone:      { type: string }
 *         address:    { type: object }
 *         createdAt:  { type: string, format: date-time }
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerifiedAt: { type: Date },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'host', 'customer'],
        default: 'customer',
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    avatarPublicId: { type: String, default: '' },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String },
    },
    driversLicense: {
        licenseNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: '',
            match: [/^[A-Z]{2}[0-9]{2}[ -]?[0-9]{11}$/, 'Please provide a valid driver license number'],
        },
        issuingState: { type: String, trim: true, default: '' },
        expiryDate: { type: Date, default: null },
        imageUrl: { type: String, default: '' },
        imagePublicId: { type: String, default: '' },
        status: {
            type: String,
            enum: ['not_submitted', 'pending', 'approved', 'rejected'],
            default: 'not_submitted',
        },
        submittedAt: { type: Date, default: null },
        reviewedAt: { type: Date, default: null },
        verifiedAt: { type: Date, default: null },
        reviewNotes: { type: String, trim: true, default: '' },
    },
    // Host-specific
    isApproved: {
        type: Boolean,
        default: false, // Hosts require admin approval
    },
    // Admin management
    isBlocked: {
        type: Boolean,
        default: false,
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
    },
    deletedAt: { type: Date, select: false },

    refreshToken: { type: String, select: false },

    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // Earnings (Host)
    totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

// ── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, isApproved: 1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Query helper: exclude soft-deleted ──────────────────────────────────────
userSchema.pre(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

// ── Transform: remove sensitive fields from JSON output ─────────────────────
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
