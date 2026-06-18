/**
 * @swagger
 * tags:
 *   - name: Vehicles (Public)
 *     description: Public vehicle browsing
 *   - name: Vehicles (Host)
 *     description: Host vehicle management
 */
const express = require('express');
const router = express.Router();
const vehicleCtrl = require('../controllers/vehicle.controller');
const reviewCtrl = require('../controllers/review.controller');
const AppError = require('../utils/AppError');
const { protect, restrictTo, requireApprovedHost } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    createVehicleSchema,
    updateVehicleSchema,
    vehicleQuerySchema,
} = require('../validations/vehicle.validation');
const { createReviewSchema, updateReviewSchema } = require('../validations/review.validation');
const { uploadVehicleAssets } = require('../config/cloudinary');

const parseVehicleMultipartFields = (req, _res, next) => {
    try {
        if (typeof req.body.location === 'string') {
            req.body.location = JSON.parse(req.body.location);
        }

        if (typeof req.body.features === 'string') {
            req.body.features = JSON.parse(req.body.features);
        }

        next();
    } catch (_error) {
        next(new AppError('Vehicle form data is invalid. Please review location, features, and selected images.', 400));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — no auth required
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     tags: [Vehicles (Public)]
 *     summary: Search and filter vehicles
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [pricePerDay, -pricePerDay, -averageRating, -createdAt] }
 *     responses:
 *       200:
 *         description: Paginated list of vehicles
 */
router.get('/', validate(vehicleQuerySchema, 'query'), vehicleCtrl.listVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     tags: [Vehicles (Public)]
 *     summary: Get vehicle details
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vehicle details }
 *       404: { description: Vehicle not found }
 */
router.get('/:id', vehicleCtrl.getVehicle);

// Reviews for a vehicle (public)
router.get('/:vehicleId/reviews', reviewCtrl.getVehicleReviews);

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE — Host only
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/host/vehicles:
 *   get:
 *     tags: [Vehicles (Host)]
 *     summary: Get all vehicles owned by logged-in host
 *     responses:
 *       200: { description: Host vehicles }
 *   post:
 *     tags: [Vehicles (Host)]
 *     summary: Create a new vehicle listing
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, pricePerDay, location]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               category:    { type: string }
 *               pricePerDay: { type: number }
 *               location:    { type: string, description: "JSON string of location object" }
 *               images:      { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201: { description: Vehicle created }
 */

// All host routes — must be authenticated, role=host, and approved
const hostVehicleRouter = express.Router();
hostVehicleRouter.use(protect, restrictTo('host'), requireApprovedHost);

hostVehicleRouter.get(
    '/',
    vehicleCtrl.getHostVehicles
);

hostVehicleRouter.post(
    '/',
    uploadVehicleAssets.fields([
        { name: 'images', maxCount: 10 },
        { name: 'licenseDocument', maxCount: 1 },
    ]),
    parseVehicleMultipartFields,
    validate(createVehicleSchema),
    vehicleCtrl.createVehicle
);

hostVehicleRouter.put(
    '/:id',
    uploadVehicleAssets.fields([
        { name: 'images', maxCount: 10 },
        { name: 'licenseDocument', maxCount: 1 },
    ]),
    parseVehicleMultipartFields,
    validate(updateVehicleSchema),
    vehicleCtrl.updateVehicle
);

hostVehicleRouter.delete('/:id', vehicleCtrl.deleteVehicle);

hostVehicleRouter.delete(
    '/:id/images',
    vehicleCtrl.deleteVehicleImage
);

hostVehicleRouter.patch('/:id/availability', vehicleCtrl.updateAvailability);

module.exports = { vehicleRouter: router, hostVehicleRouter };
