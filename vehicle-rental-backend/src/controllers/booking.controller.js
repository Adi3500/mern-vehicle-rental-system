const bookingService = require('../services/booking.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
exports.createBooking = catchAsync(async(req, res) => {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: { booking } });
});

/**
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = catchAsync(async(req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: { booking } });
});

/**
 * @route   GET /api/bookings/my
 * @access  Private (Customer)
 */
exports.getMyBookings = catchAsync(async(req, res) => {
    const result = await bookingService.getMyBookings(req.user._id, req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private (Customer)
 */
exports.cancelBooking = catchAsync(async(req, res) => {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id, req.body.reason);
    res.status(200).json({ status: 'success', data: { booking } });
});

/**
 * @route   GET /api/host/bookings
 * @access  Private (Host)
 */
exports.getHostBookings = catchAsync(async(req, res) => {
    const result = await bookingService.getHostBookings(req.user._id, req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   PATCH /api/host/bookings/:id/respond
 * @access  Private (Host)
 */
exports.respondToBooking = catchAsync(async(req, res) => {
    const booking = await bookingService.respondToBooking(req.params.id, req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { booking } });
});

/**
 * @route   GET /api/admin/bookings
 * @access  Private (Admin)
 */
exports.getAllBookings = catchAsync(async(req, res) => {
    const result = await bookingService.getAllBookings(req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   PATCH /api/host/bookings/:id/complete
 * @access  Private (Host)
 */
exports.completeBooking = catchAsync(async(req, res) => {
    const booking = await bookingService.completeBooking(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: { booking } });
});
