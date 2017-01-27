'use strict';

const express = require('express');
const errorMiddleware = require('./express/errorresponse');
const getBasePath = require('./express/get-base-path');
const routes = require('./routes');
const log = require('./utils/log');
const logHostname = require('./express/log-hostname');
const morgan = require('morgan');
const raven = require('raven');
const BuildSystem = require('./buildsystem');
const Registry = require('./registry');

module.exports = function createApp(config) {
	if (!config.registry) {
		config.registry = new Registry(config);
	}

	if (!config.buildSystem) {
		config.buildSystem = new BuildSystem(config);
	}

	const app = express();

	app.disable('x-powered-by');

	app.use(require('cors')());
	app.use(raven.middleware.express.requestHandler(log.ravenClient));

	if (config.writeAccessLog === true) {
		// Add logging to Express
		app.use(morgan('combined'));
	}

	app.use(getBasePath);
	app.use(logHostname);

	routes.bundles(app, config);
	routes.demos(app, config);
	routes.files(app, config);
	routes.modules(app, config);
	routes.docs(app, config);
	routes.health(app, config);
	routes.robots(app);

	app.use(errorMiddleware);
	app.use(raven.middleware.express.errorHandler(log.ravenClient));

	return app;
};
