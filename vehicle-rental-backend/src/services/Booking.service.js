const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { paginate } = require('../utils/paginate');
const {
    sendBookingConfirmation,
    sendBookingCancellation,
} = require('../utils/email');

const SERVICE_FEE_RATE = 0.10; // 10 % platform fee

/**
 * Calculate the number of days between two dates (minimum 1).
 */
const calcDays = (start, end) => {
    const ms = new Date(end) - new Date(start);
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
};

/**
 * Check whether a vehicle is available for the requested date range.
 * Checks: vehicle unavailableDates AND existing confirmed/pending bookings.
 */
const checkAvailability = async(vehicleId, startDate, endDate, excludeBookingId = null) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.status !== 'active') throw new AppError('This vehicle is not available for booking.', 400);

    // 1. Check vehicle's manually blocked dates
    const blocked = vehicle.unavailableDates.some(
        (d) => new Date(d.startDate) <= new Date(endDate) && new Date(d.endDate) >= new Date(startDate)
    );
    if (blocked) throw new AppError('Vehicle is not available for the selected dates.', 400);

    // 2. Check existing bookings
    const overlap = await Booking.findOne({
        vehicle: vehicleId,
        _id: { $ne: excludeBookingId },
        bookingStatus: { $in: ['pending', 'confirmed'] },
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
    });
    if (overlap) throw new AppError('Vehicle is already booked for the selected dates.', 409);

    return vehicle;
};

/**
 * Create a booking.
 */
exports.createBooking = async(customerId, { vehicleId, startDate, endDate, customerNotes }) => {
    const vehicle = await checkAvailability(vehicleId, startDate, endDate);

    const totalDays = calcDays(startDate, endDate);
    const subtotal = vehicle.pricePerDay * totalDays;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    const totalPrice = subtotal + serviceFee;

    const booking = await Booking.create({
        customer: customerId,
        vehicle: vehicleId,
        host: vehicle.host,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        pricePerDay: vehicle.pricePerDay,
        subtotal,
        serviceFee,
        totalPrice,
        customerNotes,
    });

    await booking.populate([
        { path: 'vehicle', select: 'title images location pricePerDay' },
        { path: 'customer', select: 'name email' },
        { path: 'host', select: 'name email' },
    ]);

    // Notify customer
    sendBookingConfirmation(booking.customer.email, booking).catch(() => {});

    return booking;
};

/**
 * Get a single booking (customer sees own, host sees their vehicle's, admin sees all).
 */
exports.getBookingById = async(bookingId, user) => {
    const booking = await Booking.findById(bookingId)
        .populate('vehicle', 'title images location')
        .populate('customer', 'name email phone')
        .populate('host', 'name email phone');

    if (!booking) throw new AppError('Booking not found.', 404);

    // Access control
    const customerId = booking.customer?._id?.toString() || booking.customer?.toString();
    const hostId = booking.host?._id?.toString() || booking.host?.toString();
    
    const isCustomer = customerId === user._id.toString();
    const isHost = hostId === user._id.toString();
    
    if (user.role !== 'admin' && !isCustomer && !isHost) {
        console.log('REJECTED:', { customerId, hostId, userId: user._id.toString(), hostObj: booking.host });
        throw new AppError('You are not authorized to view this booking.', 403);
    }

    return booking;
};

/**
 * List bookings for a customer.
 */
exports.getMyBookings = async(customerId, queryParams) => {
    const filter = { customer: customerId };
    if (queryParams.status) filter.bookingStatus = queryParams.status;

    return paginate(Booking, filter, queryParams, {
        populate: [
            { path: 'vehicle', select: 'title images location pricePerDay' },
            { path: 'host', select: 'name avatar' },
        ],
    });
};

/**
 * List bookings for a host's vehicles.
 */
exports.getHostBookings = async(hostId, queryParams) => {
    const filter = { host: hostId };
    if (queryParams.status) filter.bookingStatus = queryParams.status;

    return paginate(Booking, filter, queryParams, {
        populate: [
            { path: 'vehicle', select: 'title images' },
            { path: 'customer', select: 'name email phone avatar' },
        ],
    });
};

/**
 * Customer cancels a booking.
 */
exports.cancelBooking = async(bookingId, userId, reason) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.customer.toString() !== userId.toString() && booking.host.toString() !== userId.toString()) {
        throw new AppError('Not authorized to cancel this booking.', 403);
    }
    if (!['pending', 'confirmed'].includes(booking.bookingStatus)) {
        throw new AppError(`Cannot cancel a booking with status '${booking.bookingStatus}'.`, 400);
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    await booking.save();

    await booking.populate('customer', 'email name');
    sendBookingCancellation(booking.customer.email, booking).catch(() => {});

    return booking;
};

/**
 * Host accepts or rejects a booking.
 */
exports.respondToBooking = async(bookingId, hostId, { status, hostNotes }) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.host.toString() !== hostId.toString()) {
        throw new AppError('Not authorized.', 403);
    }
    if (booking.bookingStatus !== 'pending') {
        throw new AppError('Only pending bookings can be accepted or rejected.', 400);
    }

    booking.bookingStatus = status; // 'confirmed' or 'rejected'
    if (hostNotes) booking.hostNotes = hostNotes;
    await booking.save();
    return booking;
};

/**
 * Admin — list all bookings.
 */
exports.getAllBookings = async(queryParams) => {
    const filter = {};
    if (queryParams.status) filter.bookingStatus = queryParams.status;
    if (queryParams.customerId) filter.customer = queryParams.customerId;
    if (queryParams.hostId) filter.host = queryParams.hostId;

    return paginate(Booking, filter, queryParams, {
        populate: [
            { path: 'vehicle', select: 'title' },
            { path: 'customer', select: 'name email' },
            { path: 'host', select: 'name email' },
        ],
    });
};

/**
 * Mark a booking as completed (Host).
 */
exports.completeBooking = async(bookingId, user) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found.', 404);
    
    if (user && user.role !== 'admin' && booking.host.toString() !== user._id.toString()) {
        throw new AppError('Not authorized to complete this booking.', 403);
    }

    if (booking.bookingStatus !== 'confirmed') {
        throw new AppError('Only confirmed bookings can be marked as completed.', 400);
    }

    booking.bookingStatus = 'completed';
    await booking.save();

    // Update vehicle booking count
    await Vehicle.findByIdAndUpdate(booking.vehicle, { $inc: { totalBookings: 1 } });

    // Update host earnings
    const hostShare = booking.subtotal; // platform keeps serviceFee
    await User.findByIdAndUpdate(booking.host, { $inc: { totalEarnings: hostShare } });

    return booking;
};