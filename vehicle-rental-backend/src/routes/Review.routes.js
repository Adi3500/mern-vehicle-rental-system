/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Vehicle reviews and ratings
 */
const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewSchema, updateReviewSchema } = require('../validations/review.validation');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a completed booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating, comment]
 *             properties:
 *               bookingId: { type: string }
 *               rating:    { type: integer, minimum: 1, maximum: 5 }
 *               comment:   { type: string }
 *     responses:
 *       201: { description: Review created }
 *       400: { description: Booking not completed or already reviewed }
 */
router.post(
    '/',
    protect,
    restrictTo('customer'),
    validate(createReviewSchema),
    reviewCtrl.createReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update a review (within 7 days)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review updated }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review deleted }
 */
router.patch(
    '/:id',
    protect,
    restrictTo('customer'),
    validate(updateReviewSchema),
    reviewCtrl.updateReview
);

router.delete(
    '/:id',
    protect,
    restrictTo('customer', 'admin'),
    reviewCtrl.deleteReview
);

module.exports = router;