/**
 * @swagger
 * tags:
 *   - name: Bookings (Customer)
 *     description: Customer booking operations
 *   - name: Bookings (Host)
 *     description: Host booking management
 */
const express = require('express');
const bookingCtrl = require('../controllers/booking.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    createBookingSchema,
    cancelBookingSchema,
    updateBookingStatusSchema,
} = require('../validations/booking.validation');

// ─────────────────────────────────────────────────────────────────────────────
// Customer booking router  →  mounted at /api/bookings
// ─────────────────────────────────────────────────────────────────────────────
const customerRouter = express.Router();
customerRouter.use(protect, restrictTo('customer'));

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings (Customer)]
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, startDate, endDate]
 *             properties:
 *               vehicleId:     { type: string }
 *               startDate:     { type: string, format: date }
 *               endDate:       { type: string, format: date }
 *               customerNotes: { type: string }
 *     responses:
 *       201: { description: Booking created }
 *       409: { description: Vehicle already booked for these dates }
 */
customerRouter.post('/', validate(createBookingSchema), bookingCtrl.createBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     tags: [Bookings (Customer)]
 *     summary: Get my bookings
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed, rejected] }
 *     responses:
 *       200: { description: Customer bookings }
 */
customerRouter.get('/my', bookingCtrl.getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings (Customer)]
 *     summary: Get booking detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking detail }
 */
customerRouter.get('/:id', bookingCtrl.getBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings (Customer)]
 *     summary: Cancel a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200: { description: Booking cancelled }
 */
customerRouter.patch('/:id/cancel', validate(cancelBookingSchema), bookingCtrl.cancelBooking);

// ─────────────────────────────────────────────────────────────────────────────
// Host booking router  →  mounted at /api/host/bookings
// ─────────────────────────────────────────────────────────────────────────────
const hostRouter = express.Router();
hostRouter.use(protect, restrictTo('host'));

/**
 * @swagger
 * /api/host/bookings:
 *   get:
 *     tags: [Bookings (Host)]
 *     summary: Get bookings for host's vehicles
 *     responses:
 *       200: { description: Host bookings }
 */
hostRouter.get('/', bookingCtrl.getHostBookings);

/**
 * @swagger
 * /api/host/bookings/{id}/respond:
 *   patch:
 *     tags: [Bookings (Host)]
 *     summary: Accept or reject a booking request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:    { type: string, enum: [confirmed, rejected] }
 *               hostNotes: { type: string }
 *     responses:
 *       200: { description: Booking status updated }
 */
hostRouter.patch(
    '/:id/respond',
    validate(updateBookingStatusSchema),
    bookingCtrl.respondToBooking
);

hostRouter.get('/:id', bookingCtrl.getBooking);
hostRouter.patch('/:id/complete', bookingCtrl.completeBooking);
hostRouter.patch('/:id/cancel', validate(cancelBookingSchema), bookingCtrl.cancelBooking);

module.exports = { customerBookingRouter: customerRouter, hostBookingRouter: hostRouter };