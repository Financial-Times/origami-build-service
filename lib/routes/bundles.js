'use strict';

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	// Install routes
	app.get('/bundles/js', bundleJs);
	app.get('/v1/bundles/js', bundleJs);
	app.get('/v2/bundles/js', bundleJs);

	app.get('/bundles/css', bundleCss);
	app.get('/v1/bundles/css', bundleCss);
	app.get('/v2/bundles/css', bundleCssUsingObt);

	// Handlers
	function bundleJs(req, res, next) {
		buildSystem.outputBundle('js', req, res, next);
	}

	function bundleCss(req, res, next) {
		buildSystem.outputBundle('css', req, res, next);
	}

	function bundleCssUsingObt(req, res, next) {
		req.useobt = true;
		bundleCss(req, res, next);
	}

};
