'use strict';

const express = require('express');
const errorMiddleware = require('./express/errorresponse');
const getBasePath = require('./express/get-base-path');
const routes = require('./routes');
const log = require('./utils/log');
const morgan = require('morgan');
const raven = require('raven');
const url = require('url');

module.exports = function createApp(config) {
	const app = express();

	app.disable('x-powered-by');

	app.use(require('cors')());
	app.use(raven.middleware.express.requestHandler(log.ravenClient));

	if (config.writeAccessLog === true) {
		// Add logging to Express
		app.use(morgan('combined'));
	}

	app.use(getBasePath);
	app.use((request, response, next) => {
		const originalUrl = request.headers['ft-original-url'];
		let hostname;
		if (originalUrl) {
			hostname = url.parse(originalUrl).hostname;
		} else {
			hostname = 'unknown/direct'
		}
		log.info(`BUILD-SERVICE-HOSTNAME: hostname=${hostname}`);
		next();
	});

	routes.bundles(app, config);
	routes.demos(app, config);
	routes.files(app, config);
	routes.modules(app, config);
	routes.docs(app, config);
	routes.health(app, { healthMonitor: config.healthMonitor || false });
	routes.robots(app);

	app.use(errorMiddleware);
	app.use(raven.middleware.express.errorHandler(log.ravenClient));

	return app;
};
