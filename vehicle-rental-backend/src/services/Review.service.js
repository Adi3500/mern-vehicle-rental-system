const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');
const { paginate } = require('../utils/paginate');

/**
 * Create a review (customer must have a completed booking for the vehicle).
 */
exports.createReview = async(customerId, { bookingId, rating, comment }) => {
    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.customer.toString() !== customerId.toString()) {
        throw new AppError('You can only review your own bookings.', 403);
    }
    if (booking.bookingStatus !== 'completed') {
        throw new AppError('You can only review a completed booking.', 400);
    }
    if (booking.isReviewed) {
        throw new AppError('You have already reviewed this booking.', 409);
    }

    const review = await Review.create({
        customer: customerId,
        vehicle: booking.vehicle,
        booking: bookingId,
        rating,
        comment,
    });

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save({ validateBeforeSave: false });

    return review.populate('customer', 'name avatar');
};

/**
 * Get reviews for a vehicle.
 */
exports.getVehicleReviews = async(vehicleId, queryParams) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    return paginate(Review, { vehicle: vehicleId }, queryParams, {
        populate: { path: 'customer', select: 'name avatar' },
        sort: '-createdAt',
    });
};

/**
 * Update a review (owner only, within 7 days).
 */
exports.updateReview = async(reviewId, customerId, updates) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found.', 404);
    if (review.customer.toString() !== customerId.toString()) {
        throw new AppError('Not authorized to update this review.', 403);
    }

    const daysSincePosted = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSincePosted > 7) {
        throw new AppError('Reviews can only be updated within 7 days of posting.', 400);
    }

    Object.assign(review, updates);
    await review.save({ runValidators: true });
    return review;
};

/**
 * Delete a review (owner or admin).
 */
exports.deleteReview = async(reviewId, user) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found.', 404);

    const isOwner = review.customer.toString() === user._id.toString();
    if (!isOwner && user.role !== 'admin') {
        throw new AppError('Not authorized to delete this review.', 403);
    }

    review.isDeleted = true;
    review.deletedAt = new Date();
    await review.save({ validateBeforeSave: false });

    // Recalculate rating
    await Review.calcAverageRating(review.vehicle);
};