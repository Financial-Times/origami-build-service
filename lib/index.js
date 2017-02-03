'use strict';

const express = require('express');
const errorMiddleware = require('./express/errorresponse');
const getBasePath = require('./express/get-base-path');
const log = require('./utils/log');
const logHostname = require('./express/log-hostname');
const morgan = require('morgan');
const raven = require('raven');
const Registry = require('./registry');
const requireAll = require('require-all');

module.exports = buildService;

function buildService(options) {

	options.registry = new Registry(options);

	const app = express();

	app.disable('x-powered-by');

	app.use(require('cors')());
	app.use(raven.middleware.express.requestHandler(log.ravenClient));

	// app.use(morgan('combined'));

	app.use(getBasePath);
	// app.use(logHostname);

	app.origami = {
		log: options.log,
		options
	};

	mountRoutes(app);

	app.use(errorMiddleware);
	app.use(raven.middleware.express.errorHandler(log.ravenClient));

	return app;
};

// NOTE: should this be in Origami Service?
function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
