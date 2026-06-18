const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const { paginate } = require('../utils/paginate');

/**
 * Get detailed earnings report for a host.
 */
exports.getHostEarnings = async(hostId, queryParams) => {
    const filter = { host: hostId, paymentStatus: 'paid' };

    // Optional date range filter
    if (queryParams.startDate || queryParams.endDate) {
        filter.paidAt = {};
        if (queryParams.startDate) filter.paidAt.$gte = new Date(queryParams.startDate);
        if (queryParams.endDate) filter.paidAt.$lte = new Date(queryParams.endDate);
    }

    // Aggregate totals
    const summary = await Booking.aggregate([
        { $match: {...filter, host: require('mongoose').Types.ObjectId.createFromHexString(hostId.toString()) } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$subtotal' }, // host share (no service fee)
                totalBookings: { $sum: 1 },
                avgBookingValue: { $avg: '$subtotal' },
            },
        },
    ]);

    // Paginated list of paid bookings
    const { data: bookings, pagination } = await paginate(Booking, filter, queryParams, {
        populate: [
            { path: 'vehicle', select: 'title' },
            { path: 'customer', select: 'name email' },
        ],
        sort: '-paidAt',
    });

    // Earnings by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const byMonth = await Booking.aggregate([{
            $match: {
                host: require('mongoose').Types.ObjectId.createFromHexString(hostId.toString()),
                paymentStatus: 'paid',
                paidAt: { $gte: twelveMonthsAgo },
            },
        },
        {
            $group: {
                _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
                revenue: { $sum: '$subtotal' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
        summary: summary[0] || { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 },
        byMonth,
        bookings,
        pagination,
    };
};