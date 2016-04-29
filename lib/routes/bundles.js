'use strict';

const getStaticBundleStream = require('../../deprecated/static-bundle').getStaticBundleStream;
const metrics = require('../monitoring/metrics');
const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;
	const allowedBundleTypes = ['css', 'js'];

	app.param('type', validateBundleType);
	app.get('/bundles/:type', handleDeprecatedBundle);
	app.get('/v1/bundles/:type', handleDeprecatedBundle);
	app.get('/v2/bundles/:type', createBundle);

	function createBundle(req, res, next) {
		buildSystem.outputBundle(req.params.type, req, res, next);
	}

	function handleDeprecatedBundle(req, res) {
		// If we have a static cached version of the route, serve it.
		// Otherwise we redirect to a non-deprecated route.
		getStaticBundleStream(req.url, config.staticBundlesDirectory)
			.then((bundleStream) => {
				metrics.counter('routes.bundle.deprecated.serve').inc();
				res.type(req.params.type);
				bundleStream.pipe(res);
			})
			.catch(() => {
				handleDeprecatedRoute(req, res);
				metrics.counter('routes.bundle.deprecated.redirect').inc();
			});
	}

	function validateBundleType(req, res, next, type) {
		if (allowedBundleTypes.indexOf(type) === -1) {
			return next('route');
		}
		next();
	}
};
