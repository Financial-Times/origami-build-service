'use strict';

const getStaticBundleStream = require('../../deprecated/static-bundle').getStaticBundleStream;
const metrics = require('../monitoring/metrics');
const redirectWithBody = require('../express/redirect-with-body');
const URL = require('url');
const hostnames = require('../utils/hostnames');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;

	app.get('/bundles/:type', handleDeprecatedRoute);
	app.get('/v1/bundles/:type', handleDeprecatedRoute);
	app.get('/v2/bundles/:type', createBundle);

	function createBundle(req, res, next) {
		buildSystem.outputBundle(req.params.type, req, res, next);
	}

	function handleDeprecatedRoute(req, res) {
		// If we have a static cached version of the route, serve it.
		// Otherwise we redirect to a non-deprecated route.
		getStaticBundleStream(req.url, config.staticBundlesDirectory)
			.then((bundleStream) => {
				metrics.counter('routes.bundle.deprecated.serve').inc();
				res.type(req.params.type);
				bundleStream.pipe(res);
			})
			.catch(() => {
				const redirectUrl = '/v2/bundles/' + req.params.type + URL.parse(req.url).search;
				const redirectBody = 'This endpoint has been deprecated. You are being redirected to ' + redirectUrl + '\nSee https://' + hostnames.preferred + '/v2/#api-reference for more information.';

				// Note: we can't use `res.redirect` here because it doesn't allow
				// modifications to the response body.
				res.type('txt');
				redirectWithBody(res, 301, redirectUrl, redirectBody);
				metrics.counter('routes.bundle.deprecated.redirect').inc();
			});
	}
};
