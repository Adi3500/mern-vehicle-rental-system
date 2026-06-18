/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Demo payment integration
 */
const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/payments/intent/{bookingId}:
 *   post:
 *     tags: [Payments]
 *     summary: Prepare dummy payment details for a booking
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Returns dummy payment setup details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:    { type: string }
 *                 paymentIntentId: { type: string }
 */
router.post(
    '/intent/:bookingId',
    protect,
    restrictTo('customer'),
    paymentCtrl.createPaymentIntent
);

router.post(
    '/process/:bookingId',
    protect,
    restrictTo('customer'),
    paymentCtrl.processDummyPayment
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook endpoint (do not call manually)
 *     security: []
 *     description: |
 *       This endpoint receives signed events from Stripe.
 *       It **must** use raw body parsing (not JSON).
 *       Configure your Stripe webhook to point here.
 *     responses:
 *       200: { description: Webhook received }
 */
// NOTE: raw body parsing is applied in app.js specifically for this route
router.post('/webhook', paymentCtrl.stripeWebhook);

module.exports = router;
