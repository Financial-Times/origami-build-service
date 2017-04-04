'use strict';

const cors = require('cors');
const errorResponse = require('./express/errorresponse');
const logHostname = require('./middleware/log-hostname');
const origamiService = require('@financial-times/origami-service');
const Registry = require('./registry');
const requireAll = require('require-all');

module.exports = buildService;

function buildService(options) {

	options.about = require('../about.json');
	options.registry = new Registry(options);

	const app = origamiService(options);

	app.use(cors());
	app.use(origamiService.middleware.getBasePath());
	app.use(logHostname(options.log));
	mountRoutes(app);
	// TODO replace this with an error sanitizer,
	// and output HTML errors
	app.use(errorResponse);
	// TODO using our own error sanitizer will allow
	// us to handle 404 errors properly and use the
	// Origami Service notFound middleware here
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
