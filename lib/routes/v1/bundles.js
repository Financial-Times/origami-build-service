'use strict';

const getStaticBundleStream = require('../../../deprecated/static-bundle').getStaticBundleStream;
const metrics = require('../../monitoring/metrics');

module.exports = function(app) {
	const allowedBundleTypes = ['css', 'js'];

	app.param('type', validateBundleType);
	app.get('/v1/bundles/:type', handleDeprecatedBundle);

	function handleDeprecatedBundle(req, res, next) {
		// If we have a static cached version of the route, serve it.
		// Otherwise we redirect to a non-deprecated route.
		getStaticBundleStream(req.url, app.origami.options.staticBundlesDirectory)
			.then((bundleStream) => {
				metrics.counter('routes.bundle.deprecated.serve').inc();
				res.type(req.params.type);
				bundleStream.pipe(res);
			})
			.catch(() => {
				next('route');
				metrics.counter('routes.bundle.deprecated.redirect').inc();
			});
	}

	function validateBundleType(req, res, next, type) {
		if (allowedBundleTypes.includes(type)) {
			next();
		} else {
			next('route');
		}
	}
};
