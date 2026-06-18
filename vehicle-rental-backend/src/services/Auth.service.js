const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwt');
const { sendEmailVerification, sendWelcomeEmail } = require('../utils/email');
const logger = require('../utils/logger');

const getClientBaseUrl = () => (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const buildEmailVerificationState = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    return {
        rawToken,
        hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
};

const setEmailVerificationState = (user) => {
    const { rawToken, hashedToken, expiresAt } = buildEmailVerificationState();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expiresAt;
    return rawToken;
};

const sendVerificationEmailForUser = async(user) => {
    const rawToken = setEmailVerificationState(user);
    await user.save({ validateBeforeSave: false });
    const verificationUrl = `${getClientBaseUrl()}/verify-email?token=${rawToken}`;
    await sendEmailVerification(user.email, user.name, verificationUrl);
};

exports.register = async({ name, email, password, role, phone }) => {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('An account with this email already exists.', 409);

    const user = await User.create({ name, email, password, role, phone });

    sendWelcomeEmail(email, name).catch((e) => logger.error(e.message));
    sendVerificationEmailForUser(user).catch((e) => logger.error(e.message));

    return user;
};

exports.login = async({ email, password }) => {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password.', 401);
    }
    if (user.isBlocked) throw new AppError('Your account has been blocked. Contact support.', 403);
    if (!user.isEmailVerified) throw new AppError('Please verify your email before logging in.', 403);
    if (user.role === 'host' && !user.isApproved) {
        throw new AppError('Your host account is pending admin approval.', 403);
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
};

exports.logout = async(userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
};

exports.refreshTokens = async(incomingRefreshToken) => {
    if (!incomingRefreshToken) throw new AppError('Refresh token is required.', 400);

    let decoded;
    try {
        decoded = verifyToken(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new AppError('Refresh token has been revoked or is invalid.', 401);
    }

    const accessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken, user };
};

exports.verifyEmail = async(rawToken) => {
    if (!rawToken) throw new AppError('Verification token is required.', 400);

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
        throw new AppError('This verification link is invalid or has expired.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
};

exports.resendVerificationEmail = async(email) => {
    if (!email) throw new AppError('Email is required.', 400);

    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found.', 404);
    if (user.isEmailVerified) throw new AppError('This email is already verified.', 400);

    await sendVerificationEmailForUser(user);
    return true;
};

exports.updateProfile = async(userId, updates) => {
    const forbidden = ['password', 'role', 'isApproved', 'isBlocked', 'refreshToken', 'isEmailVerified'];
    forbidden.forEach((f) => delete updates[f]);

    const nextUpdates = { ...updates };

    if (nextUpdates.driversLicense && typeof nextUpdates.driversLicense === 'object') {
        const currentUser = await User.findById(userId);
        if (!currentUser) throw new AppError('User not found.', 404);

        const mergedLicense = {
            ...(currentUser.driversLicense?.toObject?.() || currentUser.driversLicense || {}),
            ...nextUpdates.driversLicense,
        };

        if (mergedLicense.imageUrl) {
            mergedLicense.status = 'pending';
            mergedLicense.submittedAt = new Date();
            mergedLicense.reviewedAt = null;
            mergedLicense.verifiedAt = null;
            mergedLicense.reviewNotes = '';
        }

        nextUpdates.driversLicense = mergedLicense;
    }

    const user = await User.findByIdAndUpdate(userId, nextUpdates, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found.', 404);
    return user;
};

exports.changePassword = async(userId, { currentPassword, newPassword }) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect.', 401);
    }

    user.password = newPassword;
    user.refreshToken = '';
    await user.save();
    return user;
};
