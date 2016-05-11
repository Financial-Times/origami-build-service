'use strict';

const createRouteHandler = require('../express/promisehandler');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get(/^\/modules\/[^\/]+$/, createRouteHandler(moduleMetadata));
	app.get(/^\/v1\/modules\/[^\/]+$/, createRouteHandler(moduleMetadata));
	app.get(/^\/v2\/modules\/[^\/]+$/, createRouteHandler(moduleMetadata));

	// Handlers
	function moduleMetadata(req, res) {
		return buildSystem.outputModuleMetadata(req, res);
	}

};
