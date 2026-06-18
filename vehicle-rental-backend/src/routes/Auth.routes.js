const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    updatePasswordSchema,
} = require('../validations/auth.validation');
const { uploadProfileAssets } = require('../config/cloudinary');

const parseProfileMultipartFields = (req, _res, next) => {
    try {
        if (typeof req.body.address === 'string' && req.body.address.trim()) {
            req.body.address = JSON.parse(req.body.address);
        }

        if (typeof req.body.driversLicense === 'string' && req.body.driversLicense.trim()) {
            req.body.driversLicense = JSON.parse(req.body.driversLicense);
        }

        next();
    } catch {
        next(new AppError('Profile form data is invalid. Please review address and license details.', 400));
    }
};

const requireLicenseMetadata = (req, _res, next) => {
    if (!req.files?.licenseDocument?.[0]) return next();

    const license = req.body.driversLicense || {};
    if (!license.licenseNumber || !license.expiryDate) {
        return next(new AppError('Driver license number and expiry date are required with a license document.', 400));
    }

    next();
};

router.post('/register', authLimiter, validate(registerSchema), authCtrl.register);
router.post('/login', authLimiter, validate(loginSchema), authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.get('/verify-email', authCtrl.verifyEmail);
router.post('/resend-verification', authCtrl.resendVerification);
router.post('/logout', protect, authCtrl.logout);
router.get('/me', protect, authCtrl.getMe);

router.patch(
    '/update-profile',
    protect,
    uploadProfileAssets.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'licenseDocument', maxCount: 1 },
    ]),
    (req, _res, next) => {
        if (req.files?.avatar?.[0]) {
            req.file = req.files.avatar[0];
        }
        next();
    },
    parseProfileMultipartFields,
    requireLicenseMetadata,
    validate(updateProfileSchema),
    authCtrl.updateProfile
);

router.patch(
    '/change-password',
    protect,
    validate(updatePasswordSchema),
    authCtrl.changePassword
);

module.exports = router;
