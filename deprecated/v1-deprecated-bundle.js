'use strict';

const {getStaticBundleStream} = require('./static-bundle');
const handleDeprecatedRoute = require('./v1-deprecated');

module.exports = function handleDeprecatedBundle(req, res) {
	const { metrics } = req.app.ft;
	// If we have a static cached version of the route, serve it.
	// Otherwise we redirect to a non-deprecated route.
	getStaticBundleStream(
		req.url,
		req.app.ft.options.staticBundlesDirectory
	)
		.then(bundleStream => {
			metrics.count('routes.bundle.deprecated.serve', 1);
			res.type(req.params[0]);
			bundleStream.pipe(res);
		})
		.catch(() => {
			req.url = req.url.replace(`${req.basePath}v1/`, req.basePath);
			handleDeprecatedRoute(req, res);
			metrics.count('routes.bundle.deprecated.redirect', 1);
		});
};
