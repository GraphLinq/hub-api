'use strict';

module.exports = function(app) {

    var swaggerJSDoc = require('swagger-jsdoc');

    var swaggerDefinition = {
        //basePath: '/', // Base path (optional)
        swagger: '2.0', // Specification (optional, defaults to swagger: '2.0')
        info: {
            title: 'API Task', // Title (required)
            description: 'Author : jérémy Guyet, jguyet.weoohh@gmail.com',
            version: '1.0.0', // Version (required)
        }
    };

    var options = {
        swaggerDefinition,
        apis: ['./routes.js'], // <-- not in the definition, but in the options
    };

    var swaggerSpec = swaggerJSDoc(options);
    var swaggerUi = require('swagger-ui-express');

    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    app.use('/', swaggerUi.serve);
    app.get('/', swaggerUi.setup(swaggerSpec, {
        explorer: false,
        customJs: 'swaggerHashShortcut.js'
    }));

    // Plugin for swagger UI injection Swagger
    app.get('/swaggerHashShortcut.js', (req, res) => {
        const fs = require('fs');
        res.status(200).send(fs.readFileSync('./plugins/swagger/swaggerHashShortcut.js', { encoding: 'utf-8' }));
    });
};