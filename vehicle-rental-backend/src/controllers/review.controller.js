const reviewService = require('../services/review.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
exports.createReview = catchAsync(async(req, res) => {
    const review = await reviewService.createReview(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: { review } });
});

/**
 * @route   GET /api/vehicles/:vehicleId/reviews
 * @access  Public
 */
exports.getVehicleReviews = catchAsync(async(req, res) => {
    const result = await reviewService.getVehicleReviews(req.params.vehicleId, req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   PATCH /api/reviews/:id
 * @access  Private (Review owner)
 */
exports.updateReview = catchAsync(async(req, res) => {
    const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { review } });
});

/**
 * @route   DELETE /api/reviews/:id
 * @access  Private (Review owner | Admin)
 */
exports.deleteReview = catchAsync(async(req, res) => {
    await reviewService.deleteReview(req.params.id, req.user);
    res.status(200).json({ status: 'success', message: 'Review deleted successfully.' });
});
