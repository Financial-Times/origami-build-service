'use strict';

module.exports = function(app) {
	const buildSystem = app.origami.options.buildSystem;

	// Install routes
	app.get(/^\/v2\/demos\/[^\/]+\//, compileDemo);

	// Handlers
	function compileDemo(req, res, next) {
		buildSystem.outputBundle('demo', req, res, next);
	}

};
