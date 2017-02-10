'use strict';

const getStaticBundleStream = require('../../../deprecated/static-bundle').getStaticBundleStream;
const metrics = require('../../monitoring/metrics');
const handleDeprecatedRoute = require('../../../deprecated/v1-deprecated');

module.exports = function(app) {

	app.get(/^\/v1\/bundles\/(css|js)/, handleDeprecatedBundle);

	function handleDeprecatedBundle(req, res) {
		// If we have a static cached version of the route, serve it.
		// Otherwise we redirect to a non-deprecated route.
		getStaticBundleStream(req.url, app.origami.options.staticBundlesDirectory)
			.then((bundleStream) => {
				metrics.counter('routes.bundle.deprecated.serve').inc();
				res.type(req.params[0]);
				bundleStream.pipe(res);
			})
			.catch(() => {
				req.url = req.url.replace(`${req.basePath}v1/`, req.basePath);
				handleDeprecatedRoute(req, res);
				metrics.counter('routes.bundle.deprecated.redirect').inc();
			});
	}
};
