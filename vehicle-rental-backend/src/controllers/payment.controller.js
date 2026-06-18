const paymentService = require('../services/payment.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   POST /api/payments/intent/:bookingId
 * @access  Private (Customer)
 */
exports.createPaymentIntent = catchAsync(async(req, res) => {
    const result = await paymentService.createPaymentIntent(req.params.bookingId, req.user._id);
    res.status(200).json({ status: 'success', data: result });
});

/**
 * @route   POST /api/payments/process/:bookingId
 * @access  Private (Customer)
 */
exports.processDummyPayment = catchAsync(async(req, res) => {
    const result = await paymentService.processDummyPayment(req.params.bookingId, req.user._id, req.body);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   POST /api/payments/webhook
 * @access  Public (Stripe only - verified by signature)
 * Note: Must use express.raw() for body parsing on this route.
 */
exports.stripeWebhook = catchAsync(async(req, res) => {
    const sig = req.headers['stripe-signature'];
    const result = await paymentService.handleStripeWebhook(req.body, sig);
    res.status(200).json(result);
});

/**
 * @route   POST /api/admin/payments/refund/:bookingId
 * @access  Private (Admin)
 */
exports.refundBooking = catchAsync(async(req, res) => {
    const refund = await paymentService.refundBooking(req.params.bookingId, req.user._id);
    res.status(200).json({ status: 'success', data: { refund } });
});
