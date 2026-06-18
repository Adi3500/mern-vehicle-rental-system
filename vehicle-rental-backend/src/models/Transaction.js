const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    type: { type: String, enum: ['payment', 'refund'], default: 'payment' },
    status: { type: String, enum: ['succeeded', 'failed', 'pending'], default: 'pending' },
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

transactionSchema.index({ booking: 1 });
transactionSchema.index({ customer: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);