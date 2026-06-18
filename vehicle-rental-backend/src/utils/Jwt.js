const jwt = require('jsonwebtoken');

/**
 * Sign an access token (short-lived).
 * @param {string} userId
 * @returns {string}
 */
const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

/**
 * Sign a refresh token (long-lived).
 * @param {string} userId
 * @returns {string}
 */
const signRefreshToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

/**
 * Verify a JWT; throws if invalid.
 * @param {string} token
 * @param {string} secret
 * @returns {object} decoded payload
 */
const verifyToken = (token, secret) => jwt.verify(token, secret);

/**
 * Attach tokens to the response body and set refresh token as httpOnly cookie.
 */
const sendTokens = (res, user, statusCode, message = 'Success') => {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // httpOnly cookie for refresh token
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        message,
        data: { accessToken, user },
    });

    return refreshToken; // caller may need to persist it
};

module.exports = { signAccessToken, signRefreshToken, verifyToken, sendTokens };