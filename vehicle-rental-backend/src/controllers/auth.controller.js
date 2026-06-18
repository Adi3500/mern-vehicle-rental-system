const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { sendTokens } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { buildUploadedFileMeta } = require('../config/cloudinary');

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async(req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Account created successfully. Please log in.',
        data: { user },
    });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async(req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully.',
        data: { accessToken, user },
    });
});

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async(req, res) => {
    await authService.logout(req.user._id);
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

/**
 * @route   POST /api/auth/refresh
 * @access  Public (uses refresh token)
 */
exports.refresh = catchAsync(async(req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken, user } = await authService.refreshTokens(token);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        status: 'success',
        data: { accessToken, user },
    });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async(req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
});

/**
 * @route   PATCH /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = catchAsync(async(req, res) => {
    if (typeof req.body.address === 'string' && req.body.address.trim()) {
        try {
            req.body.address = JSON.parse(req.body.address);
        } catch {
            throw new AppError('Address payload must be valid JSON.', 400);
        }
    }

    if (req.file) {
        const avatarFile = buildUploadedFileMeta(req.file, 'avatars');
        req.body.avatar = avatarFile.url;
        req.body.avatarPublicId = avatarFile.publicId;
    }

    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { user } });
});

/**
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async(req, res) => {
    const user = await authService.changePassword(req.user._id, req.body);
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Password updated. Please log in again.' });
});
