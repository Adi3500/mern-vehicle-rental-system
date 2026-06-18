const crypto = require('crypto');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const generateReference = (prefix) =>
    `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

const sanitizeDigits = (value = '') => String(value).replace(/\D/g, '');

exports.createPaymentIntent = async(bookingId, customerId) => {
    const booking = await Booking.findById(bookingId).populate('vehicle', 'title');
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.customer.toString() !== customerId.toString()) {
        throw new AppError('Not authorized.', 403);
    }

    const existingTransaction = await Transaction.findOne({ booking: booking._id, type: 'payment', status: 'succeeded' })
        .sort('-createdAt');

    return {
        mode: 'dummy',
        bookingId: booking._id,
        amount: booking.totalPrice,
        currency: 'usd',
        paymentStatus: booking.paymentStatus,
        transaction: existingTransaction,
    };
};

exports.processDummyPayment = async(bookingId, customerId, payload = {}) => {
    const booking = await Booking.findById(bookingId)
        .populate('vehicle', 'title')
        .populate('customer', 'name email')
        .populate('host', 'name email');

    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.customer._id.toString() !== customerId.toString()) {
        throw new AppError('Not authorized.', 403);
    }
    if (booking.paymentStatus === 'paid') {
        throw new AppError('This booking has already been paid.', 400);
    }

    const cardNumber = sanitizeDigits(payload.cardNumber);
    const expiryMonth = sanitizeDigits(payload.expiryMonth);
    const expiryYear = sanitizeDigits(payload.expiryYear);
    const cvv = sanitizeDigits(payload.cvv);
    const cardHolderName = String(payload.cardHolderName || '').trim();

    if (!cardHolderName) throw new AppError('Card holder name is required.', 400);
    if (cardNumber.length < 13 || cardNumber.length > 19) throw new AppError('Card number is invalid.', 400);
    if (expiryMonth.length < 1 || Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
        throw new AppError('Expiry month is invalid.', 400);
    }
    if (expiryYear.length !== 4) throw new AppError('Expiry year is invalid.', 400);
    if (cvv.length < 3 || cvv.length > 4) throw new AppError('CVV is invalid.', 400);

    const paymentIntentId = generateReference('DUMMY_PAY');
    const chargeId = generateReference('DUMMY_CHARGE');
    const transactionReference = generateReference('TXN');
    const cardLast4 = cardNumber.slice(-4);

    booking.paymentStatus = 'paid';
    booking.paidAt = new Date();
    booking.paymentIntentId = paymentIntentId;
    booking.paymentMethod = `dummy-card-${cardLast4}`;
    booking.bookingStatus = booking.bookingStatus === 'pending' ? 'confirmed' : booking.bookingStatus;
    await booking.save({ validateBeforeSave: false });

    const transaction = await Transaction.create({
        booking: booking._id,
        customer: booking.customer._id,
        host: booking.host._id,
        amount: booking.totalPrice,
        currency: 'usd',
        type: 'payment',
        status: 'succeeded',
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: chargeId,
        metadata: {
            provider: 'dummy',
            reference: transactionReference,
            cardHolderName,
            cardLast4,
            cardBrand: 'demo-card',
        },
    });

    logger.info(`Dummy payment succeeded for booking ${booking._id}`);

    return {
        booking,
        transaction,
        message: 'Dummy payment completed successfully.',
    };
};

exports.refundBooking = async(bookingId, adminId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.paymentStatus !== 'paid') throw new AppError('Booking has not been paid.', 400);
    if (booking.bookingStatus !== 'cancelled') throw new AppError('Only cancelled bookings can be refunded.', 400);

    const originalTransaction = await Transaction.findOne({ booking: booking._id, type: 'payment', status: 'succeeded' })
        .sort('-createdAt');
    if (!originalTransaction) throw new AppError('Original transaction not found.', 404);

    booking.paymentStatus = 'refunded';
    await booking.save({ validateBeforeSave: false });

    const refund = await Transaction.create({
        booking: booking._id,
        customer: booking.customer,
        host: booking.host,
        amount: booking.totalPrice,
        currency: originalTransaction.currency || 'usd',
        type: 'refund',
        status: 'succeeded',
        stripePaymentIntentId: originalTransaction.stripePaymentIntentId,
        stripeChargeId: generateReference('DUMMY_REFUND'),
        metadata: {
            provider: 'dummy',
            refundedBy: adminId.toString(),
            originalReference: originalTransaction.metadata?.reference || '',
            reference: generateReference('REFUND'),
        },
    });

    logger.info(`Dummy refund ${refund._id} issued for booking ${bookingId} by admin ${adminId}`);
    return refund;
};

exports.handleStripeWebhook = async() => ({ received: true, mode: 'dummy' });
