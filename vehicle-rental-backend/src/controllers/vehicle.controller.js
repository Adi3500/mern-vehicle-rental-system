const vehicleService = require('../services/vehicle.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   GET /api/vehicles
 * @access  Public
 */
exports.listVehicles = catchAsync(async(req, res) => {
    const result = await vehicleService.listVehicles(req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
exports.getVehicle = catchAsync(async(req, res) => {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json({ status: 'success', data: { vehicle } });
});

/**
 * @route   POST /api/host/vehicles
 * @access  Private (Host)
 */
exports.createVehicle = catchAsync(async(req, res) => {
    const vehicle = await vehicleService.createVehicle(req.user._id, req.body, req.files || {});
    res.status(201).json({ status: 'success', data: { vehicle } });
});

/**
 * @route   PUT /api/host/vehicles/:id
 * @access  Private (Host | Admin)
 */
exports.updateVehicle = catchAsync(async(req, res) => {
    const vehicle = await vehicleService.updateVehicle(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body,
        req.files || {}
    );
    res.status(200).json({ status: 'success', data: { vehicle } });
});

/**
 * @route   DELETE /api/host/vehicles/:id
 * @access  Private (Host | Admin)
 */
exports.deleteVehicle = catchAsync(async(req, res) => {
    await vehicleService.deleteVehicle(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: 'success', message: 'Vehicle deleted successfully.' });
});

/**
 * @route   DELETE /api/host/vehicles/:id/images/:publicId
 * @access  Private (Host)
 */
exports.deleteVehicleImage = catchAsync(async(req, res) => {
    const vehicle = await vehicleService.deleteVehicleImage(
        req.params.id,
        req.query.publicId,
        req.user._id
    );
    res.status(200).json({ status: 'success', data: { vehicle } });
});

/**
 * @route   GET /api/host/vehicles
 * @access  Private (Host)
 */
exports.getHostVehicles = catchAsync(async(req, res) => {
    const result = await vehicleService.getHostVehicles(req.user._id, req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   PATCH /api/host/vehicles/:id/availability
 * @access  Private (Host)
 */
exports.updateAvailability = catchAsync(async(req, res) => {
    const vehicle = await vehicleService.updateAvailability(
        req.params.id,
        req.user._id,
        req.body.unavailableDates
    );
    res.status(200).json({ status: 'success', data: { vehicle } });
});
