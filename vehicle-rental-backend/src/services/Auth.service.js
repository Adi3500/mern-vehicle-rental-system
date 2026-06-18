const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwt');
const { sendWelcomeEmail } = require('../utils/email');
const logger = require('../utils/logger');

/**
 * Register a new user.
 */
exports.register = async({ name, email, password, role, phone }) => {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('An account with this email already exists.', 409);

    const user = await User.create({ name, email, password, role, phone });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch((e) => logger.error(e.message));

    return user;
};

/**
 * Login a user, returning access + refresh tokens.
 */
exports.login = async({ email, password }) => {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password.', 401);
    }
    if (user.isBlocked) throw new AppError('Your account has been blocked. Contact support.', 403);
    if (user.role === 'host' && !user.isApproved) {
        throw new AppError('Your host account is pending admin approval.', 403);
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Persist hashed refresh token (store raw — comparison done via jwt.verify)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
};

/**
 * Logout — clear stored refresh token.
 */
exports.logout = async(userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
};

/**
 * Rotate refresh token → new access + refresh token pair.
 */
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

/**
 * Update logged-in user's profile.
 */
exports.updateProfile = async(userId, updates) => {
    // Never allow role/password changes through this method
    const forbidden = ['password', 'role', 'isApproved', 'isBlocked', 'refreshToken'];
    forbidden.forEach((f) => delete updates[f]);

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found.', 404);
    return user;
};

/**
 * Change password (requires current password verification).
 */
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
