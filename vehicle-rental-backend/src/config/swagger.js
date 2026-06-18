const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vehicle Rental System API',
            version: '1.0.0',
            description: 'Production-ready REST API for a multi-role Vehicle Rental Platform',
            contact: { name: 'API Support', email: 'support@vehiclerental.com' },
        },
        servers: [
            { url: `http://localhost:${process.env.PORT || 5000}`, description: 'Development' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;