/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */
const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const bookingCtrl = require('../controllers/booking.controller');
const paymentCtrl = require('../controllers/payment.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    createCategorySchema,
    updateCategorySchema,
} = require('../validations/review.validation');

// All admin routes require authentication + admin role
router.use(protect, restrictTo('admin'));

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard analytics
 *     responses:
 *       200:
 *         description: Aggregated stats (users, vehicles, bookings, revenue)
 */
router.get('/dashboard', adminCtrl.getDashboard);

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [host, customer] }
 *       - in: query
 *         name: isBlocked
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/users', adminCtrl.getAllUsers);
router.get('/users/:id', adminCtrl.getUser);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     tags: [Admin]
 *     summary: Block a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User blocked }
 */
router.put('/users/:id/block', adminCtrl.blockUser);
router.put('/users/:id/unblock', adminCtrl.unblockUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// ─────────────────────────────────────────────────────────────────────────────
// Host Approval
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/hosts/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approve a host account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Host approved }
 */
router.put('/hosts/:id/approve', adminCtrl.approveHost);
router.put('/hosts/:id/reject', adminCtrl.rejectHost);

// ─────────────────────────────────────────────────────────────────────────────
// Vehicle Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/vehicles:
 *   get:
 *     tags: [Admin]
 *     summary: List all vehicles (admin view)
 *     responses:
 *       200: { description: All vehicles with host info }
 */
router.get('/vehicles', adminCtrl.getAllVehicles);
router.delete('/vehicles/:id', adminCtrl.removeVehicle);

// ─────────────────────────────────────────────────────────────────────────────
// Bookings (admin view)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     tags: [Admin]
 *     summary: List all bookings
 *     responses:
 *       200: { description: All bookings }
 */
router.get('/bookings', bookingCtrl.getAllBookings);
router.get('/bookings/:id', bookingCtrl.getBooking);
router.post('/payments/refund/:bookingId', paymentCtrl.refundBooking);

// ─────────────────────────────────────────────────────────────────────────────
// Categories CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: List all categories
 *     responses:
 *       200: { description: Category list }
 *   post:
 *     tags: [Admin]
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               icon:        { type: string }
 *     responses:
 *       201: { description: Category created }
 */
router.get('/categories', adminCtrl.getCategories);
router.post('/categories', validate(createCategorySchema), adminCtrl.createCategory);
router.put('/categories/:id', validate(updateCategorySchema), adminCtrl.updateCategory);
router.delete('/categories/:id', adminCtrl.deleteCategory);

module.exports = router;