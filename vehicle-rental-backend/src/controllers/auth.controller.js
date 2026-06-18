const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { buildUploadedFileMeta } = require('../config/cloudinary');

exports.register = catchAsync(async(req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Account created successfully. Please verify your email before logging in.',
        data: { user },
    });
});

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

exports.logout = catchAsync(async(req, res) => {
    await authService.logout(req.user._id);
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

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

exports.verifyEmail = catchAsync(async(req, res) => {
    await authService.verifyEmail(req.query.token);
    res.status(200).json({
        status: 'success',
        message: 'Email verified successfully. You can log in now.',
    });
});

exports.resendVerification = catchAsync(async(req, res) => {
    await authService.resendVerificationEmail(req.body.email);
    res.status(200).json({
        status: 'success',
        message: 'Verification email sent successfully.',
    });
});

exports.getMe = catchAsync(async(req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
});

exports.updateProfile = catchAsync(async(req, res) => {
    if (typeof req.body.address === 'string' && req.body.address.trim()) {
        try {
            req.body.address = JSON.parse(req.body.address);
        } catch {
            throw new AppError('Address payload must be valid JSON.', 400);
        }
    }

    if (typeof req.body.driversLicense === 'string' && req.body.driversLicense.trim()) {
        try {
            req.body.driversLicense = JSON.parse(req.body.driversLicense);
        } catch {
            throw new AppError('License payload must be valid JSON.', 400);
        }
    }

    if (req.file) {
        const avatarFile = buildUploadedFileMeta(req.file, 'avatars');
        req.body.avatar = avatarFile.url;
        req.body.avatarPublicId = avatarFile.publicId;
    }

    if (req.files?.licenseDocument?.[0]) {
        const licenseFile = buildUploadedFileMeta(req.files.licenseDocument[0], 'verification');
        req.body.driversLicense = {
            ...(req.body.driversLicense || {}),
            imageUrl: licenseFile.url,
            imagePublicId: licenseFile.publicId,
            status: 'pending',
            submittedAt: new Date(),
            reviewedAt: null,
            verifiedAt: null,
            reviewNotes: '',
        };
    }

    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { user } });
});

exports.changePassword = catchAsync(async(req, res) => {
    await authService.changePassword(req.user._id, req.body);
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Password updated. Please log in again.' });
});
