const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:         { type: string }
 *         name:        { type: string }
 *         description: { type: string }
 *         icon:        { type: string }
 *         isActive:    { type: boolean }
 */
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
    },
    description: { type: String, trim: true },
    icon: { type: String, default: '' }, // icon name or URL
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
}, { timestamps: true });

categorySchema.pre(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

categorySchema.set('toJSON', {
    transform: (_doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Category', categorySchema);