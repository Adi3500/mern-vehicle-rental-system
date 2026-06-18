const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { sendHostApproval } = require('../utils/email');
const { paginate } = require('../utils/paginate');

// ── User Management ───────────────────────────────────────────────────────────

exports.getAllUsers = async(queryParams) => {
    const filter = { role: { $in: ['customer', 'host'] } };
    if (['customer', 'host'].includes(queryParams.role)) {
        filter.role = queryParams.role;
    }
    if (queryParams.isBlocked) filter.isBlocked = queryParams.isBlocked === 'true';

    return paginate(User, filter, queryParams, { select: '-password -refreshToken' });
};

exports.getUserById = async(userId) => {
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) throw new AppError('User not found.', 404);
    return user;
};

/**
 * Approve or reject a host account.
 */
exports.setHostApproval = async(hostId, approved) => {
    const host = await User.findOne({ _id: hostId, role: 'host' });
    if (!host) throw new AppError('Host not found.', 404);

    host.isApproved = approved;
    await host.save({ validateBeforeSave: false });

    sendHostApproval(host.email, approved).catch(() => {});
    return host;
};

/**
 * Block or unblock a user.
 */
exports.setUserBlock = async(userId, blocked) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    if (user.role === 'admin') throw new AppError('Cannot block another admin.', 400);

    user.isBlocked = blocked;
    await user.save({ validateBeforeSave: false });
    return user;
};

/**
 * Soft-delete a user.
 */
exports.deleteUser = async(userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete an admin account.', 400);

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save({ validateBeforeSave: false });
};

// ── Vehicle Management (Admin) ────────────────────────────────────────────────

exports.getAllVehiclesAdmin = async(queryParams) => {
    const filter = {};
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.hostId) filter.host = queryParams.hostId;
    if (queryParams.category) filter.category = queryParams.category;

    return paginate(Vehicle, filter, queryParams, {
        populate: [
            { path: 'host', select: 'name email' },
            { path: 'category', select: 'name' },
        ],
    });
};

exports.removeVehicle = async(vehicleId) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    vehicle.isDeleted = true;
    vehicle.deletedAt = new Date();
    vehicle.status = 'inactive';
    await vehicle.save({ validateBeforeSave: false });
};

// ── Category CRUD ─────────────────────────────────────────────────────────────

exports.getCategories = async() => Category.find().sort('name');

exports.createCategory = async(data) => {
    const existing = await Category.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) throw new AppError('A category with this name already exists.', 409);
    return Category.create(data);
};

exports.updateCategory = async(categoryId, data) => {
    const category = await Category.findByIdAndUpdate(categoryId, data, {
        new: true,
        runValidators: true,
    });
    if (!category) throw new AppError('Category not found.', 404);
    return category;
};

exports.deleteCategory = async(categoryId) => {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError('Category not found.', 404);

    const vehiclesUsing = await Vehicle.countDocuments({ category: categoryId, isDeleted: { $ne: true } });
    if (vehiclesUsing > 0) {
        throw new AppError(`Cannot delete — ${vehiclesUsing} vehicle(s) use this category.`, 400);
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save({ validateBeforeSave: false });
};

// ── Dashboard Analytics ───────────────────────────────────────────────────────

exports.getDashboardStats = async() => {
    const [
        totalUsers,
        totalHosts,
        totalCustomers,
        pendingHosts,
        totalVehicles,
        activeVehicles,
        totalBookings,
        completedBookings,
        cancelledBookings,
        revenueAgg,
    ] = await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'host' }),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'host', isApproved: false }),
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ status: 'active' }),
        Booking.countDocuments(),
        Booking.countDocuments({ bookingStatus: 'completed' }),
        Booking.countDocuments({ bookingStatus: 'cancelled' }),
        Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, serviceFees: { $sum: '$serviceFee' } } },
        ]),
    ]);

    const revenue = revenueAgg[0] || { total: 0, serviceFees: 0 };

    // Bookings per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsByMonth = await Booking.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const platformFees = revenue.serviceFees || 0;
    const hostPayouts = Math.max((revenue.total || 0) - platformFees, 0);

    return {
        users: { total: totalUsers, hosts: totalHosts, customers: totalCustomers, pendingHosts },
        vehicles: { total: totalVehicles, active: activeVehicles },
        bookings: { total: totalBookings, completed: completedBookings, cancelled: cancelledBookings },
        revenue: { total: revenue.total || 0, platformFees, hostPayouts },
        bookingsByMonth,
    };
};
