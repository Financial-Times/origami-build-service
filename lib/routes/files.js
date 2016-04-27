'use strict';

const createRouteHandler = require('../express/promisehandler');
const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get(/^\/files\/[^\/]+\//, handleDeprecatedRoute);
	app.get(/^\/v1\/files\/[^\/]+\//, handleDeprecatedRoute);
	app.get(/^\/v2\/files\/[^\/]+\//, createRouteHandler(bundleFile));

	// Handlers
	function bundleFile(req, res) {
		return buildSystem.outputFile(req, res);
	}

};
