'use strict';

const cors = require('cors');
const healthChecks = require('./health-checks');
const logHostname = require('./middleware/log-hostname');
const origamiService = require('@financial-times/origami-service');
const Registry = require('./registry');
const requireAll = require('require-all');
const sanitizeErrors = require('./middleware/sanitize-errors');

module.exports = buildService;

function buildService(options) {

	const health = healthChecks(options);
	options.healthCheck = health.checks();
	options.goodToGoTest = health.gtg();
	options.about = require('../about.json');
	options.registry = new Registry(options);

	const app = origamiService(options);

	app.use(cors());
	app.use(origamiService.middleware.getBasePath());
	app.use(logHostname(options.log));
	mountRoutes(app);
	app.use(origamiService.middleware.notFound());
	app.use(sanitizeErrors());
	app.use(origamiService.middleware.errorHandler());

	return app;
};

// NOTE: should this be in Origami Service?
function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
