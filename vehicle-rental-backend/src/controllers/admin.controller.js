const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   GET /api/admin/dashboard
 */
exports.getDashboard = catchAsync(async(_req, res) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
});

/**
 * @route   GET /api/admin/users
 */
exports.getAllUsers = catchAsync(async(req, res) => {
    const result = await adminService.getAllUsers(req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   GET /api/admin/users/:id
 */
exports.getUser = catchAsync(async(req, res) => {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
});

/**
 * @route   PUT /api/admin/hosts/:id/approve
 */
exports.approveHost = catchAsync(async(req, res) => {
    const host = await adminService.setHostApproval(req.params.id, true);
    res.status(200).json({ status: 'success', message: 'Host approved.', data: { host } });
});

/**
 * @route   PUT /api/admin/hosts/:id/reject
 */
exports.rejectHost = catchAsync(async(req, res) => {
    const host = await adminService.setHostApproval(req.params.id, false);
    res.status(200).json({ status: 'success', message: 'Host rejected.', data: { host } });
});

/**
 * @route   PUT /api/admin/users/:id/block
 */
exports.blockUser = catchAsync(async(req, res) => {
    const user = await adminService.setUserBlock(req.params.id, true);
    res.status(200).json({ status: 'success', message: 'User blocked.', data: { user } });
});

/**
 * @route   PUT /api/admin/users/:id/unblock
 */
exports.unblockUser = catchAsync(async(req, res) => {
    const user = await adminService.setUserBlock(req.params.id, false);
    res.status(200).json({ status: 'success', message: 'User unblocked.', data: { user } });
});

/**
 * @route   DELETE /api/admin/users/:id
 */
exports.deleteUser = catchAsync(async(req, res) => {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ status: 'success', message: 'User deleted.' });
});

/**
 * @route   GET /api/admin/vehicles
 */
exports.getAllVehicles = catchAsync(async(req, res) => {
    const result = await adminService.getAllVehiclesAdmin(req.query);
    res.status(200).json({ status: 'success', ...result });
});

/**
 * @route   DELETE /api/admin/vehicles/:id
 */
exports.removeVehicle = catchAsync(async(req, res) => {
    await adminService.removeVehicle(req.params.id);
    res.status(200).json({ status: 'success', message: 'Vehicle removed.' });
});

/**
 * @route   GET /api/admin/categories
 */
exports.getCategories = catchAsync(async(_req, res) => {
    const categories = await adminService.getCategories();
    res.status(200).json({ status: 'success', data: { categories } });
});

/**
 * @route   POST /api/admin/categories
 */
exports.createCategory = catchAsync(async(req, res) => {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: { category } });
});

/**
 * @route   PUT /api/admin/categories/:id
 */
exports.updateCategory = catchAsync(async(req, res) => {
    const category = await adminService.updateCategory(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { category } });
});

/**
 * @route   DELETE /api/admin/categories/:id
 */
exports.deleteCategory = catchAsync(async(req, res) => {
    await adminService.deleteCategory(req.params.id);
    res.status(200).json({ status: 'success', message: 'Category deleted.' });
});
