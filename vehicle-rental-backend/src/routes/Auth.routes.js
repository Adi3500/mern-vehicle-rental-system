/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
} = require('../validations/auth.validation');
const { uploadAvatar } = require('../config/cloudinary');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name:            { type: string }
 *               email:           { type: string }
 *               password:        { type: string }
 *               confirmPassword: { type: string }
 *               role:            { type: string, enum: [customer, host] }
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already exists }
 */
router.post('/register', authLimiter, validate(registerSchema), authCtrl.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns accessToken }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate(loginSchema), authCtrl.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     responses:
 *       200: { description: New access token }
 */
router.post('/refresh', authCtrl.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', protect, authCtrl.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     responses:
 *       200: { description: Current user }
 */
router.get('/me', protect, authCtrl.getMe);

router.patch(
    '/update-profile',
    protect,
    uploadAvatar.single('avatar'),
    authCtrl.updateProfile
);

router.patch(
    '/change-password',
    protect,
    validate(updatePasswordSchema),
    authCtrl.changePassword
);

module.exports = router;