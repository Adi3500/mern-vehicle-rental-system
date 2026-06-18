const earningsService = require('../services/earnings.service');
const catchAsync = require('../utils/catchAsync');
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect, restrictTo('host'));

/**
 * @swagger
 * /api/host/earnings:
 *   get:
 *     tags: [Vehicles (Host)]
 *     summary: Get host earnings report
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Earnings summary, monthly breakdown, and booking list
 */
router.get(
    '/',
    catchAsync(async(req, res) => {
        const data = await earningsService.getHostEarnings(req.user._id, req.query);
        res.status(200).json({ status: 'success', data });
    })
);

module.exports = router;