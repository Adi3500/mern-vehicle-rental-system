const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 8 no longer needs useNewUrlParser / useUnifiedTopology
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Graceful disconnect
const disconnectDB = async() => {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };