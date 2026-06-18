const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const { buildUploadedFileMeta, destroyUploadedFile } = require('../config/cloudinary');
const { paginate } = require('../utils/paginate');

const normalizeVehiclePayload = (payload = {}) => {
    const normalized = { ...payload };

    if (normalized.location && typeof normalized.location === 'object') {
        const location = { ...normalized.location };
        const rawCoordinates = location.coordinates?.coordinates;

        if (
            Array.isArray(rawCoordinates) &&
            rawCoordinates.length === 2 &&
            rawCoordinates.every((value) => Number.isFinite(Number(value)))
        ) {
            location.coordinates = {
                type: 'Point',
                coordinates: rawCoordinates.map((value) => Number(value)),
            };
        } else {
            delete location.coordinates;
        }

        normalized.location = location;
    }

    if (Array.isArray(normalized.features)) {
        normalized.features = normalized.features
            .map((feature) => String(feature).trim())
            .filter(Boolean);
    }

    return normalized;
};

/**
 * Build a Mongoose filter from query params for vehicle search.
 */
const buildVehicleFilter = (query) => {
    const filter = { status: 'active' };

    if (query.category) filter.category = query.category;
    if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
    if (query.country) filter['location.country'] = new RegExp(query.country, 'i');
    if (query.fuelType) filter.fuelType = query.fuelType;
    if (query.transmission) filter.transmission = query.transmission;
    if (query.minRating) filter.averageRating = { $gte: Number(query.minRating) };

    if (query.minPrice || query.maxPrice) {
        filter.pricePerDay = {};
        if (query.minPrice) filter.pricePerDay.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.pricePerDay.$lte = Number(query.maxPrice);
    }

    if (query.search) {
        filter.title = new RegExp(query.search, 'i');
    }

    // Date availability filter: exclude vehicles with overlapping unavailableDates
    if (query.startDate && query.endDate) {
        const start = new Date(query.startDate);
        const end = new Date(query.endDate);
        filter.unavailableDates = {
            $not: {
                $elemMatch: {
                    startDate: { $lte: end },
                    endDate: { $gte: start },
                },
            },
        };
    }

    return filter;
};

/**
 * List all vehicles with filtering, sorting, pagination.
 */
exports.listVehicles = async(queryParams) => {
    const filter = buildVehicleFilter(queryParams);
    const sortMap = {
        pricePerDay: 'pricePerDay',
        '-pricePerDay': '-pricePerDay',
        '-averageRating': '-averageRating',
        '-createdAt': '-createdAt',
        createdAt: 'createdAt',
    };
    const sort = sortMap[queryParams.sort] || '-createdAt';

    return paginate(Vehicle, filter, queryParams, {
        sort,
        populate: [
            { path: 'category', select: 'name icon' },
            { path: 'host', select: 'name avatar averageRating' },
        ],
    });
};

/**
 * Get a single vehicle by ID.
 */
exports.getVehicleById = async(vehicleId) => {
    const vehicle = await Vehicle.findById(vehicleId)
        .populate('category', 'name icon')
        .populate('host', 'name avatar phone totalEarnings');

    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    return vehicle;
};

/**
 * Create a new vehicle (Host only).
 */
exports.createVehicle = async(hostId, data, files = []) => {
    const normalizedData = normalizeVehiclePayload(data);
    const images = files.map((file) => buildUploadedFileMeta(file, 'vehicles'));

    const vehicle = await Vehicle.create({...normalizedData, host: hostId, images });
    return vehicle;
};

/**
 * Update an existing vehicle. Only the owning host (or admin) may update.
 */
exports.updateVehicle = async(vehicleId, requesterId, requesterRole, updates, files = []) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    if (requesterRole !== 'admin' && vehicle.host.toString() !== requesterId.toString()) {
        throw new AppError('You are not authorized to update this vehicle.', 403);
    }

    const normalizedUpdates = normalizeVehiclePayload(updates);

    // Append new images if uploaded
    if (files.length > 0) {
        const newImages = files.map((file) => buildUploadedFileMeta(file, 'vehicles'));
        normalizedUpdates.images = [...vehicle.images, ...newImages];
    }

    Object.assign(vehicle, normalizedUpdates);
    await vehicle.save({ runValidators: true });
    return vehicle;
};

/**
 * Delete (soft) a vehicle. Remove images from Cloudinary.
 */
exports.deleteVehicle = async(vehicleId, requesterId, requesterRole) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    if (requesterRole !== 'admin' && vehicle.host.toString() !== requesterId.toString()) {
        throw new AppError('You are not authorized to delete this vehicle.', 403);
    }

    // Check for active bookings
    const activeBooking = await Booking.findOne({
        vehicle: vehicleId,
        bookingStatus: { $in: ['pending', 'confirmed'] },
    });
    if (activeBooking) throw new AppError('Cannot delete a vehicle with active bookings.', 400);

    // Delete images from Cloudinary
    await Promise.allSettled(vehicle.images.map((img) => destroyUploadedFile(img.publicId)));

    vehicle.isDeleted = true;
    vehicle.deletedAt = new Date();
    vehicle.status = 'inactive';
    await vehicle.save({ validateBeforeSave: false });
};

/**
 * Delete a specific image from a vehicle.
 */
exports.deleteVehicleImage = async(vehicleId, imagePublicId, hostId) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.host.toString() !== hostId.toString()) {
        throw new AppError('Not authorized.', 403);
    }
    if (!imagePublicId) {
        throw new AppError('Image identifier is required.', 400);
    }
    if (vehicle.images.length <= 1) {
        throw new AppError('A vehicle must have at least one image.', 400);
    }

    await destroyUploadedFile(imagePublicId);
    vehicle.images = vehicle.images.filter((img) => img.publicId !== imagePublicId);
    await vehicle.save({ validateBeforeSave: false });
    return vehicle;
};

/**
 * Get vehicles listed by a specific host.
 */
exports.getHostVehicles = async(hostId, queryParams) => {
    const filter = { host: hostId };
    if (queryParams.status) filter.status = queryParams.status;

    return paginate(Vehicle, filter, queryParams, {
        populate: { path: 'category', select: 'name icon' },
    });
};

/**
 * Update availability (block/unblock dates).
 */
exports.updateAvailability = async(vehicleId, hostId, unavailableDates) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.host.toString() !== hostId.toString()) throw new AppError('Not authorized.', 403);

    vehicle.unavailableDates = unavailableDates;
    await vehicle.save({ validateBeforeSave: false });
    return vehicle;
};
