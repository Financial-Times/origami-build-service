'use strict';

const createRouteHandler = require('../express/promisehandler');
const handleDeprecatedRoute = require('../express/v1-deprecated');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get(/^\/modules\/[^\/]+$/, handleDeprecatedRoute);
	app.get(/^\/v1\/modules\/[^\/]+$/, handleDeprecatedRoute);
	app.get(/^\/v2\/modules\/[^\/]+$/, createRouteHandler(moduleMetadata));

	// Handlers
	function moduleMetadata(req, res) {
		return buildSystem.outputModuleMetadata(req, res);
	}

};
