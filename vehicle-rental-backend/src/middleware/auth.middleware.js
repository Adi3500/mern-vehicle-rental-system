const User = require('../models/User');
const AppError = require('../utils/Apperror');
const { verifyToken } = require('../utils/Jwt');

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

const protect = async (req, _res, next) => {
  try {
    const token = getAccessToken(req);

    if (!token) {
      return next(new AppError('You are not logged in. Please authenticate first.', 401));
    }

    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact support.', 403));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    return next(error);
  }
};

const restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication is required before checking permissions.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  return next();
};

const requireApprovedHost = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication is required before host approval can be checked.', 401));
  }

  if (req.user.role !== 'host') {
    return next(new AppError('This route is only available to hosts.', 403));
  }

  if (!req.user.isApproved) {
    return next(new AppError('Your host account is pending admin approval.', 403));
  }

  return next();
};

module.exports = {
  protect,
  restrictTo,
  requireApprovedHost,
};
