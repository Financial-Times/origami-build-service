'use strict';

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get(/^\/v2\/demos\/[^\/]+\//, compileDemo);

	// Handlers
	function compileDemo(req, res, next) {
		buildSystem.outputBundle('demo', req, res, next);
	}

};
