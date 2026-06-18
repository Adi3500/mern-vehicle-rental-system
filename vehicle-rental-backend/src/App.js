require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/Error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { uploadsRoot } = require('./config/cloudinary');
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const { vehicleRouter, hostVehicleRouter } = require('./routes/vehicle.routes');
const { customerBookingRouter, hostBookingRouter } = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const earningsRoutes = require('./routes/earnings.routes');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. STRIPE WEBHOOK — must use raw body BEFORE express.json()
// ─────────────────────────────────────────────────────────────────────────────
app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    require('./controllers/payment.controller').stripeWebhook
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));

// CORS — allow configured client origin
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true, // allow cookies (refresh token)
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
);

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        stream: { write: (msg) => logger.http(msg.trim()) },
    }));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// NoSQL injection sanitisation
app.use(mongoSanitize());

// Gzip compression
app.use(compression());

// ─────────────────────────────────────────────────────────────────────────────
// 3. API RATE LIMITER (global)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use(
    '/uploads',
    (_req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
        next();
    },
    express.static(uploadsRoot)
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. SWAGGER DOCS
// ─────────────────────────────────────────────────────────────────────────────
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: { persistAuthorization: true },
        customSiteTitle: 'Vehicle Rental API Docs',
    })
);

// Expose raw spec as JSON for Postman import
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ─────────────────────────────────────────────────────────────────────────────
// 5. HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    })
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/host/vehicles', hostVehicleRouter);
app.use('/api/bookings', customerBookingRouter);
app.use('/api/host/bookings', hostBookingRouter);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/host/earnings', earningsRoutes);

// Public categories (no auth)
const Category = require('./models/Category');
const catchAsync = require('./utils/catchAsync');
app.get('/api/categories', catchAsync(async(_req, res) => {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.status(200).json({ status: 'success', data: { categories } });
}));

// ─────────────────────────────────────────────────────────────────────────────
// 7. 404 HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
