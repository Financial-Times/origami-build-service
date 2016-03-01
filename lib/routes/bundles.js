'use strict';

const fs = require('fs');
const metrics = require('../monitoring/metrics');
const path = require('path');
const pfs = require('q-io/fs');
const uniqueid = require('../utils/uniqueid');
const URL = require('url');

const defaultStaticBundlesDirectory = path.resolve(__dirname, '../../deprecated/static-bundles');

module.exports = function(app, config) {
	const buildSystem = config.buildSystem;
	const staticBundlesDirectory = config.staticBundlesDirectory || defaultStaticBundlesDirectory;

	app.get('/bundles/:type', handleDeprecatedRoute);
	app.get('/v1/bundles/:type', handleDeprecatedRoute);
	app.get('/v2/bundles/:type', createBundle);

	function createBundle(req, res, next) {
		buildSystem.outputBundle(req.params.type, req, res, next);
	}

	function handleDeprecatedRoute(req, res) {
		const requestUrl = URL.parse(req.url);
		const requestHash = uniqueid(decodeURI(requestUrl.path), 64);
		const filePath = path.resolve(staticBundlesDirectory, requestHash);

		// If we have a static cached version of the route, serve it.
		// Otherwise we redirect to a non-deprecated route.
		pfs.stat(filePath).then(function(stats) {
			if (!stats.isFile()) {
				throw new Error('Static bundle is not a file');
			}
			metrics.counter('routes.bundle.deprecated.serve').inc();
			res.type(req.params.type);
			fs.createReadStream(filePath).pipe(res);
		}).catch(function() {
			const redirectUrl = '/v2/bundles/' + req.params.type + requestUrl.search;
			const redirectBody = 'This endpoint has been deprecated. You are being redirected to ' + redirectUrl + '\nSee http://build.origami.ft.com/v2/#api-reference for more information.';

			// Note: we can't use `res.redirect` here because it doesn't allow
			// modifications to the response body.
			redirectWithBody(res, 301, redirectUrl, redirectBody);
			metrics.counter('routes.bundle.deprecated.redirect').inc();
		});
	}

	function redirectWithBody(res, statusCode, location, body) {
		res.status(statusCode);
		res.location(location);
		res.type('txt');
		res.send(body);
	}
};
